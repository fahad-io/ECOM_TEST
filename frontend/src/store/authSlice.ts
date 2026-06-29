import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from './types';

const STORAGE_KEY = 'marl_auth';

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /**
   * False until the client has read persisted auth from localStorage. The
   * store starts logged-out on BOTH server and first client render (so SSR
   * markup matches), then `hydrate` runs in a post-mount effect. Guards use
   * this to avoid redirecting before rehydration completes.
   */
  hydrated: boolean;
}

export interface PersistedAuth {
  token: string | null;
  user: AuthUser | null;
}

/** Read persisted auth from localStorage. SSR-safe: no-op on the server. */
export function loadPersisted(): PersistedAuth {
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

// Always start logged-out so server and first client render are identical.
const initialState: AuthState = { token: null, user: null, hydrated: false };

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
      state.hydrated = true;
      persist(state);
    },
    /** Rehydrate from localStorage after mount; marks auth as hydrated. */
    hydrate(state, action: PayloadAction<PersistedAuth>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
      persist(state);
    },
  },
});

export const { setCredentials, hydrate, logout } = authSlice.actions;
export default authSlice.reducer;
export { STORAGE_KEY };
