import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrdersService } from './orders.service';

/**
 * Unit tests for the order-integrity logic with all repositories mocked, so we
 * can drive the tricky paths (over-stock, price snapshot, rollback) that are
 * hard to trigger end-to-end.
 */
describe('OrdersService.createFromCart', () => {
  const ADDR = {
    fullName: 'Alex Rivera',
    email: 'alex@example.com',
    street: '12 Linden St',
    city: 'London',
    postalCode: 'EC1A 1BB',
  };

  // A cart line whose product field stringifies to `id`.
  const cartItem = (id: string, qty: number, size: string | null = null) => ({
    product: { toString: () => id },
    qty,
    size,
  });

  // A product doc with the fields the service reads.
  const product = (id: string, price: number, stock: number, name = id) => ({
    _id: id,
    id,
    name,
    price,
    stock,
  });

  function makeService(opts: {
    cartItems: ReturnType<typeof cartItem>[] | null;
    products: ReturnType<typeof product>[];
    decrementResults?: boolean[]; // per-call results for decrementStockIfAvailable
    stripe?: { enabled?: boolean; intent?: unknown }; // for payment verification
  }) {
    const decrementResults = [...(opts.decrementResults ?? [])];
    const carts = {
      findByUser: jest.fn().mockResolvedValue(
        opts.cartItems === null ? null : { items: opts.cartItems },
      ),
      clear: jest.fn().mockResolvedValue(undefined),
    };
    const products = {
      findByIds: jest.fn().mockResolvedValue(opts.products),
      decrementStockIfAvailable: jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            decrementResults.length ? decrementResults.shift() : true,
          ),
        ),
      incrementStock: jest.fn().mockResolvedValue(undefined),
    };
    const orders = {
      create: jest.fn().mockImplementation((data) =>
        Promise.resolve({
          id: 'order1',
          items: data.items,
          subtotal: data.subtotal,
          shipping: data.shipping,
          total: data.total,
          status: 'pending',
          shippingAddress: data.shippingAddress,
          paymentStatus: data.paymentStatus,
          createdAt: new Date(0),
        }),
      ),
    };
    // Stripe disabled by default -> orders record paymentStatus 'mock'.
    const stripe = {
      enabled: opts.stripe?.enabled ?? false,
      retrievePaymentIntent: jest
        .fn()
        .mockResolvedValue(opts.stripe?.intent ?? null),
    };
    const service = new OrdersService(
      orders as never,
      carts as never,
      products as never,
      stripe as never,
    );
    return { service, carts, products, orders, stripe };
  }

  it('rejects an empty cart with 400', async () => {
    const { service } = makeService({ cartItems: null, products: [] });
    await expect(
      service.createFromCart('u1', { shippingAddress: ADDR }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects ordering more than stock (409) before any decrement', async () => {
    const { service, products } = makeService({
      cartItems: [cartItem('p1', 5)],
      products: [product('p1', 28, 2, 'Tee')], // only 2 in stock
    });
    await expect(
      service.createFromCart('u1', { shippingAddress: ADDR }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(products.decrementStockIfAvailable).not.toHaveBeenCalled();
  });

  it('snapshots the SERVER price and totals, decrements stock, clears the cart', async () => {
    const { service, products, carts, orders } = makeService({
      cartItems: [cartItem('p1', 2, 'M')],
      products: [product('p1', 28, 10, 'Everyday Cotton Tee')],
    });
    const result = await service.createFromCart('u1', { shippingAddress: ADDR });

    // price taken from the product, not the client; totals via pricing helper.
    expect(result.items[0]).toMatchObject({ name: 'Everyday Cotton Tee', price: 28, qty: 2 });
    expect(result.subtotal).toBe(56);
    expect(result.shipping).toBe(12);
    expect(result.total).toBe(68);
    expect(products.decrementStockIfAvailable).toHaveBeenCalledWith('p1', 2);
    expect(carts.clear).toHaveBeenCalledWith('u1');
    expect(orders.create).toHaveBeenCalledTimes(1);
  });

  it('rolls back an applied decrement when a later line sells out (409)', async () => {
    const { service, products, orders } = makeService({
      cartItems: [cartItem('p1', 1), cartItem('p2', 1)],
      products: [product('p1', 50, 10, 'A'), product('p2', 50, 10, 'B')],
      decrementResults: [true, false], // p1 succeeds, p2 fails (raced)
    });
    await expect(
      service.createFromCart('u1', { shippingAddress: ADDR }),
    ).rejects.toBeInstanceOf(ConflictException);

    // p1's decrement must be compensated; the order must not be created.
    expect(products.incrementStock).toHaveBeenCalledWith('p1', 1);
    expect(products.incrementStock).toHaveBeenCalledTimes(1);
    expect(orders.create).not.toHaveBeenCalled();
  });

  it('records paymentStatus "mock" when Stripe is disabled (even with an intent id)', async () => {
    const { service, orders } = makeService({
      cartItems: [cartItem('p1', 1)],
      products: [product('p1', 40, 10)],
      stripe: { enabled: false },
    });
    const result = await service.createFromCart('u1', {
      shippingAddress: ADDR,
      paymentIntentId: 'anything',
    });
    expect(result).toBeDefined();
    expect(orders.create.mock.calls[0][0].paymentStatus).toBe('mock');
  });

  it('marks "paid" only when Stripe verifies the intent (status + amount)', async () => {
    // total = 40 (subtotal) + 12 shipping = 52 -> 5200 cents
    const { service, orders, stripe } = makeService({
      cartItems: [cartItem('p1', 1)],
      products: [product('p1', 40, 10)],
      stripe: {
        enabled: true,
        intent: { status: 'succeeded', amount: 5200, metadata: { userId: 'u1' } },
      },
    });
    const result = await service.createFromCart('u1', {
      shippingAddress: ADDR,
      paymentIntentId: 'pi_123',
    });
    expect(stripe.retrievePaymentIntent).toHaveBeenCalledWith('pi_123');
    expect(result.total).toBe(52);
    expect(orders.create.mock.calls[0][0].paymentStatus).toBe('paid');
  });

  it('rejects (400) and does NOT decrement stock when the intent amount mismatches', async () => {
    const { service, products, orders } = makeService({
      cartItems: [cartItem('p1', 1)],
      products: [product('p1', 40, 10)],
      stripe: {
        enabled: true,
        intent: { status: 'succeeded', amount: 100, metadata: { userId: 'u1' } }, // wrong amount
      },
    });
    await expect(
      service.createFromCart('u1', {
        shippingAddress: ADDR,
        paymentIntentId: 'pi_123',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(products.decrementStockIfAvailable).not.toHaveBeenCalled();
    expect(orders.create).not.toHaveBeenCalled();
  });
});
