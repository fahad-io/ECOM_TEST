import RequireAuth from '@/components/RequireAuth';
import CustomerDetailChrome from './CustomerDetailChrome';

/**
 * Customer detail route (`/admin/customers/[id]`). Server wrapper resolves the
 * id param, then hands off to the admin-guarded client chrome.
 */
export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth admin>
      <CustomerDetailChrome id={id} />
    </RequireAuth>
  );
}
