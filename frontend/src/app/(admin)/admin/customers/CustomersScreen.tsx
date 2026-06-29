'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useGetCustomersQuery } from '@/store/adminApi';
import { normalizeApiError } from '@/store/normalizeError';
import { money, mono, orderDate } from '@/theme/format';

const GRID = '2.2fr 1.1fr 0.8fr 1fr 0.8fr';

const CARD_SX = {
  bgcolor: '#fff',
  border: '1px solid #ECECEC',
  borderRadius: '16px',
  overflow: 'hidden',
} as const;

function HeaderRow() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: GRID,
        gap: '16px',
        p: '14px 22px',
        bgcolor: '#FAFAF9',
        borderBottom: '1px solid #ECECEC',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#9CA3AF',
        fontWeight: 700,
      }}
    >
      <Box>Customer</Box>
      <Box>Joined</Box>
      <Box>Orders</Box>
      <Box>Total spent</Box>
      <Box sx={{ textAlign: 'right' }}>Actions</Box>
    </Box>
  );
}

/**
 * Admin customers list: each customer with join date, order count, and money
 * spent. Rows (and the View button) open the customer detail.
 */
export default function CustomersScreen() {
  const router = useRouter();
  const { data: customers, isLoading, isError, error, refetch } = useGetCustomersQuery();

  const open = (id: string) => router.push(`/admin/customers/${id}`);

  return (
    <Box sx={{ maxWidth: 1080 }}>
      <Box sx={{ mb: '22px' }}>
        <Typography sx={{ fontSize: 14, color: '#6B7280' }}>
          {customers ? `${customers.length} customer${customers.length === 1 ? '' : 's'}` : 'Customers'}
        </Typography>
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

      <Box sx={CARD_SX}>
        <HeaderRow />
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Box
                key={i}
                sx={{ display: 'grid', gridTemplateColumns: GRID, gap: '16px', p: '14px 22px', borderBottom: '1px solid #F4F4F2' }}
              >
                <Skeleton width="70%" />
                <Skeleton width="50%" />
                <Skeleton width="30%" />
                <Skeleton width="40%" />
                <Skeleton width="40%" sx={{ ml: 'auto' }} />
              </Box>
            ))
          : customers && customers.length > 0
            ? customers.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: GRID,
                    gap: '16px',
                    p: '13px 22px',
                    borderBottom: '1px solid #F4F4F2',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#FAFAF9' },
                    '&:last-of-type': { borderBottom: 'none' },
                  }}
                  onClick={() => open(c.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <Box
                      aria-hidden
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '99px',
                        bgcolor: '#ECFDF5',
                        color: '#047857',
                        flex: '0 0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {mono(c.name)}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }} noWrap>
                        {c.name}
                      </Typography>
                      <Typography sx={{ fontSize: 12.5, color: '#9CA3AF' }} noWrap>
                        {c.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ fontSize: 13.5, color: '#6B7280' }}>{orderDate(c.createdAt)}</Box>
                  <Box sx={{ fontSize: 14, color: '#111827' }}>{c.orderCount}</Box>
                  <Box sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{money(c.totalSpent)}</Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={(e) => {
                        e.stopPropagation();
                        open(c.id);
                      }}
                      sx={{ fontSize: 13, color: '#047857' }}
                    >
                      View
                    </Button>
                  </Box>
                </Box>
              ))
            : !isError && (
                <Box sx={{ p: '40px 22px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                  No customers yet.
                </Box>
              )}
      </Box>
    </Box>
  );
}
