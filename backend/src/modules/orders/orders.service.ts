import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { computeTotals } from '../../common/pricing';
import { CartRepository } from '../cart/cart.repository';
import { ProductsRepository } from '../products/products.repository';
import { ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDto, toOrderDto } from './order.mapper';
import { OrdersRepository } from './orders.repository';
import { OrderItem } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orders: OrdersRepository,
    private readonly carts: CartRepository,
    private readonly products: ProductsRepository,
  ) {}

  /**
   * Creates an order from the user's cart with full integrity:
   *  - prices are snapshotted server-side (client totals are never trusted)
   *  - stock is checked, then decremented atomically with compare-and-set
   *  - a partial failure (concurrent buyer) rolls back already-applied decrements
   *  - the cart is cleared only after the order is persisted
   */
  async createFromCart(userId: string, dto: CreateOrderDto): Promise<OrderDto> {
    const cart = await this.carts.findByUser(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty');
    }

    const ids = cart.items.map((i) => i.product.toString());
    const products = await this.products.findByIds(ids);
    const byId = new Map<string, ProductDocument>(
      products.map((p) => [p.id as string, p]),
    );

    // 1) Build server-trusted line items and pre-check stock.
    const lines: OrderItem[] = [];
    let subtotal = 0;
    for (const item of cart.items) {
      const product = byId.get(item.product.toString());
      if (!product) {
        throw new ConflictException('A product in your cart is no longer available');
      }
      if (item.qty > product.stock) {
        throw new ConflictException(
          `Not enough stock for ${product.name} (only ${product.stock} left)`,
        );
      }
      lines.push({
        product: product._id as never,
        name: product.name,
        price: product.price, // snapshot of the current server price
        qty: item.qty,
        size: item.size ?? null,
      });
      subtotal += product.price * item.qty;
    }

    // 2) Decrement stock atomically; roll back on any concurrent shortfall.
    const applied: { id: string; qty: number }[] = [];
    for (const line of lines) {
      const id = line.product.toString();
      const ok = await this.products.decrementStockIfAvailable(id, line.qty);
      if (!ok) {
        await this.rollback(applied);
        throw new ConflictException(
          `Not enough stock for ${line.name} — it just sold out`,
        );
      }
      applied.push({ id, qty: line.qty });
    }

    // 3) Persist the order, then clear the cart.
    const totals = computeTotals(subtotal);
    let order;
    try {
      order = await this.orders.create({
        user: userId,
        items: lines,
        ...totals,
        shippingAddress: dto.shippingAddress,
        paymentIntentId: dto.paymentIntentId ?? null,
        paymentStatus: dto.paymentIntentId ? 'paid' : 'mock',
      });
    } catch (err) {
      // Don't leave stock decremented if the write failed.
      await this.rollback(applied);
      throw err;
    }

    await this.carts.clear(userId);
    return toOrderDto(order);
  }

  async getMyOrders(userId: string): Promise<OrderDto[]> {
    const orders = await this.orders.findByUser(userId);
    return orders.map(toOrderDto);
  }

  /** Owner-only single order view; admins read all orders via the admin module. */
  async getOneForUser(userId: string, id: string): Promise<OrderDto> {
    const order = await this.orders.findById(id).catch(() => null);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.user.toString() !== userId) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return toOrderDto(order);
  }

  private async rollback(applied: { id: string; qty: number }[]): Promise<void> {
    for (const a of applied) {
      await this.products.incrementStock(a.id, a.qty);
    }
  }
}
