'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import { useGetOrderQuery } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import StatusChip from '@/components/StatusChip';
import EmptyState from '@/components/EmptyState';
import { money, shortOrderId } from '@/theme/format';
import { radii, emerald } from '@/theme/tokens';

const containerSx = { maxWidth: 680, mx: 'auto' } as const;

/**
 * `/order-confirmed/[id]` — the success screen after a placed order. Fetches the
 * order fresh (it was just created, so `getOrder` provides the `Orders` tag and
 * benefits from the invalidation). The cart is cleared server-side on order
 * creation; `createOrder` invalidated the `Cart` tag so the Navbar count is
 * already in sync by the time we land here.
 */
export default function OrderConfirmedScreen({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { data: order, isLoading, isError, error } = useGetOrderQuery(orderId);

  if (isLoading) return <ConfirmSkeleton />;

  if (isError || !order) {
    const status = normalizeApiError(error as never).status;
    return (
      <Box component="section" sx={{ ...containerSx, px: 4, pt: '70px', pb: '100px', textAlign: 'center' }}>
        <EmptyState
          title="Order not found"
          subtitle={
            status === 403 || status === 404
              ? "We couldn't find that order under your account."
              : 'Something went wrong loading your order.'
          }
          actionLabel="View my orders"
          onAction={() => router.push('/orders')}
        />
      </Box>
    );
  }

  return (
    <Box
      component="section"
      sx={{ ...containerSx, px: 4, pt: '70px', pb: '100px', textAlign: 'center' }}
    >
      <Box
        aria-hidden
        sx={{
          width: 72,
          height: 72,
          borderRadius: '99px',
          bgcolor: emerald.tint50,
          border: '1px solid',
          borderColor: emerald.tint200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: '24px',
          fontSize: 34,
          color: emerald.main,
        }}
      >
        ✓
      </Box>

      <Typography variant="h1" sx={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', mb: '10px' }}>
        Order confirmed
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: '30px' }}>
        Thank you. We&apos;ve emailed a receipt and will notify you when it ships.
      </Typography>

      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: `${radii.lg}px`,
          p: '24px',
          textAlign: 'left',
          mb: '28px',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '18px' }}>
          <Box>
            <Typography
              sx={{ fontSize: 12, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}
            >
              Order
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>{shortOrderId(order.id)}</Typography>
          </Box>
          <StatusChip status={order.status} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {order.items.map((it, i) => (
            <Box
              key={it.product + (it.size ?? '') + i}
              sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'text.secondary' }}
            >
              <span>
                {it.name} × {it.qty}
              </span>
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {money(it.price * it.qty)}
              </Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ height: '1px', bgcolor: 'divider', my: '16px' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
          <span>Total paid</span>
          <span>{money(order.total)}</span>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button onClick={() => router.push('/orders')} sx={{ height: 48, px: '24px', fontSize: 14 }}>
          View my orders
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => router.push('/')}
          sx={{ height: 48, px: '24px', fontSize: 14 }}
        >
          Keep shopping
        </Button>
      </Box>
    </Box>
  );
}

function ConfirmSkeleton() {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '70px', pb: '100px', textAlign: 'center' }}>
      <Skeleton variant="circular" width={72} height={72} sx={{ mx: 'auto', mb: '24px' }} />
      <Skeleton width={260} height={40} sx={{ mx: 'auto', mb: '10px' }} />
      <Skeleton width={360} height={20} sx={{ mx: 'auto', mb: '30px' }} />
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: `${radii.lg}px` }} />
    </Box>
  );
}
