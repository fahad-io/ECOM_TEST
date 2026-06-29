import ProductDetail from './ProductDetail';

/**
 * `/products/[id]` — the product detail route. A thin server wrapper that
 * resolves the route param (a Promise in the App Router) and hands the id to
 * the client `ProductDetail`, which owns all data fetching and interaction.
 */
export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
