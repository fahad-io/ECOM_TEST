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
  /** Product image URL. When set, fills the swatch (tint shows as fallback). */
  imageSrc?: string | null;
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
  imageSrc,
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
      {imageSrc ? (
        // Real product image fills the swatch; the tint stays as the backdrop
        // so a slow/failed load still looks intentional.
        <Box
          component="img"
          src={imageSrc}
          alt={name ?? ''}
          loading="lazy"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
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
      )}
      {children}
    </Box>
  );
}
