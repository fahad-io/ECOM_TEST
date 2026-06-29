'use client';

import * as React from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useGetCustomerQuery } from '@/store/adminApi';
import type { Order } from '@/store/ordersApi';
import { normalizeApiError } from '@/store/normalizeError';
import StatusChip from '@/components/StatusChip';
import { money, mono, orderDate, shortOrderId } from '@/theme/format';

export default function CustomerDetailScreen({ id }: { id: string }) {
  const { data, isLoading, isError, error, refetch } = useGetCustomerQuery(id);

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ mb: '20px' }}>
        <Button
          component={Link}
          href="/admin/customers"
          size="small"
          sx={{ fontSize: 13, color: '#6B7280', px: 0 }}
        >
          ← Back to customers
        </Button>
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

      {isLoading && (
        <>
          <Skeleton width={260} height={40} sx={{ mb: 1 }} />
          <Skeleton width={180} height={20} sx={{ mb: 4 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rounded" height={92} sx={{ borderRadius: '16px' }} />
            ))}
          </Box>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: '16px' }} />
        </>
      )}

      {data && (
        <>
          {/* profile header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', mb: '28px' }}>
            <Box
              aria-hidden
              sx={{
                width: 56,
                height: 56,
                borderRadius: '99px',
                bgcolor: '#ECFDF5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 800,
                flex: '0 0 auto',
              }}
            >
              {mono(data.name)}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', color: '#111827' }}>
                {data.name}
              </Typography>
              <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
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
              mb: '34px',
            }}
          >
            <StatCard label="Total spent" value={money(data.stats.totalSpent)} />
            <StatCard label="Orders" value={String(data.stats.orderCount)} />
            <StatCard label="Items purchased" value={String(data.stats.itemsPurchased)} />
            <StatCard
              label="Last order"
              value={data.stats.lastOrderAt ? orderDate(data.stats.lastOrderAt) : '—'}
            />
          </Box>

          {/* order history */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#9CA3AF', mb: '14px' }}>
            Order history
          </Typography>
          {data.orders.length === 0 ? (
            <Box sx={{ p: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: 14, border: '1px solid #ECECEC', borderRadius: '16px', bgcolor: '#fff' }}>
              This customer hasn’t placed any orders yet.
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.orders.map((o) => (
                <OrderRow key={o.id} order={o} />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #ECECEC', borderRadius: '16px', p: '16px 18px' }}>
      <Typography sx={{ fontSize: 12.5, color: '#9CA3AF', mb: '6px' }}>{label}</Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
        {value}
      </Typography>
    </Box>
  );
}

function OrderRow({ order }: { order: Order }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #ECECEC',
        borderRadius: '14px',
        p: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#111827' }}>
          {shortOrderId(order.id)}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: '#9CA3AF' }}>
          {orderDate(order.createdAt)} · {itemCount} item{itemCount === 1 ? '' : 's'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <StatusChip status={order.status} />
        <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#111827', minWidth: 64, textAlign: 'right' }}>
          {money(order.total)}
        </Typography>
      </Box>
    </Box>
  );
}
