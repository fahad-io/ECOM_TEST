'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import { useGetMyOrdersQuery, type Order, type OrderItem } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import { useAuth } from '@/store/useAuth';
import StatusChip from '@/components/StatusChip';
import EmptyState from '@/components/EmptyState';
import { money, mono, shortOrderId, orderDate } from '@/theme/format';
import { radii, storefront, TINTS } from '@/theme/tokens';

const containerSx = { maxWidth: 980, mx: 'auto' } as const;

/**
 * `/orders` — "Your orders". Header with the order count + signed-in name, then
 * a card per order (id, placed date, total, status chip, and item pills). The
 * backend already returns the caller's orders newest-first, so no client sort.
 */
export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: orders, isLoading, isError, error, refetch } = useGetMyOrdersQuery();

  if (isLoading) return <OrdersSkeleton />;

  if (isError) {
    return (
      <Section>
        <Header count={0} name={user?.name ?? ''} />
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {normalizeApiError(error as never).message}
        </Alert>
      </Section>
    );
  }

  const list = orders ?? [];

  if (list.length === 0) {
    return (
      <Section>
        <Header count={0} name={user?.name ?? ''} />
        <EmptyState
          title="No orders yet"
          subtitle="When you place an order it will appear here."
          actionLabel="Start shopping"
          onAction={() => router.push('/')}
        />
      </Section>
    );
  }

  return (
    <Section>
      <Header count={list.length} name={user?.name ?? ''} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {list.map((o) => (
          <OrderCard key={o.id} order={o} onOpen={() => router.push(`/orders/${o.id}`)} />
        ))}
      </Box>
    </Section>
  );
}

function OrderCard({ order, onOpen }: { order: Order; onOpen: () => void }) {
  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: `${radii.lg}px`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color .15s ease',
        '&:hover': { borderColor: 'text.disabled' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          p: '18px 22px',
          bgcolor: storefront.surfaceAlt,
          borderBottom: '1px solid',
          borderColor: storefront.surfaceLine,
        }}
      >
        <Box sx={{ display: 'flex', gap: '34px', flexWrap: 'wrap' }}>
          <MetaCol label="Order" value={shortOrderId(order.id)} />
          <MetaCol label="Placed" value={orderDate(order.createdAt)} weight={600} />
          <MetaCol label="Total" value={money(order.total)} />
        </Box>
        <StatusChip status={order.status} />
      </Box>

      <Box sx={{ p: '16px 22px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {order.items.map((it, i) => (
          <ItemPill key={it.product + (it.size ?? '') + i} item={it} />
        ))}
      </Box>
    </Box>
  );
}

function ItemPill({ item }: { item: OrderItem }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        p: '7px 12px 7px 7px',
        border: '1px solid',
        borderColor: storefront.surfaceLine,
        borderRadius: `${radii.pill}px`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 30,
          height: 30,
          borderRadius: '99px',
          bgcolor: tintFor(item.product),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: 'rgba(17,24,39,.4)',
        }}
      >
        {mono(item.name)}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
        {item.name} ×{item.qty}
      </Typography>
    </Box>
  );
}

/** Deterministic warm-grey tint from the product id (order items carry no tint). */
function tintFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

function MetaCol({ label, value, weight = 700 }: { label: string; value: string; weight?: number }) {
  return (
    <Box>
      <Typography
        sx={{ fontSize: 11.5, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15, fontWeight: weight }}>{value}</Typography>
    </Box>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      {children}
    </Box>
  );
}

function Header({ count, name }: { count: number; name: string }) {
  return (
    <>
      <Typography variant="h1" sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', mb: '6px' }}>
        Your orders
      </Typography>
      <Typography sx={{ color: 'text.disabled', fontSize: 14, mb: '30px' }}>
        {count} {count === 1 ? 'order' : 'orders'}
        {name ? ` · signed in as ${name}` : ''}
      </Typography>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <Section>
      <Skeleton width={220} height={44} sx={{ mb: '6px' }} />
      <Skeleton width={280} height={20} sx={{ mb: '30px' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: `${radii.lg}px` }} />
        ))}
      </Box>
    </Section>
  );
}
