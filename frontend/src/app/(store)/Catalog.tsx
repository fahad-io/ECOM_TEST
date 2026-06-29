'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import {
  useGetProductsQuery,
  type Product,
  type ProductSort,
} from '@/store/productsApi';
import { useDebounce } from '@/store/useDebounce';
import { normalizeApiError } from '@/store/normalizeError';
import FilterSidebar, { PRICE_MAX } from './FilterSidebar';
import FeaturedCarousel from './FeaturedCarousel';
import RecommendedForYou from './RecommendedForYou';

const PAGE_SIZE = 6;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'new', label: 'Newest' },
  { value: 'price-asc', label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
];

/** Section wrapper matching the mockup's 1240px max width. */
const containerSx = { maxWidth: 1240, mx: 'auto' } as const;

function GridSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
        gap: '26px 22px',
      }}
    >
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="rounded" sx={{ aspectRatio: '3 / 4', borderRadius: '14px', mb: '13px' }} />
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={16} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * The storefront catalog. Hero + sticky filter sidebar (search, category
 * counts, max-price) + sort chips + a paginated 6-per-page product grid, plus a
 * Swiper "new in" featured row. Filters/sort/search/page drive the
 * `getProducts` RTK Query params (search debounced). A second unfiltered query
 * supplies the total catalog size, per-category counts, and featured items.
 * Loading skeletons, error, and empty states are all handled.
 */
export default function Catalog() {
  const router = useRouter();

  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState<string | null>(null);
  const [priceMax, setPriceMax] = React.useState(PRICE_MAX);
  const [sort, setSort] = React.useState<ProductSort>('new');
  const [page, setPage] = React.useState(1);

  const debouncedSearch = useDebounce(search, 350);

  // Reset to page 1 whenever a filter/sort/search changes.
  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, priceMax, sort]);

  const open = (id: string) => router.push(`/products/${id}`);

  // Filtered, paginated query for the grid.
  const filtered = useGetProductsQuery({
    search: debouncedSearch || undefined,
    category: category || undefined,
    maxPrice: priceMax < PRICE_MAX ? priceMax : undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  // Unfiltered "catalog overview" query: total count, category counts, featured.
  const overview = useGetProductsQuery({ limit: 100, sort: 'new' });

  const catalogTotal = overview.data?.total ?? 0;
  const overviewItems = React.useMemo(() => overview.data?.items ?? [], [overview.data]);

  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of overviewItems) {
      map[p.category] = (map[p.category] ?? 0) + 1;
    }
    return map;
  }, [overviewItems]);

  const featured = React.useMemo(
    () => overviewItems.filter((p: Product) => p.isNew).slice(0, 8),
    [overviewItems],
  );

  const reset = () => {
    setSearch('');
    setCategory(null);
    setPriceMax(PRICE_MAX);
    setSort('new');
    setPage(1);
  };

  const items = filtered.data?.items ?? [];
  const total = filtered.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasResults = !filtered.isLoading && !filtered.isError && items.length > 0;
  const noResults = !filtered.isLoading && !filtered.isError && items.length === 0;

  return (
    <Box>
      {/* hero */}
      <Box component="section" sx={{ ...containerSx, px: 4, pt: '46px', pb: '30px' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 12,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'secondary.main',
                fontWeight: 700,
                mb: '12px',
              }}
            >
              The Autumn Edit
            </Typography>
            <Typography variant="h1" sx={{ maxWidth: 620 }}>
              Quietly considered wardrobe staples.
            </Typography>
          </Box>
          <Typography
            sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.6, maxWidth: 330 }}
          >
            Natural fibres, honest construction, and a palette that does the thinking for you.{' '}
            {catalogTotal} pieces in this season&apos;s edit.
          </Typography>
        </Box>
      </Box>

      <Box component="section" sx={{ ...containerSx, px: 4, pt: 1, pb: '80px' }}>
        {/* personalized row (auth-only; skipped + hidden for guests) */}
        <RecommendedForYou onOpen={open} />

        {/* featured carousel */}
        <FeaturedCarousel products={featured} onOpen={open} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '248px 1fr' },
            gap: '40px',
            alignItems: 'start',
          }}
        >
          <FilterSidebar
            search={search}
            onSearch={setSearch}
            category={category}
            onCategory={setCategory}
            counts={counts}
            priceMax={priceMax}
            onPriceMax={setPriceMax}
            onReset={reset}
          />

          <Box>
            {/* result count + sort */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: '22px',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 500 }}>
                Showing{' '}
                <Box component="b" sx={{ color: 'text.primary' }}>
                  {items.length}
                </Box>{' '}
                of {total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {SORT_OPTIONS.map((s) => {
                  const active = sort === s.value;
                  return (
                    <Box
                      key={s.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSort(s.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSort(s.value);
                        }
                      }}
                      sx={{
                        px: 2,
                        py: '9px',
                        borderRadius: '99px',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: active ? 'primary.main' : 'divider',
                        bgcolor: active ? 'primary.main' : 'transparent',
                        color: active ? 'primary.contrastText' : 'text.secondary',
                      }}
                    >
                      {s.label}
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {filtered.isError && (
              <Alert
                severity="error"
                sx={{ mb: 3, borderRadius: '12px' }}
                action={
                  <Button color="inherit" size="small" onClick={() => filtered.refetch()}>
                    Retry
                  </Button>
                }
              >
                {normalizeApiError(filtered.error as never).message}
              </Alert>
            )}

            {filtered.isLoading && <GridSkeleton />}

            {hasResults && (
              <>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' },
                    gap: '26px 22px',
                  }}
                >
                  {items.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={{
                        id: p.id,
                        name: p.name,
                        category: p.category,
                        price: p.price,
                        stock: p.stock,
                        isNew: p.isNew,
                        tint: p.tint,
                      }}
                      onOpen={open}
                    />
                  ))}
                </Box>

                {totalPages > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      mt: '46px',
                    }}
                  >
                    <PagerButton
                      label="Previous"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    />
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const n = i + 1;
                      const active = n === page;
                      return (
                        <Box
                          key={n}
                          role="button"
                          tabIndex={0}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setPage(n)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setPage(n);
                            }
                          }}
                          sx={{
                            width: 40,
                            height: 40,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '99px',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: active ? 'primary.main' : 'divider',
                            bgcolor: active ? 'primary.main' : 'transparent',
                            color: active ? 'primary.contrastText' : 'text.primary',
                          }}
                        >
                          {n}
                        </Box>
                      );
                    })}
                    <PagerButton
                      label="Next"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    />
                  </Box>
                )}
              </>
            )}

            {noResults && (
              <EmptyState
                title="No pieces match your filters"
                subtitle="Try widening the price range or clearing the search."
                actionLabel="Reset all filters"
                actionVariant="link"
                onAction={reset}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function PagerButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        height: 40,
        px: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '99px',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        color: disabled ? 'text.disabled' : 'text.primary',
      }}
    >
      {label}
    </Box>
  );
}
