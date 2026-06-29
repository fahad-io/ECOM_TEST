'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { radii } from '@/theme/tokens';

export interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  /** `lg` = product detail (52px tall), `sm` = cart row (38px). */
  size?: 'sm' | 'lg';
}

const DIMS = {
  sm: { h: 38, btn: 36, num: 32, font: 14, icon: 18 },
  lg: { h: 52, btn: 46, num: 40, font: 16, icon: 20 },
} as const;

/**
 * The − N + quantity stepper used on the product detail and cart rows.
 * Pill-bordered, ink glyphs. Clamps to [min, max].
 */
export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'lg',
}: QuantityStepperProps) {
  const d = DIMS[size];
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radii.pill}px`,
        overflow: 'hidden',
      }}
    >
      <IconButton
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        disableRipple
        sx={{
          width: d.btn,
          height: d.h,
          borderRadius: 0,
          fontSize: d.icon,
          color: 'text.secondary',
        }}
      >
        −
      </IconButton>
      <Box
        aria-live="polite"
        sx={{ width: d.num, textAlign: 'center', fontWeight: 700, fontSize: d.font }}
      >
        {value}
      </Box>
      <IconButton
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        disableRipple
        sx={{
          width: d.btn,
          height: d.h,
          borderRadius: 0,
          fontSize: d.icon,
          color: 'text.secondary',
        }}
      >
        +
      </IconButton>
    </Box>
  );
}
