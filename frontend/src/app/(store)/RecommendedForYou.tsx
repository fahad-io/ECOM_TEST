'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import { useAuth } from '@/store/useAuth';
import { useGetRecommendationsQuery } from '@/store/productsApi';

export interface RecommendedForYouProps {
  onOpen: (id: string) => void;
}

function RowSkeleton() {
  return (
    <Box sx={{ display: 'flex', gap: '22px', overflow: 'hidden' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Box key={i} sx={{ flex: '0 0 23%', minWidth: 200 }}>
          <Skeleton variant="rounded" sx={{ aspectRatio: '3 / 4', borderRadius: '14px', mb: '13px' }} />
          <Skeleton width="70%" height={20} />
          <Skeleton width="40%" height={16} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * "Recommended for you" — a personalized Swiper row driven by `GET
 * /recommendations` (auth-only). The query is skipped entirely for logged-out
 * visitors (no token, nothing to recommend), so the section is invisible to
 * them. Renders nothing on empty results or error, and a quiet skeleton while
 * loading. Reuses the storefront `ProductCard` + carousel styling.
 */
export default function RecommendedForYou({ onOpen }: RecommendedForYouProps) {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, isError } = useGetRecommendationsQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Hidden for guests, on error, or when there is nothing to recommend.
  if (!isAuthenticated || isError) return null;
  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <Box sx={{ mb: '40px' }}>
      <SectionHeading
        level="h3"
        eyebrow="For you"
        title="Recommended for you"
        sx={{ mb: '20px' }}
      />
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <Swiper
          modules={[FreeMode]}
          freeMode
          slidesPerView={1.3}
          spaceBetween={22}
          breakpoints={{
            600: { slidesPerView: 2.3 },
            900: { slidesPerView: 3.3 },
            1200: { slidesPerView: 4.2 },
          }}
          style={{ overflow: 'visible' }}
        >
          {data!.map((p) => (
            <SwiperSlide key={p.id} style={{ height: 'auto' }}>
              <ProductCard
                product={{
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  stock: p.stock,
                  isNew: p.isNew,
                  tint: p.tint,
                  imagePath: p.imagePath,
                }}
                onOpen={onOpen}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
  );
}
