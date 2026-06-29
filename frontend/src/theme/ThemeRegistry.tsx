'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import type { Theme } from '@mui/material/styles';
import { storefrontTheme } from './theme';

/**
 * App Router theme registry. Wraps children in MUI's emotion cache provider
 * (SSR-safe for the App Router) plus a ThemeProvider + CssBaseline.
 *
 * Pass a `theme` to switch palettes per route group — the storefront layout
 * uses the default (storefront) theme; the admin layout passes `adminTheme`.
 */
export default function ThemeRegistry({
  children,
  theme = storefrontTheme,
}: {
  children: React.ReactNode;
  theme?: Theme;
}) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
