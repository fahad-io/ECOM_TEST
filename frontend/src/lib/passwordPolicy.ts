/**
 * Client-side mirror of the backend password policy
 * (`backend/src/common/validation/password.ts`). A valid password is at least
 * 8 characters and contains at least one letter, one number, and one special
 * (non-alphanumeric) character. Keep both sides in sync.
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_MIN_MESSAGE = 'Password must be at least 8 characters';

export const PASSWORD_RULE_MESSAGE =
  'Password must contain at least one letter, one number, and one special character';
