'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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
  /** Search field value + handler (topbar). Optional. */
  search?: string;
  onSearch?: (value: string) => void;
  onViewStore?: () => void;
  onSignOut?: () => void;
  children: React.ReactNode;
}

/**
 * Admin console layout: dark sticky sidebar (brand, nav, user footer) and a
 * light content area with a sticky topbar (title, search, "View store").
 * Must be rendered inside `AdminThemeProvider` so the dark palette applies to
 * the sidebar; the content area uses an explicit light surface per the mockup.
 */
export default function AdminShell({
  title,
  nav,
  activeKey,
  adminName = 'Alex Rivera',
  adminRole = 'Administrator',
  search,
  onSearch,
  onViewStore,
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
                component={item.href ? 'a' : 'button'}
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
            aria-hidden
            sx={{
              width: 34,
              height: 34,
              borderRadius: '99px',
              bgcolor: emerald.main,
              color: emerald.deep,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {initials}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: admin.text }}>
              {adminName}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: admin.textFaint }}>{adminRole}</Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              value={search ?? ''}
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search…"
              aria-label="Search"
              size="small"
              sx={{
                width: 220,
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: `${radii.pill}px`,
                  bgcolor: '#FAFAF9',
                  color: '#111827',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
                },
                '& input': { height: 40, fontSize: 13.5 },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Button
              onClick={onViewStore}
              variant="outlined"
              endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
              sx={{
                height: 40,
                minHeight: 40,
                color: '#111827',
                borderColor: '#E5E7EB',
                fontSize: 13,
                '&:hover': { borderColor: '#D1D5DB', bgcolor: 'transparent' },
              }}
            >
              View store
            </Button>
          </Box>
        </Box>
        <Box sx={{ p: '30px', color: '#111827' }}>{children}</Box>
      </Box>
    </Box>
  );
}
