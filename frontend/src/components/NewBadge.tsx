import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import { radii } from '@/theme/tokens';

export interface NewBadgeProps {
  sx?: SxProps<Theme>;
}

/**
 * "NEW" pill — ink background, white text — as overlaid on product images in
 * the mockup (top-left of the tint swatch).
 */
export default function NewBadge({ sx }: NewBadgeProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        px: '10px',
        py: '5px',
        borderRadius: `${radii.pill}px`,
        ...sx,
      }}
    >
      NEW
    </Box>
  );
}
