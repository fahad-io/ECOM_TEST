'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import type { AdminNavItem } from '@/components/AdminShell';
import { useAppDispatch } from '@/store/hooks';
import { useAuth } from '@/store/useAuth';
import { logout } from '@/store/authSlice';

export type AdminNavKey = 'dashboard' | 'products' | 'orders';

export interface AdminConsole {
  nav: AdminNavItem[];
  adminName: string;
  onViewStore: () => void;
  onSignOut: () => void;
}

/**
 * Shared admin-console chrome wiring: the sidebar nav items (Dashboard,
 * Products, Orders) with hrefs, the "View store" link, sign-out (clears auth +
 * returns to staff sign-in), and the signed-in admin's display name. Each admin
 * page passes the result to `AdminShell` along with its own `activeKey`.
 */
export function useAdminConsole(): AdminConsole {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const nav: AdminNavItem[] = React.useMemo(
    () => [
      {
        key: 'dashboard',
        label: 'Dashboard',
        icon: <DashboardOutlinedIcon />,
        href: '/admin',
      },
      {
        key: 'products',
        label: 'Products',
        icon: <Inventory2OutlinedIcon />,
        href: '/admin/products',
      },
      {
        key: 'orders',
        label: 'Orders',
        icon: <ReceiptLongOutlinedIcon />,
        href: '/admin/orders',
      },
    ],
    [],
  );

  const onViewStore = React.useCallback(() => {
    window.open('/', '_blank', 'noopener');
  }, []);

  const onSignOut = React.useCallback(() => {
    dispatch(logout());
    router.replace('/admin/login');
  }, [dispatch, router]);

  return {
    nav,
    adminName: user?.name ?? 'Administrator',
    onViewStore,
    onSignOut,
  };
}
