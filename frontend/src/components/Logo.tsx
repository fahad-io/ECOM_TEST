'use client';

import Box from '@mui/material/Box';
import { emerald } from '@/theme/tokens';

export interface LogoProps {
  /** Wordmark font size in px. Default 24 (nav). */
  size?: number;
  /** Override the ink color (e.g. white in the admin sidebar). */
  color?: string;
  /** Accessible label; the dot is decorative. */
  'aria-label'?: string;
}

/**
 * MARL wordmark with the emerald dot accent. Letter-spaced .16em per the
 * mockup. Presentational only — wrap in a Link for navigation.
 */
export default function Logo({ size = 24, color, ['aria-label']: ariaLabel = 'MARL' }: LogoProps) {
  return (
    <Box
      component="span"
      aria-label={ariaLabel}
      sx={{
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.16em',
        lineHeight: 1,
        color: color ?? 'text.primary',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      MARL
      <Box component="span" aria-hidden sx={{ color: emerald.main }}>
        .
      </Box>
    </Box>
  );
}
