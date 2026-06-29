'use client';

import RequireAuth from '@/components/RequireAuth';
import CartScreen from './CartScreen';

/**
 * `/cart` — the shopping bag. The cart is per-user and bearer-guarded, so the
 * route is wrapped in `RequireAuth`; unauthenticated visitors are sent to
 * `/login?from=/cart` and returned here after signing in.
 */
export default function CartPage() {
  return (
    <RequireAuth>
      <CartScreen />
    </RequireAuth>
  );
}
