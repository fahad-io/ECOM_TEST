import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { Order, OrderDocument, OrderItem } from './schemas/order.schema';

export interface CreateOrderData {
  user: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: Order['shippingAddress'];
  paymentIntentId: string | null;
  paymentStatus: 'mock' | 'paid';
}

/** The only place that touches the Order model. */
@Injectable()
export class OrdersRepository {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
  ) {}

  create(data: CreateOrderData): Promise<OrderDocument> {
    return this.model.create({
      ...data,
      user: new Types.ObjectId(data.user),
    });
  }

  findByUser(userId: string): Promise<OrderDocument[]> {
    return this.model
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  findById(id: string): Promise<OrderDocument | null> {
    return this.model.findById(id).exec();
  }

  findAll(status?: OrderStatus): Promise<OrderDocument[]> {
    const filter = status ? { status } : {};
    return this.model.find(filter).sort({ createdAt: -1 }).exec();
  }

  // --- analytics helpers (used by the admin dashboard) ---

  countByStatus(): Promise<{ _id: OrderStatus; count: number }[]> {
    return this.model
      .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .exec();
  }

  /** Sum of `total` for orders that count as revenue (exclude cancelled). */
  totalSales(): Promise<{ total: number }[]> {
    return this.model
      .aggregate([
        { $match: { status: { $ne: OrderStatus.Cancelled } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ])
      .exec();
  }
}
