import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './baseApi';
import authReducer from './authSlice';

/**
 * Factory so each request/render gets a fresh store on the server while the
 * browser reuses a singleton (see StoreProvider). Combines the RTK Query
 * `baseApi` reducer + middleware with the auth slice.
 */
export function makeStore() {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

  // Enables refetchOnFocus / refetchOnReconnect behaviours.
  setupListeners(store.dispatch);

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
