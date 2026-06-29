'use client';

import RequireAuth from '@/components/RequireAuth';
import OrderConfirmedScreen from './OrderConfirmedScreen';

/**
 * Client guard wrapper for the order-confirmed screen. The order is owner-scoped
 * server-side, so the route additionally requires an authenticated session.
 */
export default function RequireAuthOrderConfirmed({ orderId }: { orderId: string }) {
  return (
    <RequireAuth>
      <OrderConfirmedScreen orderId={orderId} />
    </RequireAuth>
  );
}
