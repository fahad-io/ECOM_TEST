import * as React from 'react';
import Box from '@mui/material/Box';
import ThemeRegistry from '@/theme/ThemeRegistry';
import StoreChrome from './StoreChrome';

/**
 * Storefront route group layout. Applies the storefront (light) MUI theme and
 * wraps content in the shared Navbar + Footer chrome.
 *
 * Cart count / account label are placeholders for now — they will be driven by
 * the cart + auth RTK Query endpoints in later modules.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeRegistry>
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <StoreChrome>{children}</StoreChrome>
      </Box>
    </ThemeRegistry>
  );
}
