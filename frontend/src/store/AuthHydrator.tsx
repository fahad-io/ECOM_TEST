'use client';

import * as React from 'react';
import { useAppDispatch } from './hooks';
import { hydrate, loadPersisted } from './authSlice';

/**
 * Reads persisted auth from localStorage once, after mount, and dispatches it
 * into the store. Keeping this out of the slice's initial state means the
 * server and the client's first render are both logged-out (no SSR hydration
 * mismatch); the real auth state lands a tick later.
 */
export default function AuthHydrator() {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(hydrate(loadPersisted()));
  }, [dispatch]);
  return null;
}
