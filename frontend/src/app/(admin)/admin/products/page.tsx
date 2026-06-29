'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import { useAdminConsole } from '../useAdminConsole';
import ProductsScreen from './ProductsScreen';

/**
 * Product management route (`/admin/products`). Admin-guarded. Table of the
 * catalog with create / edit / delete actions.
 */
export default function AdminProductsPage() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="Products"
        activeKey="products"
        nav={console.nav}
        adminName={console.adminName}
        avatarUrl={console.avatarUrl}
        onSignOut={console.onSignOut}
      >
        <ProductsScreen />
      </AdminShell>
    </RequireAuth>
  );
}
