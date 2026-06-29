import { loadStripe, type Stripe } from '@stripe/stripe-js';

/**
 * `loadStripe` must be called once at module scope (not per render) so the
 * Stripe.js script is fetched a single time and the resulting promise is shared
 * across the app. The publishable key is a public, client-safe value.
 *
 * If the key is absent the promise resolves to `null`; the checkout flow only
 * mounts `<Elements>` when a real `clientSecret` exists (i.e. not mock mode),
 * so a missing key degrades to the mock path rather than crashing.
 */
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise: Promise<Stripe | null> = publishableKey
  ? loadStripe(publishableKey)
  : Promise.resolve(null);
