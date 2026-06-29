'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/useAuth';
import { logout } from '@/store/authSlice';

/**
 * Client chrome for the storefront group: sticky Navbar above, Footer below.
 *
 * Wires the Navbar to real auth state. Logged out → "Account" link routes to
 * `/login`. Logged in → the account label shows the first name and opens a menu
 * (Orders / Logout). Nav links route to the catalog sections; logout clears the
 * auth slice and returns to the catalog. Cart count is wired in a later module.
 */
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAuth();

  const [menuOpen, setMenuOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);

  const firstName = user?.name?.split(' ')[0] ?? 'Account';

  const handleAccount = () => {
    if (isAuthenticated) {
      setMenuOpen(true);
    } else {
      router.push('/login');
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const handleOrders = () => {
    closeMenu();
    if (isAuthenticated) router.push('/orders');
    else router.push('/login?from=%2Forders');
  };

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
    router.push('/');
  };

  return (
    <>
      {/* Anchor for the account menu, pinned to the top-right of the viewport. */}
      <Box
        ref={anchorRef}
        sx={{ position: 'fixed', top: 64, right: 32, width: 0, height: 0, zIndex: 39 }}
      />
      <Navbar
        cartCount={0}
        accountLabel={isAuthenticated ? `Hi, ${firstName}` : 'Account'}
        primaryLinks={[
          { label: 'Shop', href: '/' },
          { label: 'New In', href: '/?sort=new' },
          { label: 'Collections', href: '/' },
        ]}
        onLogoClick={() => router.push('/')}
        onOrders={handleOrders}
        onAccount={handleAccount}
        onCart={() => router.push('/cart')}
      />

      <Menu
        anchorEl={anchorRef.current}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 180, borderRadius: 2 } } }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{user.name}</Typography>
            <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }}>
              {user.email}
            </Typography>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleOrders} sx={{ fontSize: 14 }}>
          Orders
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ fontSize: 14 }}>
          Logout
        </MenuItem>
      </Menu>

      <Box component="main" sx={{ flex: 1 }}>
        {children}
      </Box>
      <Footer />
    </>
  );
}
