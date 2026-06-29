'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import { useGetOrderQuery, type OrderItem } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import StatusChip from '@/components/StatusChip';
import EmptyState from '@/components/EmptyState';
import { money, mono, shortOrderId, orderDate } from '@/theme/format';
import { radii, stock as stockColors, TINTS } from '@/theme/tokens';

const containerSx = { maxWidth: 760, mx: 'auto' } as const;

/**
 * `/orders/[id]` — a single order. Owner-only server-side (403/404 for anyone
 * else), so a not-found / forbidden response renders a friendly empty state
 * rather than leaking which orders exist.
 */
export default function OrderDetailScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useGetOrderQuery(orderId);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !order) {
    const status = normalizeApiError(error as never).status;
    const forbidden = status === 403 || status === 404;
    return (
      <Box component="section" sx={{ ...containerSx, px: 4, pt: '50px', pb: '90px' }}>
        <BackLink onClick={() => router.push('/orders')} />
        <EmptyState
          title="Order not found"
          subtitle={
            forbidden
              ? "We couldn't find that order under your account."
              : 'Something went wrong loading this order.'
          }
          actionLabel="Back to orders"
          onAction={() => router.push('/orders')}
        />
      </Box>
    );
  }

  const addr = order.shippingAddress;

  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      <BackLink onClick={() => router.push('/orders')} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', mb: '6px' }}>
        <Typography variant="h1" sx={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em' }}>
          Order {shortOrderId(order.id)}
        </Typography>
        <StatusChip status={order.status} sx={{ mt: '6px' }} />
      </Box>
      <Typography sx={{ color: 'text.disabled', fontSize: 14, mb: '30px' }}>
        Placed {orderDate(order.createdAt)}
      </Typography>

      {/* Items */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radii.lg}px`, overflow: 'hidden', mb: '24px' }}>
        {order.items.map((it, i) => (
          <ItemRow key={it.product + (it.size ?? '') + i} item={it} last={i === order.items.length - 1} />
        ))}
      </Box>

      {/* Totals */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radii.lg}px`, p: '20px 22px', mb: '24px' }}>
        <SummaryRow label="Subtotal" value={money(order.subtotal)} />
        <SummaryRow
          label="Shipping"
          value={order.shipping === 0 ? 'Free' : money(order.shipping)}
          valueColor={order.shipping === 0 ? stockColors.in : undefined}
        />
        <Box sx={{ height: '1px', bgcolor: 'divider', my: '14px' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
          <span>Total</span>
          <span>{money(order.total)}</span>
        </Box>
      </Box>

      {/* Shipping address */}
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: `${radii.lg}px`, p: '20px 22px' }}>
        <Typography
          sx={{ fontSize: 12, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, mb: '12px' }}
        >
          Shipping address
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{addr.fullName}</Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{addr.email}</Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: '6px' }}>{addr.street}</Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
          {addr.city} {addr.postalCode}
        </Typography>
      </Box>
    </Box>
  );
}

function ItemRow({ item, last }: { item: OrderItem; last: boolean }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        p: '16px 20px',
        borderBottom: last ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 48,
          height: 56,
          borderRadius: '10px',
          bgcolor: tintFor(item.product),
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 16,
          fontWeight: 800,
          color: 'rgba(17,24,39,.18)',
        }}
      >
        {mono(item.name)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{item.name}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
          {money(item.price)} each{item.size ? ` · Size ${item.size}` : ''} · Qty {item.qty}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{money(item.price * item.qty)}</Typography>
    </Box>
  );
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'text.secondary', mb: '10px' }}>
      <span>{label}</span>
      <Box component="span" sx={{ fontWeight: 600, color: valueColor ?? 'text.primary' }}>
        {value}
      </Box>
    </Box>
  );
}

function BackLink({ onClick }: { onClick: () => void }) {
  return (
    <Link
      onClick={onClick}
      sx={{ display: 'inline-block', mb: '18px', fontSize: 13.5, color: 'text.secondary', fontWeight: 500, cursor: 'pointer' }}
    >
      ← Back to orders
    </Link>
  );
}

/** Deterministic warm-grey tint from the product id (order items carry no tint). */
function tintFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

function DetailSkeleton() {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      <Skeleton width={120} height={20} sx={{ mb: '18px' }} />
      <Skeleton width={220} height={40} sx={{ mb: '6px' }} />
      <Skeleton width={160} height={20} sx={{ mb: '30px' }} />
      <Skeleton variant="rounded" height={180} sx={{ borderRadius: `${radii.lg}px`, mb: '24px' }} />
      <Skeleton variant="rounded" height={140} sx={{ borderRadius: `${radii.lg}px`, mb: '24px' }} />
      <Skeleton variant="rounded" height={140} sx={{ borderRadius: `${radii.lg}px` }} />
    </Box>
  );
}
