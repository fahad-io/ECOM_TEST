'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from '@/store/adminApi';
import { normalizeApiError } from '@/store/normalizeError';
import { ORDER_STATUS, ORDER_STATUSES, type OrderStatus } from '@/theme/tokens';
import { money, orderDate, shortOrderId } from '@/theme/format';
import type { Order } from '@/store/ordersApi';

const GRID = '0.9fr 1.4fr 1.6fr 0.9fr 1.3fr';

/**
 * Allowed forward transitions, mirroring the backend lifecycle. The select for
 * a given order offers its current status plus its reachable next states only,
 * so the UI never even offers an illegal move (and the server is the final
 * gate, surfaced via a toast if it still rejects).
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const FILTERS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS[s].label })),
];

const CARD_SX = {
  bgcolor: '#fff',
  border: '1px solid #ECECEC',
  borderRadius: '16px',
  overflow: 'hidden',
} as const;

function itemsLabel(o: Order): string {
  const count = o.items.reduce((sum, it) => sum + it.qty, 0);
  return `${count} ${count === 1 ? 'item' : 'items'}`;
}

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
      <Box>Order</Box>
      <Box>Customer</Box>
      <Box>Items</Box>
      <Box>Total</Box>
      <Box>Status</Box>
    </Box>
  );
}

/** Inline status control: shows current + reachable statuses; terminal states are read-only. */
function StatusControl({
  order,
  onChange,
  disabled,
}: {
  order: Order;
  onChange: (next: OrderStatus) => void;
  disabled: boolean;
}) {
  const meta = ORDER_STATUS[order.status];
  const reachable = TRANSITIONS[order.status];
  const options = [order.status, ...reachable];

  if (reachable.length === 0) {
    // Terminal — no transitions; render a static chip so it's clearly final.
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          bgcolor: meta.bg,
          color: meta.color,
          px: '13px',
          py: '6px',
          borderRadius: '99px',
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <Box component="span" aria-hidden sx={{ width: 6, height: 6, borderRadius: '99px', bgcolor: meta.color }} />
        {meta.label}
      </Box>
    );
  }

  return (
    <Select
      value={order.status}
      onChange={(e) => {
        const next = e.target.value as OrderStatus;
        if (next !== order.status) onChange(next);
      }}
      disabled={disabled}
      aria-label={`Status for order ${shortOrderId(order.id)}`}
      sx={{
        height: 38,
        borderRadius: '99px',
        bgcolor: meta.bg,
        color: meta.color,
        fontSize: 13,
        fontWeight: 600,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
        '& .MuiSelect-icon': { color: meta.color },
      }}
    >
      {options.map((s) => (
        <MenuItem key={s} value={s} sx={{ fontSize: 13.5 }}>
          {ORDER_STATUS[s].label}
        </MenuItem>
      ))}
    </Select>
  );
}

/**
 * Admin order management body. Status filter tabs (All / Pending / … /
 * Cancelled) with counts, and a table of every order (id, customer, items,
 * total, inline status control). The control respects the order lifecycle and
 * surfaces a server rejection (illegal transition → 400) via a toast.
 */
export default function OrdersScreen() {
  const [filter, setFilter] = React.useState<'all' | OrderStatus>('all');
  const [toast, setToast] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const query = useGetAdminOrdersQuery(filter === 'all' ? undefined : filter);
  // A second unfiltered query supplies stable per-status counts for the tabs.
  const all = useGetAdminOrdersQuery(undefined);
  const [updateStatus] = useUpdateOrderStatusMutation();

  const orders = query.data ?? [];

  const counts = React.useMemo(() => {
    const map: Record<string, number> = { all: all.data?.length ?? 0 };
    for (const s of ORDER_STATUSES) map[s] = 0;
    for (const o of all.data ?? []) map[o.status] = (map[o.status] ?? 0) + 1;
    return map;
  }, [all.data]);

  const change = async (order: Order, next: OrderStatus) => {
    setSavingId(order.id);
    try {
      await updateStatus({ id: order.id, status: next }).unwrap();
    } catch (err) {
      setToast(normalizeApiError(err as never).message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Box sx={{ animation: 'fadeUp .35s ease both' }}>
      {/* filter tabs */}
      <Box sx={{ display: 'flex', gap: '8px', mb: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <Box
              key={f.value}
              role="button"
              tabIndex={0}
              onClick={() => setFilter(f.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFilter(f.value);
                }
              }}
              sx={{
                px: '16px',
                py: '8px',
                borderRadius: '99px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: active ? '#111827' : '#E5E7EB',
                bgcolor: active ? '#111827' : '#fff',
                color: active ? '#fff' : '#374151',
              }}
            >
              {f.label} <Box component="span" sx={{ opacity: 0.6 }}>{counts[f.value] ?? 0}</Box>
            </Box>
          );
        })}
      </Box>

      {query.isError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          {normalizeApiError(query.error as never).message}
        </Alert>
      )}

      <Box sx={CARD_SX}>
        <HeaderRow />
        {query.isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: GRID, gap: '16px', p: '14px 22px', borderBottom: '1px solid #F4F4F2', alignItems: 'center' }}>
                <Skeleton width="60%" />
                <Skeleton width="70%" />
                <Skeleton width="40%" />
                <Skeleton width="40%" />
                <Skeleton width="60%" />
              </Box>
            ))
          : orders.map((o) => (
              <Box key={o.id} sx={{ display: 'grid', gridTemplateColumns: GRID, gap: '16px', p: '14px 22px', borderBottom: '1px solid #F4F4F2', alignItems: 'center' }}>
                <Box sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{shortOrderId(o.id)}</Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }} noWrap>
                    {o.shippingAddress.fullName}
                  </Typography>
                  <Typography sx={{ fontSize: 12.5, color: '#9CA3AF' }}>{orderDate(o.createdAt)}</Typography>
                </Box>
                <Box sx={{ fontSize: 13, color: '#6B7280' }}>{itemsLabel(o)}</Box>
                <Box sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{money(o.total)}</Box>
                <Box>
                  <StatusControl order={o} disabled={savingId === o.id} onChange={(next) => change(o, next)} />
                </Box>
              </Box>
            ))}

        {!query.isLoading && !query.isError && orders.length === 0 && (
          <Box sx={{ p: '48px 22px', textAlign: 'center' }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827', mb: '6px' }}>
              No orders {filter === 'all' ? 'yet' : `in “${ORDER_STATUS[filter as OrderStatus].label}”`}
            </Typography>
            <Typography sx={{ fontSize: 13.5, color: '#9CA3AF' }}>
              Orders will appear here as customers check out.
            </Typography>
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setToast(null)} sx={{ borderRadius: '10px' }}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
