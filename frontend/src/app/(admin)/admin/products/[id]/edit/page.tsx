import AdminShell from '@/components/AdminShell';
import RequireAuth from '@/components/RequireAuth';
import EditProductChrome from './EditProductChrome';

/**
 * Edit-product route (`/admin/products/[id]/edit`). Server wrapper resolves the
 * id param, then hands off to the admin-guarded client chrome + form.
 */
export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RequireAuth admin>
      <EditProductChrome id={id} />
    </RequireAuth>
  );
}
