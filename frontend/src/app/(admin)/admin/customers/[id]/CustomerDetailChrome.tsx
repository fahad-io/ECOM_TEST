'use client';

import AdminShell from '@/components/AdminShell';
import { useAdminConsole } from '../../useAdminConsole';
import CustomerDetailScreen from './CustomerDetailScreen';

/**
 * Client chrome for the customer detail route: dark `AdminShell` (Customers
 * active) wrapping the profile + stats + order history. Auth guarding is
 * applied by the server page.
 */
export default function CustomerDetailChrome({ id }: { id: string }) {
  const console = useAdminConsole();
  return (
    <AdminShell
      title="Customer"
      activeKey="customers"
      nav={console.nav}
      adminName={console.adminName}
      onSignOut={console.onSignOut}
    >
      <CustomerDetailScreen id={id} />
    </AdminShell>
  );
}
