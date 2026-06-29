'use client';

import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import ProfileForm from '@/components/ProfileForm';
import { useAdminConsole } from '../useAdminConsole';

/** Admin profile page (`/admin/profile`). Edit name, password, profile picture. */
export default function AdminProfilePage() {
  const console = useAdminConsole();
  return (
    <RequireAuth admin>
      <AdminShell
        title="Profile"
        activeKey="profile"
        nav={console.nav}
        adminName={console.adminName}
        avatarUrl={console.avatarUrl}
        onSignOut={console.onSignOut}
      >
        <ProfileForm />
      </AdminShell>
    </RequireAuth>
  );
}
