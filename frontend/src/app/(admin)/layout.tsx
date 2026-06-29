import * as React from 'react';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { adminTheme } from '@/theme/theme';
import AdminThemeProvider from '@/theme/AdminThemeProvider';

/**
 * Admin route group layout. Uses the dark admin MUI palette. The actual
 * AdminShell (sidebar nav + topbar) is composed per-page in a later module so
 * each page can set its own active nav key + title; here we only establish the
 * theme boundary.
 *
 * `ThemeRegistry` is given `adminTheme` so any non-AdminThemeProvider subtree
 * still reads the admin palette; `AdminThemeProvider` re-applies it for the
 * AdminShell tree. Route guarding (admin-only) is added with the auth module.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeRegistry theme={adminTheme}>
      <AdminThemeProvider>{children}</AdminThemeProvider>
    </ThemeRegistry>
  );
}
