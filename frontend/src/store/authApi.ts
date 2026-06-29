import { baseApi } from './baseApi';
import { setCredentials } from './authSlice';
import type { AuthUser } from './types';

/** Request body for `POST /auth/signup`. Mirrors the server DTO. */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/** Request body for `POST /auth/login`. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** `{ accessToken, user }` returned by signup + login. */
export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

/**
 * Auth endpoints injected onto the shared `baseApi`. On a successful login or
 * signup we dispatch `setCredentials` so the token is persisted + injected on
 * every subsequent request, and refresh the `Auth` tag so `getMe` re-runs.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    signup: build.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({ url: '/auth/signup', method: 'POST', body }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),
    login: build.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials({ token: data.accessToken, user: data.user }));
      },
    }),
    getMe: build.query<AuthUser, void>({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Auth'],
    }),
  }),
  overrideExisting: false,
});

export const { useSignupMutation, useLoginMutation, useGetMeQuery } = authApi;
