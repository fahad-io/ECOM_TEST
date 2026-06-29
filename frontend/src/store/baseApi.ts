import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AuthState } from './authSlice';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

/**
 * Shape of the slice of root state `prepareHeaders` needs. Declared locally so
 * `baseApi` does not import `store.ts` (which imports `baseApi`) — avoids a
 * circular dependency.
 */
interface RootStateForHeaders {
  auth: AuthState;
}

/**
 * The single RTK Query API for the whole app. Feature modules (auth, products,
 * cart, orders, admin) attach their endpoints via `baseApi.injectEndpoints` in
 * later phases — none are defined here on purpose.
 *
 * - `baseUrl` comes from `NEXT_PUBLIC_API_URL` (includes the `/api` prefix).
 * - `prepareHeaders` injects `Authorization: Bearer <token>` from auth state.
 * - `tagTypes` are declared up-front so injected endpoints can provide /
 *   invalidate cache tags consistently.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootStateForHeaders).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Cart', 'Orders', 'Products', 'Auth', 'Admin'],
  endpoints: () => ({}),
});
