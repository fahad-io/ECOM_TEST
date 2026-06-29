/**
 * Money rules from the MARL design, in one place so the cart and the order
 * service compute totals identically (the server is the source of truth).
 */
export const FREE_SHIPPING_THRESHOLD = 150;
export const FLAT_SHIPPING = 12;

/** Flat $12 shipping, free over $150, and $0 for an empty cart. */
export function computeShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

export function computeTotals(subtotal: number): {
  subtotal: number;
  shipping: number;
  total: number;
} {
  const shipping = computeShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}
