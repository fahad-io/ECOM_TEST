import { baseApi } from './baseApi';

/**
 * Response from `POST /checkout/payment-intent`. The amount is derived
 * server-side from the user's cart total (never sent by the client).
 *
 * Two shapes, both handled by the checkout flow:
 * - real Stripe: `{ mock: false, clientSecret: '<secret>', paymentIntentId, amount }`
 *   → confirm with Stripe Elements before placing the order.
 * - mock fallback (backend Stripe key absent): `{ mock: true, clientSecret: null,
 *   paymentIntentId, amount }` → skip Stripe, place the order directly.
 */
export interface PaymentIntentResponse {
  mock: boolean;
  amount: number;
  paymentIntentId: string;
  clientSecret: string | null;
}

/**
 * Checkout endpoints injected on the shared `baseApi`. `createPaymentIntent` is
 * a mutation (it has the side effect of creating a Stripe intent) and is
 * bearer-guarded — it reads the caller's cart server-side. It intentionally
 * does not invalidate any tags; the order placement does that.
 */
export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createPaymentIntent: build.mutation<PaymentIntentResponse, void>({
      query: () => ({ url: '/checkout/payment-intent', method: 'POST', body: {} }),
    }),
  }),
  overrideExisting: false,
});

export const { useCreatePaymentIntentMutation } = checkoutApi;
