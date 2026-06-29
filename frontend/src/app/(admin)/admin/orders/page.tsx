'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import { useAdminConsole } from '../useAdminConsole';
import OrdersScreen from './OrdersScreen';

/**
 * Order management route (`/admin/orders`). Admin-guarded. Status filter tabs +
 * table with inline lifecycle-aware status control.
 */
export default function AdminOrdersPage() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="Orders"
        activeKey="orders"
        nav={console.nav}
        adminName={console.adminName}
        avatarUrl={console.avatarUrl}
        onSignOut={console.onSignOut}
      >
        <OrdersScreen />
      </AdminShell>
    </RequireAuth>
  );
}
