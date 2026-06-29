import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { stockColor, stockLabel } from '@/theme/format';
import { radii } from '@/theme/tokens';

export interface StockLabelProps {
  /** Available stock count. */
  stock: number;
  /**
   * `dot` — small dot + text (product detail / table rows).
   * `pill` — translucent white pill overlaid on a product image (catalog card).
   */
  variant?: 'dot' | 'pill';
  sx?: SxProps<Theme>;
}

/**
 * Stock indicator. Color + copy follow the design rules: Sold out (grey),
 * "Only N left" (amber, <=5), In stock (emerald).
 */
export default function StockLabel({ stock, variant = 'dot', sx }: StockLabelProps) {
  const color = stockColor(stock);
  const label = stockLabel(stock);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 11.5,
        fontWeight: 600,
        color,
        ...(variant === 'pill' && {
          bgcolor: 'rgba(255,255,255,.92)',
          px: '10px',
          py: '5px',
          borderRadius: `${radii.pill}px`,
        }),
        ...sx,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{ width: 6, height: 6, borderRadius: '99px', bgcolor: color }}
      />
      {label}
    </Box>
  );
}
