import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface InfoPageProps {
  eyebrow?: string;
  title: string;
  /** Short paragraphs of body copy. */
  paragraphs: React.ReactNode[];
}

/**
 * Simple editorial content page (Shipping, Returns, etc.). Rendered inside the
 * storefront chrome, so it inherits the Navbar/Footer and page transition.
 */
export default function InfoPage({ eyebrow = 'MARL.', title, paragraphs }: InfoPageProps) {
  return (
    <Box component="section" sx={{ maxWidth: 680, mx: 'auto', px: 4, pt: '64px', pb: '96px' }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'secondary.main',
          mb: '14px',
        }}
      >
        {eyebrow}
      </Typography>
      <Typography
        variant="h1"
        sx={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', mb: '28px' }}
      >
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {paragraphs.map((p, i) => (
          <Typography key={i} sx={{ fontSize: 16, lineHeight: 1.7, color: 'text.secondary' }}>
            {p}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}
