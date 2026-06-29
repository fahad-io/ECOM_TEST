'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '@/store/useAuth';

export interface RequireAuthProps {
  children: React.ReactNode;
  /** Where to send unauthenticated users. Default `/login`. */
  redirectTo?: string;
  /** Require `role === 'admin'`; non-admins are sent to `adminRedirectTo`. */
  admin?: boolean;
  /** Where to send non-admins when `admin` is set. Default `/admin/login`. */
  adminRedirectTo?: string;
}

/**
 * Client-side route guard. Redirects unauthenticated users to `redirectTo`
 * (carrying the attempted path as `?from=`), and — when `admin` is set —
 * redirects authenticated non-admins to `adminRedirectTo`. Renders a spinner
 * while the redirect is in flight so protected content never flashes.
 *
 * Auth lives in localStorage (hydrated client-side), so this guard runs in an
 * effect after mount; pages it wraps must be client components.
 */
export default function RequireAuth({
  children,
  redirectTo = '/login',
  admin = false,
  adminRedirectTo = '/admin/login',
}: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, hydrated } = useAuth();

  // Only "allowed" once auth has rehydrated — so SSR/first-render shows the
  // spinner on both sides (no mismatch) and we never redirect a logged-in user
  // before their token is loaded from localStorage.
  const allowed = hydrated && (admin ? isAdmin : isAuthenticated);

  React.useEffect(() => {
    if (!hydrated || allowed) return; // wait for rehydration before deciding
    if (!isAuthenticated) {
      const target = admin ? adminRedirectTo : redirectTo;
      const from = encodeURIComponent(pathname || '/');
      router.replace(`${target}?from=${from}`);
      return;
    }
    // Authenticated but not admin on an admin route.
    if (admin && !isAdmin) {
      router.replace(adminRedirectTo);
    }
  }, [hydrated, allowed, isAuthenticated, isAdmin, admin, redirectTo, adminRedirectTo, pathname, router]);

  if (!allowed) {
    return (
      <Box
        sx={{
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={28} thickness={4} color="secondary" />
      </Box>
    );
  }

  return <>{children}</>;
}
