'use client';

import RequireAuth from '@/components/RequireAuth';
import OrderDetailScreen from './OrderDetailScreen';

/**
 * Client guard wrapper for the single-order view. The order is owner-scoped
 * server-side, so the route additionally requires an authenticated session.
 */
export default function RequireAuthOrderDetail({ orderId }: { orderId: string }) {
  return (
    <RequireAuth>
      <OrderDetailScreen orderId={orderId} />
    </RequireAuth>
  );
}
