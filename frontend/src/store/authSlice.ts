import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './types';

const STORAGE_KEY = 'marl_auth';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

interface PersistedAuth {
  token: string | null;
  user: AuthUser | null;
}

/** Read persisted auth from localStorage. SSR-safe: no-op on the server. */
function loadPersisted(): AuthState {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { token: null, user: null };
    const parsed = JSON.parse(raw) as PersistedAuth;
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return { token: null, user: null };
  }
}

/** Persist (or clear) auth in localStorage. SSR-safe. */
function persist(state: AuthState): void {
  if (typeof window === 'undefined') return;
  try {
    if (state.token) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* storage unavailable (private mode / quota) — ignore */
  }
}

const initialState: AuthState = loadPersisted();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>,
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      persist(state);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      persist(state);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export { STORAGE_KEY };
