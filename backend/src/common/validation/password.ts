/**
 * Shared password complexity policy (mirrored client-side in the frontend Yup
 * schemas). A valid password contains at least one letter, one number, and one
 * special (non-alphanumeric) character. Length is enforced separately via
 * @MinLength(8)/@MaxLength(72) (bcrypt truncates beyond 72 bytes).
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const PASSWORD_RULE_MESSAGE =
  'Password must contain at least one letter, one number, and one special character';
