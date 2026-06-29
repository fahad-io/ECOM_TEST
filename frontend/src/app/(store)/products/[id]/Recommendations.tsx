'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import TintSwatch from '@/components/TintSwatch';
import { productImageUrl } from '@/lib/imageUrl';
import { money } from '@/theme/format';
import type { Product } from '@/store/productsApi';

export interface RecommendationsProps {
  products: Product[];
  onOpen: (id: string) => void;
}

/**
 * "You may also like" carousel. A Swiper of related pieces (recommendation
 * tiles omit the stock pill, per the mockup). Presentational — the parent owns
 * the data fetch and the section heading.
 */
export default function Recommendations({ products, onOpen }: RecommendationsProps) {
  return (
    <Swiper
      modules={[FreeMode]}
      freeMode
      slidesPerView={1.3}
      spaceBetween={22}
      breakpoints={{
        600: { slidesPerView: 2.3 },
        900: { slidesPerView: 3.3 },
        1200: { slidesPerView: 4 },
      }}
      style={{ overflow: 'visible' }}
    >
      {products.map((p) => (
        <SwiperSlide key={p.id} style={{ height: 'auto' }}>
          <Box
            role="button"
            tabIndex={0}
            onClick={() => onOpen(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(p.id);
              }
            }}
            aria-label={`${p.name}, ${p.category}`}
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              outlineOffset: 3,
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
            }}
          >
            <TintSwatch
              name={p.name}
              tint={p.tint}
              imageSrc={productImageUrl(p.imagePath)}
              monoSize={48}
              sx={{ mb: '12px' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{p.name}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{money(p.price)}</Typography>
            </Box>
            <Typography sx={{ fontSize: 12.5, color: 'text.disabled', mt: '2px' }}>
              {p.category}
            </Typography>
          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
