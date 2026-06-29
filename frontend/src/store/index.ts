export { baseApi } from './baseApi';
export { makeStore } from './store';
export type { AppStore, RootState, AppDispatch } from './store';
export { useAppDispatch, useAppSelector } from './hooks';
export {
  default as authReducer,
  setCredentials,
  logout,
  STORAGE_KEY,
} from './authSlice';
export type { AuthState } from './authSlice';
export { normalizeApiError } from './normalizeError';
export { useAuth } from './useAuth';
export type { UseAuthResult } from './useAuth';
export {
  authApi,
  useLoginMutation,
  useSignupMutation,
  useGetMeQuery,
} from './authApi';
export type {
  SignupRequest,
  LoginRequest,
  AuthResponse,
} from './authApi';
export type {
  AuthUser,
  UserRole,
  ApiErrorEnvelope,
  NormalizedApiError,
} from './types';
