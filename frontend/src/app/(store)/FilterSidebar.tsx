'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Link from '@mui/material/Link';
import { money } from '@/theme/format';
import { PRODUCT_CATEGORIES } from '@/store/productsApi';

export const PRICE_MIN = 32;
export const PRICE_MAX = 350;

export interface FilterSidebarProps {
  search: string;
  onSearch: (v: string) => void;
  category: string | null;
  onCategory: (c: string | null) => void;
  /** Per-category counts (derived from the full catalog). */
  counts: Record<string, number>;
  priceMax: number;
  onPriceMax: (v: number) => void;
  onReset: () => void;
}

/**
 * Catalog filter sidebar: search input, category list with live counts (the
 * active one washed emerald), a "Up to $X" max-price slider, and Reset. Mirrors
 * the mockup's sticky filter panel. All changes bubble to the parent which
 * drives the `getProducts` query params.
 */
export default function FilterSidebar({
  search,
  onSearch,
  category,
  onCategory,
  counts,
  priceMax,
  onPriceMax,
  onReset,
}: FilterSidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        position: { md: 'sticky' },
        top: 96,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        p: '22px',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Filter
        </Typography>
        <Link
          onClick={onReset}
          sx={{ fontSize: 12.5, color: 'secondary.main', fontWeight: 600 }}
        >
          Reset
        </Link>
      </Box>

      <TextField
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search products"
        fullWidth
        size="small"
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
      />

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
        Category
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', mb: '26px' }}>
        {PRODUCT_CATEGORIES.map((c) => {
          const active = category === c;
          return (
            <Box
              key={c}
              role="button"
              tabIndex={0}
              onClick={() => onCategory(active ? null : c)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCategory(active ? null : c);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: '12px',
                py: '9px',
                borderRadius: '9px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                bgcolor: active ? 'secondary.light' : 'transparent',
                color: active ? 'secondary.dark' : 'text.primary',
                '&:hover': { bgcolor: active ? 'secondary.light' : 'action.hover' },
              }}
            >
              <span>{c}</span>
              <Box component="span" sx={{ fontSize: 12.5, color: 'text.disabled' }}>
                {counts[c] ?? 0}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Typography
        sx={{
          fontSize: 12,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.disabled',
          fontWeight: 700,
          mb: '12px',
        }}
      >
        Max price
      </Typography>
      <Slider
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={2}
        value={priceMax}
        onChange={(_e, v) => onPriceMax(v as number)}
        color="secondary"
        aria-label="Maximum price"
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: 'text.secondary',
          mt: '6px',
          fontWeight: 500,
        }}
      >
        <span>{money(PRICE_MIN)}</span>
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
          Up to {money(priceMax)}
        </Box>
      </Box>
    </Box>
  );
}
