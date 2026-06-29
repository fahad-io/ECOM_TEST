'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import { useAdminConsole } from './useAdminConsole';
import DashboardScreen from './DashboardScreen';

/**
 * Admin dashboard route (`/admin`). Guarded by `RequireAuth admin` so a regular
 * user never reaches the console. Renders the dark `AdminShell` chrome with the
 * dashboard body.
 */
export default function AdminHome() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="Dashboard"
        activeKey="dashboard"
        nav={console.nav}
        adminName={console.adminName}
        onSignOut={console.onSignOut}
      >
        <DashboardScreen />
      </AdminShell>
    </RequireAuth>
  );
}
