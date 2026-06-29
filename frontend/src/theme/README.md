# MARL design system — reference for feature agents

The design system is the **single owner of visual tokens**. Feature work consumes what is
exported here; it does not invent new colors, fonts, spacing, or status visuals.

## Import paths

```ts
// tokens, formatters, themes, providers, fonts (barrel)
import { emerald, ORDER_STATUS, money, storefrontTheme, adminTheme } from '@/theme';

// shared components (barrel)
import { Navbar, Footer, ProductCard, StatusChip, AdminShell } from '@/components';
```

## Themes & wiring

- `storefrontTheme` — light, warm. `primary` = ink (`#111827`), so contained `<Button>` reads as
  the mockup's black pill. `secondary` = emerald (`#10B981`) for the brand accent / links.
- `adminTheme` — dark "ADMIN CONSOLE". `primary` = emerald (bright CTA), dark surfaces.
- Root layout wraps everything in `<ThemeRegistry>` (storefront default). For admin route
  groups, wrap the subtree in `<AdminThemeProvider>` (or pass `theme={adminTheme}` to a nested
  `ThemeRegistry`). `AppRouterCacheProvider` (v16-appRouter) handles SSR emotion caching.
- Font: Hanken Grotesk via `next/font/google`, exposed as `--font-hanken`, applied in the theme
  `fontFamily`. Weights 400–800.

## Tokens (`@/theme/tokens`)

- `emerald` — `main` `dark` `deep` `tint50/100/200` `wash`.
- `storefront` — `bg` `surface` `surfaceAlt` `ink` `inkDeep` `muted/2/3` `faint`
  `border` `borderStrong` `hairline`.
- `admin` — `bg` `surface` `surface2` `active` `raised` `inputBorder` `text` `textMuted` `textFaint`.
- `stock` — `out` (grey) `low` (amber) `in` (emerald).
- `ORDER_STATUS` / `ORDER_STATUSES` — status → `{ label, color, bg }`, lowercase keys matching the
  API contract (`pending | processing | shipped | delivered | cancelled`).
- `radii` — `sm 10` `md 14` `lg 16` `xl 18` `pill 999`.
- `TINTS` / `DEFAULT_TINT` — warm-grey product placeholder swatches.

Prefer the **semantic theme palette** (`primary.main`, `text.secondary`, `divider`, …) in `sx`
over raw token hex. Reach for raw tokens only for design specifics MUI's palette can't express
(stock colors, status bg, admin surface ramp, tints).

## Formatters (`@/theme/format`)

- `money(n)` → `"$1,234"` (integer USD).
- `mono(name)` → up-to-2-letter monogram.
- `stockColor(n)` / `stockLabel(n)` → stock dot color + copy ("Sold out" / "Only N left" / "In stock").

## Components (`@/components`) — all presentational (props only, no data fetching)

| Component | Purpose |
| --- | --- |
| `Logo` | MARL. wordmark with emerald dot. `size`, `color`. |
| `Navbar` | Announcement bar + sticky nav. `primaryLinks`, `cartCount`, `accountLabel`, handlers. |
| `Footer` | Wordmark + links + copyright. |
| `ProductCard` | Tint swatch, NEW badge, stock pill, name/price/category. `product`, `onOpen`. |
| `TintSwatch` | Tinted image placeholder with mono initials. `ratio`, slot for overlays. |
| `StatusChip` | Order-status pill from `ORDER_STATUS`. `status`. |
| `NewBadge` | "NEW" ink pill. |
| `PriceTag` | Bold price, `size="md"\|"lg"`. |
| `Money` | Inline formatted amount (subtotal/total rows). |
| `StockLabel` | Stock dot/pill, `variant="dot"\|"pill"`. |
| `QuantityStepper` | − N + control, `size="sm"\|"lg"`. |
| `SectionHeading` | Eyebrow + title + meta. `level="h2"\|"h3"`. |
| `EmptyState` | Dashed placeholder, title/subtitle/action. |
| `PageTransition` | Framer Motion fade/slide-up wrapper. `variant="up"\|"fade"`. |
| `AdminShell` | Dark sidebar (brand, nav, user) + light topbar (title, search, View store) + content. Render inside `AdminThemeProvider`. |

## Copy to reuse (from the mockup)

- Announcement: "Complimentary shipping on orders over $150 — considered essentials, made to last."
- Hero eyebrow/title: "The Autumn Edit" / "Quietly considered wardrobe staples."
- Results: "Showing N of M". No-results: "No pieces match your filters".
- Footer: "© 2026 MARL. Considered essentials."
- Admin: "ADMIN CONSOLE", user "Alex Rivera / Administrator", "View store", image drop "Drop image or browse".
