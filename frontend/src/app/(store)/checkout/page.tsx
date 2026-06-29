'use client';

import RequireAuth from '@/components/RequireAuth';
import CheckoutScreen from './CheckoutScreen';

/**
 * `/checkout` — Contact + Shipping + Payment, with Stripe Elements. Bearer-guarded
 * (cart, payment-intent and order creation are all per-user), so unauthenticated
 * visitors are sent to `/login?from=/checkout`.
 */
export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutScreen />
    </RequireAuth>
  );
}
