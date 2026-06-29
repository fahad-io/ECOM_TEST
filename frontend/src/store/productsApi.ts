import { baseApi } from './baseApi';

/** Product sort values per the API contract. */
export type ProductSort = 'new' | 'price-asc' | 'price-desc';

/** Product categories per the API contract. */
export const PRODUCT_CATEGORIES = [
  'Tops',
  'Knitwear',
  'Outerwear',
  'Trousers',
  'Footwear',
  'Accessories',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** `Product` shape returned by the products endpoints. */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sizes: string[];
  imagePath: string | null;
  isNew: boolean;
  tint: string;
  createdAt: string;
}

/** Query params accepted by `GET /products`. All optional. */
export interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

/** Paginated envelope per the API contract. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Strip undefined / empty params so the request URL stays clean and RTK Query
 * cache keys are stable (e.g. an empty search === no search).
 */
function cleanParams(params: GetProductsParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = v as string | number;
  }
  return out;
}

/**
 * Public product endpoints injected on the shared `baseApi`. `getProducts`
 * drives the catalog grid (search / category / price / sort / pagination);
 * `getProduct` powers the detail page in the next module. Both tagged
 * `Products` so admin mutations can invalidate them.
 */
export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<Paginated<Product>, GetProductsParams>({
      query: (params) => ({ url: '/products', params: cleanParams(params) }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Products' as const, id: p.id })),
              { type: 'Products' as const, id: 'LIST' },
            ]
          : [{ type: 'Products' as const, id: 'LIST' }],
    }),
    getProduct: build.query<Product, string>({
      query: (id) => ({ url: `/products/${id}` }),
      providesTags: (_result, _err, id) => [{ type: 'Products', id }],
    }),
    getProductRecommendations: build.query<Product[], string>({
      query: (id) => ({ url: `/products/${id}/recommendations` }),
      providesTags: (result, _err, id) =>
        result
          ? [
              ...result.map((p) => ({ type: 'Products' as const, id: p.id })),
              { type: 'Products' as const, id: `RECS-${id}` },
            ]
          : [{ type: 'Products' as const, id: `RECS-${id}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductRecommendationsQuery,
} = productsApi;
