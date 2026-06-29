import { baseApi } from './baseApi';
import type { OrderStatus } from '@/theme/tokens';

/**
 * A single line of an order. Prices are snapshotted server-side at order
 * creation (per the business rules), so `price` is the unit price paid — never
 * recomputed client-side. `product` is the product id (string), not populated.
 */
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  qty: number;
  size: string | null;
}

/** Shipping address captured at checkout (Contact + Shipping sections). */
export interface ShippingAddress {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
}

/**
 * `Order` as returned by `GET /orders`, `GET /orders/:id`, and `POST /orders`.
 * Totals are authoritative server values; `status` is the lowercase enum that
 * drives the `StatusChip`.
 */
export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentStatus: 'mock' | 'paid';
  createdAt: string;
}

/** Body for `POST /orders`. The cart is read server-side; only the address and
 * (optionally) the confirmed Stripe PaymentIntent id are sent. */
export interface CreateOrderBody {
  shippingAddress: ShippingAddress;
  paymentIntentId?: string;
}

/**
 * Order endpoints injected on the shared `baseApi`. Every route is
 * bearer-guarded and owner-scoped to the token's user.
 *
 * - `createOrder` builds the order from the user's cart (which the backend
 *   clears) and decrements stock; on success it invalidates both `Cart` (so the
 *   Navbar count + cart page re-sync) and `Orders` (so the history list shows
 *   the new order).
 * - `getMyOrders` / `getOrder` provide `Orders` tags so they refetch after a
 *   new order is placed.
 */
export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation<Order, CreateOrderBody>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Cart', id: 'CART' },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
    getMyOrders: build.query<Order[], void>({
      query: () => ({ url: '/orders' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({ type: 'Orders' as const, id: o.id })),
              { type: 'Orders' as const, id: 'LIST' },
            ]
          : [{ type: 'Orders' as const, id: 'LIST' }],
    }),
    getOrder: build.query<Order, string>({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Orders', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
} = ordersApi;
