'use client';

import Box from '@mui/material/Box';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import ProductCard from '@/components/ProductCard';
import SectionHeading from '@/components/SectionHeading';
import type { Product } from '@/store/productsApi';

export interface FeaturedCarouselProps {
  products: Product[];
  onOpen: (id: string) => void;
}

/**
 * "New in" featured row — a Swiper carousel of the newest pieces, shown above
 * the filtered grid. Renders nothing when there is no eligible product.
 */
export default function FeaturedCarousel({ products, onOpen }: FeaturedCarouselProps) {
  if (products.length === 0) return null;

  return (
    <Box sx={{ mb: '40px' }}>
      <SectionHeading level="h3" eyebrow="New in" title="Fresh to the edit" sx={{ mb: '20px' }} />
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
        {products.map((p) => (
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
    </Box>
  );
}
