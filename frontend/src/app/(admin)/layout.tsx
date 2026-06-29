'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import RequireAuth from '@/components/RequireAuth';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { adminTheme } from '@/theme/theme';
import AdminThemeProvider from '@/theme/AdminThemeProvider';

/**
 * Admin route group layout. Establishes the dark admin MUI palette and guards
 * the WHOLE group with `RequireAuth admin` by construction — except the staff
 * sign-in page itself (guarding it would create a redirect loop). This means
 * any future admin page is admin-gated even if its author forgets a per-page
 * guard; the server `@Roles('admin')` remains the authoritative gate.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === '/admin/login';

  return (
    <ThemeRegistry theme={adminTheme}>
      <AdminThemeProvider>
        {isLogin ? children : <RequireAuth admin>{children}</RequireAuth>}
      </AdminThemeProvider>
    </ThemeRegistry>
  );
}
