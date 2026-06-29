'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TintSwatch from './TintSwatch';
import NewBadge from './NewBadge';
import StockLabel from './StockLabel';
import PriceTag from './PriceTag';

export interface ProductCardProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  isNew?: boolean;
  tint?: string | null;
}

export interface ProductCardProps {
  product: ProductCardProduct;
  /** Click handler (e.g. navigate to detail). Presentational — no data fetch. */
  onOpen?: (id: string) => void;
  /** Hide the stock pill (e.g. recommendation tiles in the mockup omit it). */
  hideStock?: boolean;
}

/**
 * Storefront product card: tint swatch with mono initials, NEW badge (top-left),
 * stock pill (top-right), then name + price row and category. Mirrors the
 * catalog grid in the mockup.
 */
export default function ProductCard({ product, onOpen, hideStock }: ProductCardProps) {
  const interactive = Boolean(onOpen);
  return (
    <Box
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onOpen!(product.id) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen!(product.id);
              }
            }
          : undefined
      }
      aria-label={interactive ? `${product.name}, ${product.category}` : undefined}
      sx={{
        cursor: interactive ? 'pointer' : 'default',
        animation: 'fadeUp .4s ease both',
        borderRadius: 2,
        outlineOffset: 3,
        '&:focus-visible': { outline: `2px solid`, outlineColor: 'primary.main' },
      }}
    >
      <TintSwatch name={product.name} tint={product.tint} sx={{ mb: '13px' }}>
        {product.isNew && (
          <NewBadge sx={{ position: 'absolute', top: 12, left: 12 }} />
        )}
        {!hideStock && (
          <StockLabel
            stock={product.stock}
            variant="pill"
            sx={{ position: 'absolute', top: 12, right: 12 }}
          />
        )}
      </TintSwatch>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{product.name}</Typography>
        <PriceTag value={product.price} />
      </Box>
      <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: '3px' }}>
        {product.category}
      </Typography>
    </Box>
  );
}
