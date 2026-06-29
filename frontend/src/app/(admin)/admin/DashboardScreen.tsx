'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useGetDashboardQuery } from '@/store/adminApi';
import { normalizeApiError } from '@/store/normalizeError';
import { ORDER_STATUS, emerald, storefront } from '@/theme/tokens';
import { money, mono } from '@/theme/format';
import type {
  DashboardOrdersByStatus,
  DashboardSalesPoint,
  DashboardTopProduct,
} from '@/store/adminApi';

const CARD_SX = {
  bgcolor: '#fff',
  border: '1px solid #ECECEC',
  borderRadius: '16px',
} as const;

/** `2026-06` -> `Jun`. Falls back to the raw key if unparseable. */
function monthLabel(key: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(key);
  if (!m) return key;
  const idx = Number(m[2]) - 1;
  const names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return names[idx] ?? key;
}

/** `24800` -> `$24.8k` (compact bar label), `850` -> `$850`. */
function compactMoney(n: number): string {
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k';
  return '$' + n;
}

function KpiCard({ label, value, note, noteColor }: { label: string; value: string; note: string; noteColor: string }) {
  return (
    <Box sx={{ ...CARD_SX, p: '20px' }}>
      <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontWeight: 600, mb: '12px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, mt: '8px', color: noteColor }}>
        {note}
      </Typography>
    </Box>
  );
}

/**
 * Lightweight themed CSS bar chart for the monthly sales series. No charting
 * dependency — bars are flex columns whose height is the percentage of the max
 * month; the latest month is highlighted emerald, the rest neutral grey,
 * matching the mockup's quiet style.
 */
