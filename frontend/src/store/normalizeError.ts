import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { ApiErrorEnvelope, NormalizedApiError } from './types';

/**
 * Type guard for the MARL backend error envelope.
 */
function isErrorEnvelope(data: unknown): data is ApiErrorEnvelope {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    'statusCode' in data
  );
}

/**
 * Collapse the backend envelope's `message` (string | string[]) into a stable
 * `{ status, message, messages, error }` shape feature code can read without
 * re-checking the union every time.
 */
export function normalizeApiError(
  err: FetchBaseQueryError | undefined,
): NormalizedApiError {
  if (!err) {
    return { status: 0, message: 'Unknown error', messages: ['Unknown error'], error: 'Error' };
  }

  // RTK Query non-HTTP errors: FETCH_ERROR, PARSING_ERROR, TIMEOUT_ERROR, CUSTOM_ERROR.
  if (typeof err.status === 'string') {
    const message =
      err.status === 'FETCH_ERROR'
        ? 'Network error — could not reach the server.'
        : err.status === 'TIMEOUT_ERROR'
          ? 'The request timed out. Please try again.'
          : (err as { error?: string }).error || 'Something went wrong.';
    return { status: 0, message, messages: [message], error: err.status };
  }

  const status = err.status;
  const data = err.data;

  if (isErrorEnvelope(data)) {
    const messages = Array.isArray(data.message)
      ? data.message
      : [data.message];
    return {
      status,
      message: messages.join(' · '),
      messages,
      error: data.error ?? 'Error',
    };
  }

  // Fallback for unexpected non-envelope bodies.
  const fallback = `Request failed (${status}).`;
  return { status, message: fallback, messages: [fallback], error: 'Error' };
}
