import { baseApi } from './baseApi';
import type { Product } from './productsApi';

/**
 * A single cart line as returned by the backend. The `product` is the full
 * populated `Product` document so the cart UI can render name / category /
 * price / tint without extra fetches.
 */
export interface CartItem {
  product: Product;
  qty: number;
  size: string | null;
}

/**
 * `GET /cart` response. Totals (`subtotal`, `shipping`, `total`) are computed
 * server-side per the business rules (flat $12 shipping, free over $150) and
 * must be rendered verbatim — never recomputed client-side.
 */
export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}

/** Body for `POST /cart/items`. */
export interface AddItemBody {
  productId: string;
  qty: number;
  size: string | null;
}

/** Body for `PATCH /cart/items/:productId`. */
export interface UpdateItemArg {
  productId: string;
  qty: number;
  size?: string | null;
}

/**
 * Cart endpoints injected on the shared `baseApi`. Every cart route is
 * bearer-guarded and scoped to the token's user, so these hooks only make sense
 * for an authenticated session (callers `skip` the query when logged out).
 *
 * `getCart` provides the `Cart` tag; all mutations invalidate it so the Navbar
 * count and the cart page re-sync from the authoritative server totals. The
 * mutations also return the updated cart, so consumers get fresh totals without
 * waiting for the refetch.
 */
export const cartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query<Cart, void>({
      query: () => ({ url: '/cart' }),
      providesTags: [{ type: 'Cart', id: 'CART' }],
    }),
    addItem: build.mutation<Cart, AddItemBody>({
      query: (body) => ({ url: '/cart/items', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cart', id: 'CART' }],
    }),
    updateItem: build.mutation<Cart, UpdateItemArg>({
      query: ({ productId, ...body }) => ({
        url: `/cart/items/${productId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Cart', id: 'CART' }],
    }),
    removeItem: build.mutation<Cart, string>({
      query: (productId) => ({ url: `/cart/items/${productId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cart', id: 'CART' }],
    }),
    clearCart: build.mutation<void, void>({
      query: () => ({ url: '/cart', method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cart', id: 'CART' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useAddItemMutation,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useClearCartMutation,
} = cartApi;
