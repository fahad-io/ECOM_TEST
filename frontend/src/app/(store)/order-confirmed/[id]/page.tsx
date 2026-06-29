import RequireAuthOrderConfirmed from './RequireAuthOrderConfirmed';

/**
 * `/order-confirmed/[id]` — the post-checkout success screen. A thin server
 * wrapper that resolves the route param (a Promise in the App Router) and hands
 * the id to the guarded client screen.
 */
export default async function OrderConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequireAuthOrderConfirmed orderId={id} />;
}
