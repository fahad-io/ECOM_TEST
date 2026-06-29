import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface SectionHeadingProps {
  /** Small emerald eyebrow above the title (e.g. "The Autumn Edit"). */
  eyebrow?: string;
  title: string;
  /** Optional right-aligned meta text (e.g. "Based on this Knitwear piece"). */
  meta?: React.ReactNode;
  /** `h2` page title, `h3` section title. Default h3. */
  level?: 'h2' | 'h3';
  sx?: SxProps<Theme>;
}

/**
 * Shared section heading: optional uppercase emerald eyebrow, a display title,
 * and optional baseline-aligned meta on the right. Used across catalog hero,
 * "You may also like", admin panels, etc.
 */
export default function SectionHeading({
  eyebrow,
  title,
  meta,
  level = 'h3',
  sx,
}: SectionHeadingProps) {
  return (
    <Box sx={sx}>
      {eyebrow && (
        <Typography
          sx={{
            fontSize: 12,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'secondary.main',
            fontWeight: 700,
            mb: '12px',
          }}
        >
          {eyebrow}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: meta ? 'space-between' : 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant={level}>{title}</Typography>
        {meta && (
          <Typography sx={{ fontSize: 13, color: 'text.disabled', fontWeight: 500 }}>
            {meta}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
