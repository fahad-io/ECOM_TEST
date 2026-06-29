'use client';

import { useAppSelector } from './hooks';
import type { AuthUser } from './types';

export interface UseAuthResult {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** True once auth has been rehydrated from localStorage (client-side). */
  hydrated: boolean;
}

/**
 * Read the persisted auth state (token + user) from the store. The single
 * source of truth for "am I logged in / am I an admin", consumed by the Navbar
 * and the route guards.
 */
export function useAuth(): UseAuthResult {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    isAdmin: Boolean(token) && user?.role === 'admin',
    hydrated,
  };
}
