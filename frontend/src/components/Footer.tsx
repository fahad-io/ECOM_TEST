'use client';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Logo from './Logo';

export interface FooterLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface FooterProps {
  links?: FooterLink[];
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Shipping', href: '/shipping' },
  { label: 'Returns', href: '/returns' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Storefront footer: wordmark, link row, copyright. Matches the mockup copy
 * ("© 2026 MARL. Considered essentials.").
 */
export default function Footer({ links = DEFAULT_LINKS }: FooterProps) {
  return (
    <Box
      component="footer"
      sx={{ borderTop: '1px solid', borderColor: 'divider', mt: '20px' }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          mx: 'auto',
          px: 4,
          py: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Logo size={20} />
        <Box sx={{ display: 'flex', gap: '26px' }}>
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={l.onClick}
              sx={{ fontSize: 13.5, color: 'text.secondary', fontWeight: 500 }}
            >
              {l.label}
            </Link>
          ))}
        </Box>
        <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
          © 2026 MARL. Considered essentials.
        </Typography>
      </Box>
    </Box>
  );
}
