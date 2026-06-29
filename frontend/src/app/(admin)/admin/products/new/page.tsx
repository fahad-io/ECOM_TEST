'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import { useAdminConsole } from '../../useAdminConsole';
import ProductForm from '../ProductForm';

/** Create-product route (`/admin/products/new`). Admin-guarded. */
export default function NewProductPage() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="New product"
        activeKey="products"
        nav={console.nav}
        adminName={console.adminName}
        onViewStore={console.onViewStore}
        onSignOut={console.onSignOut}
      >
        <ProductForm />
      </AdminShell>
    </RequireAuth>
  );
}
