'use client';

import PageTransition from '@/components/PageTransition';

/**
 * App Router `template` re-mounts on every navigation (unlike `layout`), so it
 * is the right place to drive Framer Motion route-enter transitions. Wraps each
 * storefront page in the shared fade-up animation.
 */
export default function StoreTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
