'use client';

import * as React from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import Logo from './Logo';
import { admin, emerald, radii } from '@/theme/tokens';
import { mono as toMono } from '@/theme/format';

export interface AdminNavItem {
  /** Stable key, e.g. "dashboard" | "products" | "orders". */
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface AdminShellProps {
  /** Topbar page title (e.g. "Dashboard"). */
  title: string;
  /** Sidebar nav items. */
  nav: AdminNavItem[];
  /** Active nav item key. */
  activeKey: string;
  /** Admin display name + role (footer of sidebar). */
  adminName?: string;
  adminRole?: string;
  /** Profile picture URL shown in the sidebar footer (falls back to initials). */
  avatarUrl?: string | null;
  onSignOut?: () => void;
  children: React.ReactNode;
}

/**
 * Admin console layout: dark sticky sidebar (brand, nav, user footer) and a
 * light content area with a sticky topbar (page title).
 * Must be rendered inside `AdminThemeProvider` so the dark palette applies to
 * the sidebar; the content area uses an explicit light surface per the mockup.
 */
export default function AdminShell({
  title,
  nav,
  activeKey,
  adminName = 'Alex Rivera',
  adminRole = 'Administrator',
  avatarUrl,
  onSignOut,
  children,
}: AdminShellProps) {
  const initials = toMono(adminName);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F7F5' }}>
      {/* sidebar */}
      <Box
        component="aside"
        sx={{
          width: 236,
          flex: '0 0 auto',
          bgcolor: admin.bg,
          color: admin.text,
          p: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <Box sx={{ p: '6px 12px 22px' }}>
          <Logo size={21} color={admin.text} />
        </Box>
        <Box component="nav" aria-label="Admin" sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {nav.map((item) => {
            const active = item.key === activeKey;
            return (
              <Box
                key={item.key}
                component={item.href ? NextLink : 'button'}
                href={item.href}
                onClick={item.onClick}
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  p: '11px 12px',
                  borderRadius: `${radii.sm}px`,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  bgcolor: active ? admin.active : 'transparent',
                  color: active ? admin.text : admin.textMuted,
                  border: 'none',
                  textAlign: 'left',
                  font: 'inherit',
                  width: '100%',
                  '&:hover': { bgcolor: admin.active },
                  '& svg': { fontSize: 18 },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            mt: 'auto',
            borderTop: `1px solid ${admin.raised}`,
            pt: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
          }}
        >
          <Box
            component={NextLink}
            href="/admin/profile"
            title="Edit your profile"
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              textDecoration: 'none',
              borderRadius: `${radii.sm}px`,
              p: '6px 8px',
              m: '-6px -8px',
              transition: 'background .12s ease',
              '&:hover': { bgcolor: admin.active },
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 34,
                height: 34,
                borderRadius: '99px',
                flex: '0 0 auto',
                bgcolor: emerald.main,
                color: emerald.deep,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 13,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <Box component="img" src={avatarUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: admin.text }} noWrap>
                {adminName}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: admin.textFaint }}>{adminRole}</Typography>
            </Box>
          </Box>
          <Link
            onClick={onSignOut}
            aria-label="Sign out"
            title="Sign out"
            sx={{ color: admin.textFaint, display: 'inline-flex' }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
          </Link>
        </Box>
      </Box>

      {/* main */}
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            height: 66,
            borderBottom: '1px solid #ECECEC',
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: '30px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Typography sx={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.01em', color: '#111827' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ p: '30px', color: '#111827' }}>{children}</Box>
      </Box>
    </Box>
  );
}
