'use client';

import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Logo from './Logo';
import { radii } from '@/theme/tokens';

export interface NavLink {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface NavbarProps {
  /** Left-side primary links. Defaults to Shop / New In / Collections. */
  primaryLinks?: NavLink[];
  /** Cart badge count. */
  cartCount?: number;
  /** Account label, e.g. "Account" or "Hi, Alex". */
  accountLabel?: string;
  /** Announcement bar copy; pass null to hide it. */
  announcement?: string | null;
  onLogoClick?: () => void;
  onOrders?: () => void;
  /** Receives the click event so the consumer can anchor a menu to the link. */
  onAccount?: (e: MouseEvent<HTMLElement>) => void;
  onCart?: () => void;
}

const DEFAULT_ANNOUNCEMENT =
  'Complimentary shipping on orders over $150 — considered essentials, made to last.';

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Shop' },
  { label: 'New In' },
  { label: 'Collections' },
];

const navLinkSx = { fontSize: 14, fontWeight: 500, color: 'text.secondary' } as const;

/**
 * Storefront top announcement bar + sticky translucent nav. Centered wordmark,
 * primary links left, Orders / Account / Cart (with count) right. Matches the
 * mockup copy and layout. Presentational — pass handlers/hrefs.
 */
export default function Navbar({
  primaryLinks = DEFAULT_LINKS,
  cartCount = 0,
  accountLabel = 'Account',
  announcement = DEFAULT_ANNOUNCEMENT,
  onLogoClick,
  onOrders,
  onAccount,
  onCart,
}: NavbarProps) {
  return (
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 40 }}>
      {announcement && (
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            textAlign: 'center',
            fontSize: 12.5,
            letterSpacing: '0.04em',
            py: '9px',
            px: 2,
            fontWeight: 500,
          }}
        >
          {announcement}
        </Box>
      )}
      <Box
        component="nav"
        aria-label="Primary"
        sx={{
          bgcolor: 'rgba(255,255,255,.88)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: 'auto',
            px: 4,
            height: 72,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: '30px', flex: 1 }}>
            {primaryLinks.map((l) => (
              <Link key={l.label} href={l.href} onClick={l.onClick} sx={navLinkSx}>
                {l.label}
              </Link>
            ))}
          </Box>

          <Link
            onClick={onLogoClick}
            aria-label="MARL home"
            sx={{
              flex: '0 0 auto',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'opacity .15s ease',
              '&:hover': { opacity: 0.7 },
            }}
          >
            <Logo size={24} />
          </Link>

          <Box
            sx={{
              display: 'flex',
              gap: '22px',
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <Link onClick={onOrders} sx={navLinkSx}>
              Orders
            </Link>
            <Link onClick={onAccount} sx={navLinkSx}>
              {accountLabel}
            </Link>
            <Link
              onClick={onCart}
              aria-label={`Cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                fontWeight: 600,
                fontSize: 14,
                color: 'text.secondary',
              }}
            >
              Cart
              <Box
                component="span"
                sx={{
                  minWidth: 22,
                  height: 22,
                  px: '6px',
                  borderRadius: `${radii.pill}px`,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </Box>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
