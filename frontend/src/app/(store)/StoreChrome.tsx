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
import { useGetCartQuery } from '@/store/cartApi';
import { productImageUrl } from '@/lib/imageUrl';
import { mono } from '@/theme/format';

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

  // Cart is per-user and bearer-guarded; only query when authenticated.
  const { data: cart } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const cartCount = cart?.items.reduce((sum, item) => sum + item.qty, 0) ?? 0;

  // Anchor the account menu to the clicked "Hi, {name}" link so it drops down
  // directly under the name (not pinned to the viewport edge).
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const firstName = user?.name?.split(' ')[0] ?? 'Account';
  const avatarUrl = productImageUrl(user?.avatarPath);

  const handleAccount = (e: React.MouseEvent<HTMLElement>) => {
    if (isAuthenticated) {
      setAnchorEl(e.currentTarget);
    } else {
      router.push('/login');
    }
  };

  const closeMenu = () => setAnchorEl(null);

  const handleOrders = () => {
    closeMenu();
    if (isAuthenticated) router.push('/orders');
    else router.push('/login?from=%2Forders');
  };

  const handleProfile = () => {
    closeMenu();
    router.push('/account');
  };

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
    router.push('/');
  };

  return (
    <>
      <Navbar
        cartCount={cartCount}
        accountLabel={isAuthenticated ? `Hi, ${firstName}` : 'Account'}
        primaryLinks={[]}
        onLogoClick={() => router.push('/')}
        onOrders={handleOrders}
        onAccount={handleAccount}
        onCart={() => router.push('/cart')}
      />

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 200, borderRadius: 2 } } }}
      >
        {user && (
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              aria-hidden
              sx={{
                width: 38,
                height: 38,
                borderRadius: '99px',
                flex: '0 0 auto',
                bgcolor: '#ECFDF5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 800,
                overflow: 'hidden',
              }}
            >
              {avatarUrl ? (
                <Box component="img" src={avatarUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                mono(user.name)
              )}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }} noWrap>{user.name}</Typography>
              <Typography sx={{ fontSize: 12.5, color: 'text.disabled' }} noWrap>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <Divider />
        <MenuItem onClick={handleProfile} sx={{ fontSize: 14 }}>
          Profile
        </MenuItem>
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