function SalesChart({ data }: { data: DashboardSalesPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <Box sx={{ ...CARD_SX, p: '24px' }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: '24px' }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Sales over time</Typography>
        <Typography sx={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
          Last {data.length} {data.length === 1 ? 'month' : 'months'}
        </Typography>
      </Box>
      {data.length === 0 ? (
        <Typography sx={{ fontSize: 13.5, color: '#9CA3AF', py: '40px', textAlign: 'center' }}>
          No sales yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '18px', height: 200, pt: '10px' }}>
          {data.map((d, i) => {
            const isLast = i === data.length - 1;
            const h = Math.round((d.total / max) * 100);
            return (
              <Box
                key={d.month}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>
                  {compactMoney(d.total)}
                </Typography>
                <Box
                  role="img"
                  aria-label={`${monthLabel(d.month)}: ${money(d.total)}`}
                  sx={{
                    width: '100%',
                    borderRadius: '8px 8px 0 0',
                    bgcolor: isLast ? emerald.main : storefront.borderStrong,
                    height: `${Math.max(2, h)}%`,
                    transition: 'height .5s ease',
                  }}
                />
                <Typography sx={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>
                  {monthLabel(d.month)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

/** "Orders by status": a segmented bar + a labelled legend with counts. */
function StatusBreakdown({ data }: { data: DashboardOrdersByStatus[] }) {
  const total = data.reduce((sum, s) => sum + s.count, 0);
  return (
    <Box sx={{ ...CARD_SX, p: '24px' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: '20px', color: '#111827' }}>
        Orders by status
      </Typography>
      <Box sx={{ display: 'flex', height: 14, borderRadius: '99px', overflow: 'hidden', mb: '22px', bgcolor: '#F1F1EF' }}>
        {data.map((s) =>
          s.count > 0 ? (
            <Box
              key={s.status}
              sx={{ width: `${(s.count / total) * 100}%`, bgcolor: ORDER_STATUS[s.status].color }}
            />
          ) : null,
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
        {data.map((s) => (
          <Box
            key={s.status}
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13.5 }}
          >
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <Box
                component="span"
                aria-hidden
                sx={{ width: 9, height: 9, borderRadius: '99px', bgcolor: ORDER_STATUS[s.status].color }}
              />
              <Box component="span" sx={{ fontWeight: 500, color: '#374151' }}>
                {ORDER_STATUS[s.status].label}
              </Box>
            </Box>
            <Box component="span" sx={{ fontWeight: 700, color: '#111827' }}>
              {s.count}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/** "Top-selling products": ranked rows with mono swatch, progress bar, units, revenue. */
function TopProducts({ data }: { data: DashboardTopProduct[] }) {
  const max = Math.max(1, ...data.map((t) => t.units));
  return (
    <Box sx={{ ...CARD_SX, p: '24px' }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: '18px', color: '#111827' }}>
        Top-selling products
      </Typography>
      {data.length === 0 ? (
        <Typography sx={{ fontSize: 13.5, color: '#9CA3AF', py: '24px', textAlign: 'center' }}>
          No sales recorded yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.map((t, i) => (
            <Box
              key={t.productId}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                py: '10px',
                borderBottom: '1px solid #F4F4F2',
              }}
            >
              <Box sx={{ width: 18, fontSize: 13, fontWeight: 800, color: '#9CA3AF' }}>{i + 1}</Box>
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  height: 48,
                  borderRadius: '9px',
                  bgcolor: '#EAE8E3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 800,
                  color: 'rgba(17,24,39,.35)',
                }}
              >
                {mono(t.name)}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#111827' }} noWrap>
                  {t.name}
                </Typography>
              </Box>
              <Box sx={{ flex: '0 0 200px', display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ height: 8, borderRadius: '99px', bgcolor: '#F1F1EF', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      height: '100%',
                      borderRadius: '99px',
                      bgcolor: emerald.main,
                      width: `${Math.round((t.units / max) * 100)}%`,
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ width: 80, textAlign: 'right', fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                {t.units} sold
              </Box>
              <Box sx={{ width: 84, textAlign: 'right', fontSize: 13.5, fontWeight: 700, color: '#111827' }}>
                {money(t.revenue)}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

function DashboardSkeleton() {
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '18px', mb: '24px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={118} sx={{ borderRadius: '16px' }} />
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px', mb: '24px' }}>
        <Skeleton variant="rounded" height={290} sx={{ borderRadius: '16px' }} />
        <Skeleton variant="rounded" height={290} sx={{ borderRadius: '16px' }} />
      </Box>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: '16px' }} />
    </Box>
  );
}

/**
 * Admin dashboard body (rendered inside `AdminShell`). KPI cards, a sales bar
 * chart, an orders-by-status breakdown, and the top-selling products list — all
 * from `GET /admin/dashboard`. Handles loading, error, and empty data.
 */
export default function DashboardScreen() {
  const { data, isLoading, isError, error, refetch } = useGetDashboardQuery();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !data) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: '12px' }}
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }
      >
        {isError ? normalizeApiError(error as never).message : 'Could not load the dashboard.'}
      </Alert>
    );
  }

  return (
    <Box sx={{ animation: 'fadeUp .35s ease both' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' },
          gap: '18px',
          mb: '24px',
        }}
      >
        <KpiCard label="Total sales" value={money(data.totalSales)} note="Paid + active orders" noteColor={emerald.main} />
        <KpiCard label="Orders" value={String(data.orderCount)} note="All time" noteColor={emerald.main} />
        <KpiCard label="Products" value={String(data.productCount)} note="In catalog" noteColor={emerald.main} />
        <KpiCard
          label="Low stock items"
          value={String(data.lowStockCount)}
          note={data.lowStockCount > 0 ? 'Needs attention' : 'All healthy'}
          noteColor={data.lowStockCount > 0 ? '#D97706' : emerald.main}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.6fr 1fr' },
          gap: '18px',
          mb: '24px',
        }}
      >
        <SalesChart data={data.salesOverTime} />
        <StatusBreakdown data={data.ordersByStatus} />
      </Box>

      <TopProducts data={data.topProducts} />
    </Box>
  );
}
