import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '../../common/enums/role.enum';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderDto, toOrderDto } from '../orders/order.mapper';
import { OrdersRepository } from '../orders/orders.repository';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersRepository } from '../users/users.repository';

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  orderCount: number;
  totalSpent: number;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  stats: {
    orderCount: number;
    totalSpent: number;
    itemsPurchased: number;
    lastOrderAt: Date | null;
  };
  orders: OrderDto[];
}

const createdAt = (u: UserDocument): Date =>
  (u as unknown as { createdAt: Date }).createdAt;

@Injectable()
export class AdminCustomersService {
  constructor(
    private readonly users: UsersRepository,
    private readonly orders: OrdersRepository,
  ) {}

  /** All customers with their order count + money spent (joined in memory). */
  async list(): Promise<CustomerListItem[]> {
    const [customers, stats] = await Promise.all([
      this.users.findCustomers(),
      this.orders.statsByUser(),
    ]);
    const byUser = new Map(stats.map((s) => [String(s._id), s]));
    return customers.map((u) => {
      const s = byUser.get(u.id as string);
      return {
        id: u.id as string,
        name: u.name,
        email: u.email,
        createdAt: createdAt(u),
        orderCount: s?.orderCount ?? 0,
        totalSpent: s?.totalSpent ?? 0,
      };
    });
  }

  /** One customer: profile, aggregate stats, and their full order history. */
  async detail(id: string): Promise<CustomerDetail> {
    const user = await this.users.findById(id).catch(() => null);
    if (!user) {
      throw new NotFoundException('Customer not found');
    }
    const orders = await this.orders.findByUser(id);
    const counted = orders.filter((o) => o.status !== OrderStatus.Cancelled);
    const totalSpent = counted.reduce((sum, o) => sum + o.total, 0);
    const itemsPurchased = counted.reduce(
      (sum, o) => sum + o.items.reduce((a, i) => a + i.qty, 0),
      0,
    );
    return {
      id: user.id as string,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: createdAt(user),
      stats: {
        orderCount: orders.length,
        totalSpent,
        itemsPurchased,
        lastOrderAt: orders.length
          ? (orders[0] as unknown as { createdAt: Date }).createdAt
          : null,
      },
      orders: orders.map(toOrderDto),
    };
  }
}
