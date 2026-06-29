'use client';

import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { adminTheme } from './theme';

/**
 * Swaps the active MUI theme to the dark admin palette for admin route groups.
 * Use inside the storefront-rooted tree (the emotion cache from the root
 * ThemeRegistry is reused; only the theme is overridden here).
 */
export default function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
