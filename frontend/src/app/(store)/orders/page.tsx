'use client';

import RequireAuth from '@/components/RequireAuth';
import OrdersScreen from './OrdersScreen';

/**
 * `/orders` — the customer's order history. Orders are owner-scoped server-side,
 * so the route is bearer-guarded; unauthenticated visitors go to
 * `/login?from=/orders`.
 */
export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersScreen />
    </RequireAuth>
  );
}
