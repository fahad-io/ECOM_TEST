import RequireAuthOrderDetail from './RequireAuthOrderDetail';

/**
 * `/orders/[id]` — a single order. A thin server wrapper that resolves the route
 * param (a Promise in the App Router) and hands the id to the guarded client
 * screen.
 */
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequireAuthOrderDetail orderId={id} />;
}
