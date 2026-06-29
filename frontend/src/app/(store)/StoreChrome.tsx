'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Client chrome for the storefront group: sticky Navbar above, Footer below.
 *
 * Scaffold stage — cart count is 0 and the account label is generic. Later
 * modules will wire these to the cart + auth slices (and pass router-driven
 * navigation handlers). Kept as a client component so those hooks can attach
 * without touching the route-group layout.
 */
export default function StoreChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar cartCount={0} accountLabel="Account" />
      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </>
  );
}
