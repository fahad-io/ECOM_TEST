'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useGetCustomersQuery, type CustomerListItem } from '@/store/adminApi';
import { normalizeApiError } from '@/store/normalizeError';
import { money, mono, orderDate } from '@/theme/format';

const GRID = '2.4fr 1.1fr 0.9fr 1fr 0.7fr';
const INK = '#111827';
const MUTED = '#6B7280';
const FAINT = '#9CA3AF';
const LINE = '#ECECEC';

const CARD_SX = {
  bgcolor: '#fff',
  border: `1px solid ${LINE}`,
  borderRadius: '16px',
} as const;

export default function CustomersScreen() {
  const router = useRouter();
  const { data: customers, isLoading, isError, error, refetch } = useGetCustomersQuery();

  const open = (id: string) => router.push(`/admin/customers/${id}`);

  const totals = React.useMemo(() => {
    const list = customers ?? [];
    return {
      count: list.length,
      orders: list.reduce((s, c) => s + c.orderCount, 0),
      revenue: list.reduce((s, c) => s + c.totalSpent, 0),
    };
  }, [customers]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* summary KPIs */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
          mb: '28px',
        }}
      >
        <Kpi
          icon={<PeopleOutlinedIcon />}
          label="Customers"
          value={isLoading ? null : String(totals.count)}
        />
        <Kpi
          icon={<ReceiptLongOutlinedIcon />}
          label="Orders placed"
          value={isLoading ? null : String(totals.orders)}
        />
        <Kpi
          icon={<PaidOutlinedIcon />}
          label="Revenue"
          value={isLoading ? null : money(totals.revenue)}
          accent
        />
      </Box>

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {normalizeApiError(error as never).message}
        </Alert>
      )}

      <Typography
        sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: FAINT, mb: '12px' }}
      >
        All customers
      </Typography>

      <Box sx={{ ...CARD_SX, overflow: 'hidden' }}>
        {/* header row */}
        <Box
          sx={{
            display: { xs: 'none', sm: 'grid' },
            gridTemplateColumns: GRID,
            gap: '16px',
            p: '13px 22px',
            bgcolor: '#FAFAF9',
            borderBottom: `1px solid ${LINE}`,
            fontSize: 11.5,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: FAINT,
            fontWeight: 700,
          }}
        >
          <Box>Customer</Box>
          <Box>Joined</Box>
          <Box>Orders</Box>
          <Box>Total spent</Box>
          <Box sx={{ textAlign: 'right' }}>Actions</Box>
        </Box>

        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '12px', p: '16px 22px', borderBottom: `1px solid #F4F4F2` }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="40%" />
                <Skeleton width="55%" />
              </Box>
            </Box>
          ))}

        {!isLoading && customers && customers.length > 0 &&
          customers.map((c) => <Row key={c.id} c={c} onOpen={open} />)}

        {!isLoading && !isError && customers && customers.length === 0 && (
          <Box sx={{ p: '52px 22px', textAlign: 'center' }}>
            <PeopleOutlinedIcon sx={{ fontSize: 34, color: FAINT, mb: 1 }} />
            <Typography sx={{ color: MUTED, fontSize: 14 }}>No customers yet.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  accent?: boolean;
}) {
  return (
    <Box sx={{ ...CARD_SX, p: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      <Box
        aria-hidden
        sx={{
          width: 42,
          height: 42,
          borderRadius: '12px',
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: accent ? '#ECFDF5' : '#F3F4F6',
          color: accent ? '#047857' : '#6B7280',
          '& svg': { fontSize: 22 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: FAINT, mb: '2px' }}>{label}</Typography>
        {value === null ? (
          <Skeleton width={56} height={26} />
        ) : (
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: INK, letterSpacing: '-0.01em' }}>
            {value}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function Row({ c, onOpen }: { c: CustomerListItem; onOpen: (id: string) => void }) {
  return (
    <Box
      onClick={() => onOpen(c.id)}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr auto', sm: GRID },
        gap: '16px',
        p: '15px 22px',
        borderBottom: `1px solid #F4F4F2`,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background .12s ease',
        '&:hover': { bgcolor: '#FAFAF9' },
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '13px', minWidth: 0 }}>
        <Box
          aria-hidden
          sx={{
            width: 40,
            height: 40,
            borderRadius: '99px',
            bgcolor: '#ECFDF5',
            color: '#047857',
            border: '1px solid #D1FAE5',
            flex: '0 0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13.5,
            fontWeight: 800,
          }}
        >
          {mono(c.name)}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: INK }} noWrap>
            {c.name}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: FAINT }} noWrap>
            {c.email}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 13.5, color: MUTED }}>
        {orderDate(c.createdAt)}
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 26,
            height: 24,
            px: '8px',
            borderRadius: '99px',
            bgcolor: '#F3F4F6',
            color: INK,
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {c.orderCount}
        </Box>
      </Box>

      <Box sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 14.5, fontWeight: 700, color: INK }}>
        {money(c.totalSpent)}
      </Box>

      <Box sx={{ textAlign: 'right' }}>
        <Button
          size="small"
          variant="text"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(c.id);
          }}
          sx={{ fontSize: 13, color: '#047857', fontWeight: 600, '&:hover': { bgcolor: '#ECFDF5' } }}
        >
          View
        </Button>
      </Box>
    </Box>
  );
}
