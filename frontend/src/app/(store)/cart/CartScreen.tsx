'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import {
  useGetCartQuery,
  useUpdateItemMutation,
  useRemoveItemMutation,
  type CartItem,
} from '@/store/cartApi';
import { normalizeApiError } from '@/store/normalizeError';
import EmptyState from '@/components/EmptyState';
import { money, mono } from '@/theme/format';
import { radii, stock as stockColors } from '@/theme/tokens';

const containerSx = { maxWidth: 1100, mx: 'auto' } as const;

/**
 * `/cart` — the shopping bag. Line items (tint + mono, name, category, per-unit
 * price, quantity stepper bound to `updateItem`, line total, Remove) on the
 * left; a sticky Summary panel (Subtotal / Shipping / Total) on the right.
 *
 * All money comes straight from the server `getCart` response — the business
 * rules ($12 flat shipping, free over $150) live on the backend and are never
 * recomputed here. Mutations invalidate the Cart tag, so totals refetch.
 */
export default function CartScreen() {
  const router = useRouter();
  const { data: cart, isLoading, isError, error, refetch } = useGetCartQuery();

  const goShop = () => router.push('/');

  if (isLoading) return <CartSkeleton />;

  if (isError) {
    return (
      <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
        <Typography variant="h1" sx={{ fontSize: 34, fontWeight: 800, mb: '30px' }}>
          Your cart
        </Typography>
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
      </Box>
    );
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      <Typography
        variant="h1"
        sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', mb: '30px' }}
      >
        Your cart
      </Typography>

      {isEmpty ? (
        <EmptyState
          title="Your cart is empty"
          subtitle="Add a few considered essentials to get started."
          actionLabel="Continue shopping"
          onAction={goShop}
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
            gap: '40px',
            alignItems: 'start',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radii.lg}px`,
              overflow: 'hidden',
            }}
          >
            {items.map((item) => (
              <CartLine key={item.product.id} item={item} />
            ))}
          </Box>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radii.lg}px`,
              p: '24px',
              position: { md: 'sticky' },
              top: 96,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                mb: '18px',
              }}
            >
              Summary
            </Typography>

            <SummaryRow label="Subtotal" value={money(cart!.subtotal)} />
            <SummaryRow
              label="Shipping"
              value={cart!.shipping === 0 ? 'Free' : money(cart!.shipping)}
              valueColor={cart!.shipping === 0 ? stockColors.in : undefined}
            />

            <Box sx={{ height: '1px', bgcolor: 'divider', my: '16px' }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 800,
                mb: '20px',
              }}
            >
              <span>Total</span>
              <span>{money(cart!.total)}</span>
            </Box>

            <Button fullWidth onClick={() => router.push('/checkout')} sx={{ height: 50, fontSize: 15 }}>
              Checkout
            </Button>
            <Link
              onClick={goShop}
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: '14px',
                fontSize: 13.5,
                color: 'text.secondary',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Continue shopping
            </Link>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/** A single cart row: tint, name/category/price, stepper + line total + remove. */
function CartLine({ item }: { item: CartItem }) {
  const { product, qty, size } = item;
  const [updateItem, updateState] = useUpdateItemMutation();
  const [removeItem, removeState] = useRemoveItemMutation();
  const busy = updateState.isLoading || removeState.isLoading;

  const setQty = (next: number) => {
    if (next === qty) return;
    updateItem({ productId: product.id, qty: next, size });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '18px',
        p: '20px',
        borderBottom: '1px solid',
        borderColor: 'divider',
        alignItems: 'center',
        opacity: busy ? 0.6 : 1,
        transition: 'opacity .15s ease',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 104,
          borderRadius: '11px',
          bgcolor: product.tint || '#EAE8E3',
          flex: '0 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          component="span"
          aria-hidden
          sx={{ fontSize: 34, fontWeight: 800, color: 'rgba(17,24,39,.10)' }}
        >
          {mono(product.name)}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{product.name}</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
            {money(product.price * qty)}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 13, color: 'text.disabled', mt: '3px', mb: '14px' }}>
          {product.category} · {money(product.price)} each
          {size ? ` · Size ${size}` : ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: `${radii.pill}px`,
              overflow: 'hidden',
            }}
          >
            <StepBtn label="Decrease quantity" disabled={busy || qty <= 1} onClick={() => setQty(qty - 1)}>
              −
            </StepBtn>
            <Box sx={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{qty}</Box>
            <StepBtn
              label="Increase quantity"
              disabled={busy || qty >= Math.max(1, product.stock)}
              onClick={() => setQty(qty + 1)}
            >
              +
            </StepBtn>
          </Box>

          <Link
            onClick={busy ? undefined : () => removeItem(product.id)}
            sx={{
              fontSize: 13,
              color: 'text.disabled',
              cursor: busy ? 'default' : 'pointer',
              fontWeight: 500,
            }}
          >
            Remove
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

function StepBtn({
  children,
  label,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        width: 36,
        height: 38,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'text.disabled' : 'text.secondary',
        userSelect: 'none',
      }}
    >
      {children}
    </Box>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 14,
        color: 'text.secondary',
        mb: '12px',
      }}
    >
      <span>{label}</span>
      <Box component="span" sx={{ fontWeight: 600, color: valueColor ?? 'text.primary' }}>
        {value}
      </Box>
    </Box>
  );
}

function CartSkeleton() {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '40px', pb: '90px' }}>
      <Skeleton width={180} height={44} sx={{ mb: '30px' }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 360px' },
          gap: '40px',
          alignItems: 'start',
        }}
      >
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: `${radii.lg}px`,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                gap: '18px',
                p: '20px',
                borderBottom: i < 2 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="rounded" width={88} height={104} sx={{ borderRadius: '11px' }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="50%" height={22} />
                <Skeleton width="35%" height={16} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" width={120} height={38} sx={{ borderRadius: '99px' }} />
              </Box>
            </Box>
          ))}
        </Box>
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: `${radii.lg}px` }} />
      </Box>
    </Box>
  );
}
