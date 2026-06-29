import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
} from '../../common/enums/order-status.enum';
import { OrderDto, toOrderDto } from '../orders/order.mapper';
import { OrdersRepository } from '../orders/orders.repository';

@Injectable()
export class AdminOrdersService {
  constructor(private readonly orders: OrdersRepository) {}

  async listAll(status?: OrderStatus): Promise<OrderDto[]> {
    const orders = await this.orders.findAll(status);
    return orders.map(toOrderDto);
  }

  async updateStatus(id: string, next: OrderStatus): Promise<OrderDto> {
    const order = await this.orders.findById(id).catch(() => null);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === next) {
      return toOrderDto(order); // idempotent no-op
    }
    const allowed = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot move an order from "${order.status}" to "${next}"`,
      );
    }
    const updated = await this.orders.updateStatus(id, next);
    return toOrderDto(updated ?? order);
  }
}
