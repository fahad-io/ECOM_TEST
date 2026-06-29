'use client';

import AdminShell from '@/components/AdminShell';
import { useAdminConsole } from '../../../useAdminConsole';
import EditProductScreen from './EditProductScreen';

/**
 * Client chrome for the edit-product route: dark `AdminShell` (Products active)
 * wrapping the prefilled form. Auth guarding is applied by the server page.
 */
export default function EditProductChrome({ id }: { id: string }) {
  const console = useAdminConsole();
  return (
    <AdminShell
      title="Edit product"
      activeKey="products"
      nav={console.nav}
      adminName={console.adminName}
      onViewStore={console.onViewStore}
      onSignOut={console.onSignOut}
    >
      <EditProductScreen id={id} />
    </AdminShell>
  );
}
