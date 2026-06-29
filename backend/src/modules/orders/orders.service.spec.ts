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
    const service = new OrdersService(
      orders as never,
      carts as never,
      products as never,
    );
    return { service, carts, products, orders };
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
});
