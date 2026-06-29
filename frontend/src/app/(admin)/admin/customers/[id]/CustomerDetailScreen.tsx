'use client';

import * as React from 'react';
import NextLink from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useGetCustomerQuery } from '@/store/adminApi';
import type { Order } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import StatusChip from '@/components/StatusChip';
import { money, mono, orderDate, shortOrderId } from '@/theme/format';

const INK = '#111827';
const MUTED = '#6B7280';
const FAINT = '#9CA3AF';
const LINE = '#ECECEC';
const CARD_SX = { bgcolor: '#fff', border: `1px solid ${LINE}`, borderRadius: '16px' } as const;

export default function CustomerDetailScreen({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useGetCustomerQuery(id);

  return (
    <Box sx={{ width: '100%' }}>
      {/* back link */}
      <Box
        component={NextLink}
        href="/admin/customers"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          mb: '22px',
          color: MUTED,
          fontSize: 13.5,
          fontWeight: 500,
          textDecoration: 'none',
          transition: 'color .12s ease',
          '&:hover': { color: '#047857' },
        }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        Back to customers
      </Box>

      {isError && (
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
      )}

      {isLoading && <DetailSkeleton />}

      {data && (
        <>
          {/* profile header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '26px' }}>
            <Box
              aria-hidden
              sx={{
                width: 60,
                height: 60,
                borderRadius: '99px',
                bgcolor: '#ECFDF5',
                color: '#047857',
                border: '1px solid #D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
                fontWeight: 800,
                flex: '0 0 auto',
              }}
            >
              {mono(data.name)}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.015em', color: INK, lineHeight: 1.1 }}>
                {data.name}
              </Typography>
              <Typography sx={{ fontSize: 14, color: MUTED, mt: '4px' }}>
                {data.email} · Joined {orderDate(data.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* stat cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 2,
              mb: '36px',
            }}
          >
            <StatCard label="Total spent" value={money(data.stats.totalSpent)} accent />
            <StatCard label="Orders" value={String(data.stats.orderCount)} />
            <StatCard label="Items purchased" value={String(data.stats.itemsPurchased)} />
            <StatCard
              label="Last order"
              value={data.stats.lastOrderAt ? orderDate(data.stats.lastOrderAt) : '—'}
            />
          </Box>

          {/* order history with line items */}
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: FAINT, mb: '14px' }}
          >
            Order history
          </Typography>

          {data.orders.length === 0 ? (
            <Box sx={{ ...CARD_SX, p: '40px', textAlign: 'center', color: MUTED, fontSize: 14 }}>
              This customer hasn’t placed any orders yet.
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Box sx={{ ...CARD_SX, p: '16px 18px' }}>
      <Typography sx={{ fontSize: 12.5, color: FAINT, mb: '6px' }}>{label}</Typography>
      <Typography
        sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: accent ? '#047857' : INK }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <Box sx={{ ...CARD_SX, overflow: 'hidden' }}>
      {/* header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          p: '15px 20px',
          bgcolor: '#FAFAF9',
          borderBottom: `1px solid ${LINE}`,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: INK }}>
            {shortOrderId(order.id)}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: FAINT }}>
            {orderDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <StatusChip status={order.status} />
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: INK }}>{money(order.total)}</Typography>
        </Box>
      </Box>

      {/* line items — what they ordered */}
      <Box sx={{ p: '6px 20px' }}>
        {order.items.map((it, i) => (
          <Box
            key={`${it.product}-${it.size ?? ''}-${i}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '13px',
              py: '12px',
              borderBottom: i < order.items.length - 1 ? `1px solid #F4F4F2` : 'none',
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: '#F3F4F6',
                color: '#6B7280',
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12.5,
                fontWeight: 800,
              }}
            >
              {mono(it.name)}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: INK }} noWrap>
                {it.name}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: FAINT }}>
                {money(it.price)} each
                {it.size ? ` · Size ${it.size}` : ''} · Qty {it.qty}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK }}>
              {money(it.price * it.qty)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '26px' }}>
        <Skeleton variant="circular" width={60} height={60} />
        <Box>
          <Skeleton width={180} height={32} />
          <Skeleton width={240} height={20} />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: '36px' }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" height={86} sx={{ borderRadius: '16px' }} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={160} sx={{ borderRadius: '16px' }} />
    </>
  );
}
