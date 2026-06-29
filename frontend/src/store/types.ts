/**
 * Shared store-level types. Feature modules import these; they intentionally
 * mirror the API contract's auth + error shapes (see
 * `.claude/skills/api-contract/SKILL.md`).
 */

export type UserRole = 'user' | 'admin';

/** The authenticated user as returned by `/api/auth/*`. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Relative `/uploads/...` path for the profile picture, or null. */
  avatarPath?: string | null;
}

/**
 * The backend error envelope (global exception filter). `message` is a single
 * human-readable string, or an array of field-validation strings.
 */
export interface ApiErrorEnvelope {
  statusCode: number;
  message: string | string[];
  error: string;
  path?: string;
  timestamp?: string;
}

/**
 * Normalised error every feature module can rely on, regardless of whether the
 * failure came from the backend envelope, a network error, or a parse error.
 * `messages` is always an array; `message` is a single joined string for toasts.
 */
export interface NormalizedApiError {
  status: number;
  /** Single display string (field errors joined with " · "). */
  message: string;
  /** All messages, useful for mapping field-level errors. */
  messages: string[];
  /** Short error label, e.g. "Bad Request" / "Conflict". */
  error: string;
}
