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
export { useDebounce } from './useDebounce';
export {
  productsApi,
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductRecommendationsQuery,
  PRODUCT_CATEGORIES,
} from './productsApi';
export type {
  Product,
  ProductSort,
  ProductCategory,
  GetProductsParams,
  Paginated,
} from './productsApi';
export {
  cartApi,
  useGetCartQuery,
  useAddItemMutation,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useClearCartMutation,
} from './cartApi';
export type {
  Cart,
  CartItem,
  AddItemBody,
  UpdateItemArg,
} from './cartApi';
export {
  checkoutApi,
  useCreatePaymentIntentMutation,
} from './checkoutApi';
export type { PaymentIntentResponse } from './checkoutApi';
export {
  ordersApi,
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
} from './ordersApi';
export type {
  Order,
  OrderItem,
  ShippingAddress,
  CreateOrderBody,
} from './ordersApi';
export type {
  AuthUser,
  UserRole,
  ApiErrorEnvelope,
  NormalizedApiError,
} from './types';
