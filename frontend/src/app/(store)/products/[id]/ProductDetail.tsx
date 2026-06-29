'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
  useGetProductQuery,
  useGetProductRecommendationsQuery,
} from '@/store/productsApi';
import { useAddItemMutation } from '@/store/cartApi';
import { useAuth } from '@/store/useAuth';
import { normalizeApiError } from '@/store/normalizeError';
import TintSwatch from '@/components/TintSwatch';
import StockLabel from '@/components/StockLabel';
import QuantityStepper from '@/components/QuantityStepper';
import { money, mono } from '@/theme/format';
import { radii } from '@/theme/tokens';
import Recommendations from './Recommendations';

const containerSx = { maxWidth: 1240, mx: 'auto' } as const;

/**
 * Product detail screen. Breadcrumb, large tint hero, name + price + stock,
 * description, Size selector (omitted for one-size products), quantity stepper,
 * and the ink "Add to cart" pill. Below: a "You may also like" Swiper driven by
 * the recommendations endpoint.
 *
 * Add-to-cart is per-user and bearer-guarded: unauthenticated shoppers are sent
 * to `/login?from=/products/{id}` so they return here after signing in.
 */
export default function ProductDetail({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: product, isLoading, isError, error, refetch } = useGetProductQuery(id);

  const [size, setSize] = React.useState<string | null>(null);
  const [qty, setQty] = React.useState(1);
  const [toast, setToast] = React.useState<string | null>(null);

  const [addItem, addState] = useAddItemMutation();

  // Reset selection when navigating between products.
  React.useEffect(() => {
    setSize(null);
    setQty(1);
  }, [id]);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !product) {
    return (
      <Box component="section" sx={{ ...containerSx, px: 4, pt: '28px', pb: '90px' }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {isError
            ? normalizeApiError(error as never).message
            : 'This piece could not be found.'}
        </Alert>
      </Box>
    );
  }

  const soldOut = product.stock <= 0;
  const hasSizes = product.sizes.length > 0;
  const needsSize = hasSizes && !size;

  const handleAdd = async () => {
    if (!isAuthenticated) {
      // Cart is per logged-in user; bounce to login and return here after.
      router.push(`/login?from=${encodeURIComponent(`/products/${id}`)}`);
      return;
    }
    try {
      await addItem({ productId: product.id, qty, size: hasSizes ? size : null }).unwrap();
      setToast('Added to cart');
    } catch (err) {
      setToast(normalizeApiError(err as never).message);
    }
  };

  const addDisabled = soldOut || needsSize || addState.isLoading;

  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '28px', pb: '90px' }}>
      {/* breadcrumb */}
      <Box sx={{ fontSize: 13, color: 'text.disabled', mb: '26px', fontWeight: 500 }}>
        <Link onClick={() => router.push('/')} sx={{ cursor: 'pointer', color: 'inherit' }}>
          Shop
        </Link>
        <Box component="span" sx={{ mx: '8px' }}>
          /
        </Box>
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {product.category}
        </Box>
        <Box component="span" sx={{ mx: '8px' }}>
          /
        </Box>
        <Box component="span" sx={{ color: 'text.primary' }}>
          {product.name}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          gap: { xs: '32px', md: '56px' },
          alignItems: 'start',
        }}
      >
        {/* hero gallery */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
          }}
        >
          <TintSwatch
            name={product.name}
            tint={product.tint}
            ratio="4 / 3"
            monoSize={120}
            borderRadius={radii.xl}
            sx={{ gridColumn: '1 / 3' }}
          >
            {product.isNew && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'secondary.main',
                  fontWeight: 700,
                  bgcolor: 'rgba(255,255,255,.92)',
                  px: '10px',
                  py: '5px',
                  borderRadius: `${radii.pill}px`,
                }}
              >
                New In
              </Box>
            )}
          </TintSwatch>
          <Box sx={{ aspectRatio: '1', borderRadius: '14px', bgcolor: '#F1F1EF' }} />
          <Box sx={{ aspectRatio: '1', borderRadius: '14px', bgcolor: '#ECECEA' }} />
        </Box>

        {/* purchase panel */}
        <Box sx={{ position: { md: 'sticky' }, top: 96 }}>
          {product.isNew && (
            <Typography
              sx={{
                display: 'inline-block',
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'secondary.main',
                fontWeight: 700,
                mb: '12px',
              }}
            >
              New In
            </Typography>
          )}
          <Typography
            variant="h1"
            sx={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            {product.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '14px', mt: '14px', mb: '22px' }}>
            <Box sx={{ fontSize: 26, fontWeight: 700 }}>{money(product.price)}</Box>
            <StockLabel stock={product.stock} variant="dot" sx={{ fontSize: 13 }} />
          </Box>

          <Typography
            sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.7, mt: '8px', mb: '26px' }}
          >
            {product.description}
          </Typography>

          {hasSizes && (
            <>
              <Typography
                sx={{
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'text.disabled',
                  fontWeight: 700,
                  mb: '10px',
                }}
              >
                Size
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: '26px', flexWrap: 'wrap' }}>
                {product.sizes.map((z) => {
                  const active = size === z;
                  return (
                    <Box
                      key={z}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      onClick={() => setSize(z)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSize(z);
                        }
                      }}
                      sx={{
                        minWidth: 50,
                        height: 46,
                        px: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: `${radii.sm}px`,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: active ? 'primary.main' : 'divider',
                        bgcolor: active ? 'primary.main' : 'transparent',
                        color: active ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      {z}
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          <Box sx={{ display: 'flex', gap: '12px', alignItems: 'stretch', mb: '14px' }}>
            <QuantityStepper
              value={qty}
              onChange={setQty}
              min={1}
              max={Math.max(1, product.stock)}
              size="lg"
            />
            <Button
              onClick={handleAdd}
              disabled={addDisabled}
              sx={{ flex: 1, height: 52, fontSize: 15 }}
            >
              {soldOut
                ? 'Sold out'
                : needsSize
                  ? 'Select a size'
                  : `Add to cart · ${money(product.price * qty)}`}
            </Button>
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: '24px',
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 500,
              mt: '18px',
            }}
          >
            <span>✓ Free returns within 30 days</span>
            <span>✓ Ships in 1–2 days</span>
          </Box>
        </Box>
      </Box>

      <RecommendationsSection
        productId={product.id}
        category={product.category}
        onOpen={(rid) => router.push(`/products/${rid}`)}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        message={toast ?? ''}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

/**
 * "You may also like" block. Keeps the recommendations query local so a
 * failure / empty result here never blocks the main detail render.
 */
function RecommendationsSection({
  productId,
  category,
  onOpen,
}: {
  productId: string;
  category: string;
  onOpen: (id: string) => void;
}) {
  const { data, isLoading } = useGetProductRecommendationsQuery(productId);

  if (isLoading) {
    return (
      <Box sx={{ mt: '80px', borderTop: '1px solid', borderColor: 'divider', pt: '44px' }}>
        <Skeleton width={220} height={32} sx={{ mb: '24px' }} />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
            gap: '22px',
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" sx={{ aspectRatio: '3 / 4', borderRadius: '14px' }} />
          ))}
        </Box>
      </Box>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Box sx={{ mt: '80px', borderTop: '1px solid', borderColor: 'divider', pt: '44px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          mb: '24px',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.01em' }}>
          You may also like
        </Typography>
        <Typography sx={{ fontSize: 13, color: 'text.disabled', fontWeight: 500 }}>
          Based on this {category} piece
        </Typography>
      </Box>
      <Recommendations products={data} onOpen={onOpen} />
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Box component="section" sx={{ ...containerSx, px: 4, pt: '28px', pb: '90px' }}>
      <Skeleton width={260} height={18} sx={{ mb: '26px' }} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
          gap: { xs: '32px', md: '56px' },
          alignItems: 'start',
        }}
      >
        <Skeleton variant="rounded" sx={{ aspectRatio: '4 / 3', borderRadius: '18px' }} />
        <Box>
          <Skeleton width="70%" height={44} />
          <Skeleton width="30%" height={32} sx={{ my: 2 }} />
          <Skeleton height={16} />
          <Skeleton height={16} />
          <Skeleton width="80%" height={16} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={52} sx={{ borderRadius: '99px' }} />
        </Box>
      </Box>
    </Box>
  );
}
