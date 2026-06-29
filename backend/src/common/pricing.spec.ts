import {
  computeShipping,
  computeTotals,
  FLAT_SHIPPING,
  FREE_SHIPPING_THRESHOLD,
} from './pricing';

describe('pricing', () => {
  describe('computeShipping', () => {
    it('is $0 for an empty cart (subtotal 0)', () => {
      expect(computeShipping(0)).toBe(0);
    });

    it('charges the flat fee below the free threshold', () => {
      expect(computeShipping(1)).toBe(FLAT_SHIPPING);
      expect(computeShipping(FREE_SHIPPING_THRESHOLD)).toBe(FLAT_SHIPPING);
    });

    it('is free strictly above the threshold', () => {
      expect(computeShipping(FREE_SHIPPING_THRESHOLD + 1)).toBe(0);
      expect(computeShipping(1000)).toBe(0);
    });
  });

  describe('computeTotals', () => {
    it('adds shipping to the subtotal under the threshold', () => {
      expect(computeTotals(56)).toEqual({
        subtotal: 56,
        shipping: 12,
        total: 68,
      });
    });

    it('waives shipping over the threshold', () => {
      expect(computeTotals(376)).toEqual({
        subtotal: 376,
        shipping: 0,
        total: 376,
      });
    });
  });
});
