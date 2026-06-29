'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import { useAdminConsole } from '../useAdminConsole';
import CustomersScreen from './CustomersScreen';

/**
 * Customer management route (`/admin/customers`). Admin-guarded. Lists all
 * customers with their order count + money spent; each row links to a detail.
 */
export default function AdminCustomersPage() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="Customers"
        activeKey="customers"
        nav={console.nav}
        adminName={console.adminName}
        onSignOut={console.onSignOut}
      >
        <CustomersScreen />
      </AdminShell>
    </RequireAuth>
  );
}
