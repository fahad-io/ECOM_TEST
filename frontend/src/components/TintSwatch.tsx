import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { mono as toMono } from '@/theme/format';
import { DEFAULT_TINT, radii } from '@/theme/tokens';

export interface TintSwatchProps {
  /** Product name; used to derive the monogram if `mono` not given. */
  name?: string;
  /** Explicit monogram override. */
  mono?: string;
  /** Hex tint background. Falls back to the design's default warm grey. */
  tint?: string | null;
  /** CSS aspect-ratio, e.g. "3 / 4" (card) or "4 / 3" (detail hero). */
  ratio?: string;
  /** Monogram font size in px. */
  monoSize?: number;
  borderRadius?: number;
  /** Slot for overlay badges (positioned by the consumer). */
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * The warm tint placeholder used everywhere a product image would appear:
 * a colored block with faint oversized monogram initials. Matches the mockup
 * (`color:rgba(17,24,39,.10)` initials over a product `tint`).
 */
export default function TintSwatch({
  name,
  mono,
  tint,
  ratio = '3 / 4',
  monoSize = 64,
  borderRadius = radii.md,
  children,
  sx,
}: TintSwatchProps) {
  const initials = mono ?? toMono(name ?? '');
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: ratio,
        borderRadius: `${borderRadius}px`,
        bgcolor: tint || DEFAULT_TINT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          fontSize: monoSize,
          fontWeight: 800,
          letterSpacing: '0.04em',
          color: 'rgba(17,24,39,.10)',
        }}
      >
        {initials}
      </Box>
      {children}
    </Box>
  );
}
