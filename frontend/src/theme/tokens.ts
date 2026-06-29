/**
 * MARL design tokens — the single source of truth for visual values.
 *
 * Extracted verbatim from the approved mockup (`docs/design.decoded.html`,
 * `docs/design.css`). Feature work must consume these (or, preferably, the
 * semantic theme palette built on top of them) and never invent new hex values.
 */

/** Emerald accent ramp. */
export const emerald = {
  /** primary brand accent */
  main: '#10B981',
  /** darker emerald (active categories, "delivered" status text) */
  dark: '#047857',
  /** deep emerald — used as text on the bright emerald button in admin */
  deep: '#06281D',
  /** tints, lightest → light */
  tint50: '#ECFDF5',
  tint100: '#D1FAE5',
  tint200: '#A7F3D0',
  /** very light wash used for active category chips */
  wash: '#F0FDF4',
} as const;

/** Storefront (light, warm) surface + ink + neutral ramp. */
export const storefront = {
  /** warm page background */
  bg: '#faf9f5',
  /** white card / surface */
  surface: '#FFFFFF',
  /** subtle warm input / row background */
  surfaceAlt: '#FAFAF9',
  /** faint warm divider used inside cards */
  surfaceLine: '#F1F1EF',
  /** primary ink */
  ink: '#111827',
  /** near-black ink (admin login surfaces share this) */
  inkDeep: '#0E1116',
  /** muted text ramp, strong → soft */
  muted: '#374151',
  muted2: '#4B5563',
  muted3: '#6B7280',
  /** softest label / placeholder grey */
  faint: '#9CA3AF',
  /** borders */
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  /** hairline border used on nav/footer/cards in the mockup */
  hairline: '#ECECEC',
} as const;

/** Admin (dark "ADMIN CONSOLE") surface ramp, darkest → lightest. */
export const admin = {
  bg: '#0E1116',
  surface: '#111827',
  surface2: '#161B22',
  /** active sidebar item */
  active: '#1B2129',
  /** raised panel / hover */
  raised: '#232A33',
  /** dark input border */
  inputBorder: '#2A323C',
  /** light text on dark */
  text: '#FFFFFF',
  textMuted: '#9CA3AF',
  textFaint: '#6B7280',
} as const;

/** Stock state colors (from `stockColor`/`stockLabel` in the mockup). */
export const stock = {
  /** sold out */
  out: '#9CA3AF',
  /** low (<= 5) — amber */
  low: '#D97706',
  /** in stock — emerald */
  in: '#10B981',
} as const;

/** Misc semantic colors used in the mockup. */
export const misc = {
  /** destructive action (admin "Delete") */
  danger: '#DC2626',
} as const;

/**
 * Order-status → { label, color, bg } map. Lowercase keys match the API
 * contract (`pending | processing | shipped | delivered | cancelled`).
 */
export const ORDER_STATUS = {
  pending: { label: 'Pending', color: '#92400E', bg: '#FEF3C7' },
  processing: { label: 'Processing', color: '#1E40AF', bg: '#DBEAFE' },
  shipped: { label: 'Shipped', color: '#3730A3', bg: '#E0E7FF' },
  delivered: { label: 'Delivered', color: '#047857', bg: '#D1FAE5' },
  cancelled: { label: 'Cancelled', color: '#9F1239', bg: '#FFE4E6' },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS;

/** Ordered list of statuses (useful for filter rows / breakdowns). */
export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

/** Shape / radii used across the mockup. */
export const radii = {
  /** inputs / small controls */
  sm: 10,
  /** cards (product image) */
  md: 14,
  /** panels / large cards */
  lg: 16,
  /** auth / modal cards */
  xl: 18,
  /** fully rounded pills */
  pill: 999,
} as const;

/** Focus ring color (mockup focuses inputs by setting border to ink). */
export const focusRing = storefront.ink;

/** Product tint placeholder swatches seen in the mockup (warm greys). */
export const TINTS = [
  '#EEEAE3',
  '#E7EAE6',
  '#E9E7EE',
  '#ECEAE6',
  '#E6EAEC',
  '#EFE9E6',
  '#EAE8E3',
  '#E4E7EC',
  '#ECE7E2',
  '#E8EAE7',
  '#EDEAE4',
  '#E7E9EE',
] as const;

/** Default tint when a product has none. */
export const DEFAULT_TINT = '#EAE8E3';
