'use client';

import * as React from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './store';

/**
 * Client-side Redux provider. Creates the store once per browser session via a
 * ref (so it survives re-renders but a new one is built per request on the
 * server, avoiding cross-request state leakage in the App Router).
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = React.useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
