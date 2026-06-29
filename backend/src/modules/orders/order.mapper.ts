import { OrderStatus } from '../../common/enums/order-status.enum';
import { OrderDocument } from './schemas/order.schema';

export interface OrderItemDto {
  product: string;
  name: string;
  price: number;
  qty: number;
  size: string | null;
}

export interface OrderDto {
  id: string;
  items: OrderItemDto[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    email: string;
    street: string;
    city: string;
    postalCode: string;
  };
  paymentStatus: 'mock' | 'paid';
  createdAt: Date;
}

/** Public shape of an order. Used for both customer and admin views. */
export function toOrderDto(o: OrderDocument): OrderDto {
  return {
    id: o.id as string,
    items: o.items.map((i) => ({
      product: i.product?.toString(),
      name: i.name,
      price: i.price,
      qty: i.qty,
      size: i.size ?? null,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    status: o.status,
    shippingAddress: {
      fullName: o.shippingAddress.fullName,
      email: o.shippingAddress.email,
      street: o.shippingAddress.street,
      city: o.shippingAddress.city,
      postalCode: o.shippingAddress.postalCode,
    },
    paymentStatus: o.paymentStatus,
    createdAt: (o as unknown as { createdAt: Date }).createdAt,
  };
}
