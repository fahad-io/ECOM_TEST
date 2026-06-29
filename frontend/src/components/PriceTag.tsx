import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { money } from '@/theme/format';

export interface PriceTagProps {
  /** Integer USD amount. */
  value: number;
  /** Visual size. `lg` = product detail (26px), `md` = card (15px). */
  size?: 'md' | 'lg';
  sx?: SxProps<Theme>;
}

const SIZES = {
  md: { fontSize: 15, fontWeight: 700 },
  lg: { fontSize: 26, fontWeight: 700 },
} as const;

/**
 * Bold price label, matching the mockup (700 weight, ink). Use `Money` for
 * inline subtotal/total rows; use `PriceTag` for the prominent product price.
 */
export default function PriceTag({ value, size = 'md', sx }: PriceTagProps) {
  return (
    <Box component="span" sx={{ ...SIZES[size], color: 'text.primary', ...sx }}>
      {money(value)}
    </Box>
  );
}
