# NOTES — MARL build

How this project was built with an agentic workflow, what the agents got right and wrong, how the
work was verified, the design process, the assumptions made, and the trade-offs taken.

---

## 1. Agent workflow

**Tool:** Claude Code, driven as a supervised, phased build.

**Orchestration model.** A single orchestrator drove the build through the phases defined in
`CLAUDE_CODE_PROMPT.md`, stopping at each phase boundary for human review. Work was scoped to a set
of specialized subagents defined under `.claude/agents/`:

- **backend-engineer** — `/backend` only; NestJS modular + repository pattern, Mongoose, DTOs,
  guards, Swagger, Stripe, Multer.
- **frontend-engineer** — `/frontend` only; Next.js App Router, MUI, RTK Query, RHF+Yup, Framer
  Motion, Swiper, Stripe Elements. Built the storefront and admin feature modules.
- **design-system** — translated the approved HTML mockup into a reusable MUI theme + shared
  components (the single owner of visual tokens).
- **integration-agent** — the only role allowed to touch both trees, to reconcile the API contract.
- **supervision-verifier** — compulsory, runs after every module; reviews, tests, and issues a
  PASS/FAIL verdict. It does not write features.

**Context management.** Shared context lived in version-controlled files rather than in any single
prompt:
- `CLAUDE.md` — the project memory: summary, fixed stack, data model, API conventions, design
  tokens, commit convention, directory layout, and the per-module Definition of Done.
- `.claude/skills/api-contract/SKILL.md` — the canonical request/response shapes, error envelope,
  pagination, status codes, and enums, referenced by every agent so the two sides stayed aligned.
- `.claude/skills/commit-discipline/SKILL.md` — Conventional Commits, one logical commit per module.
- `.claude/commands/{review-module,next-module}.md` — reusable prompts to scope the next module and
  invoke the supervisor.

**Cadence.** For each module: scope against the contract → implement → build → verify the running
behavior → commit (one Conventional Commit) → run the supervision-verifier → fix findings → repeat.
The backend domain was implemented with tight, per-module verification; the frontend feature
modules were delegated to the frontend-engineer subagent in coherent pairs (auth+catalog,
detail+cart, checkout+orders, admin+recommendations), each committed separately and gated by a
frontend supervision pass.

---

## 2. Where the agent helped and where it failed

**Helped.** Fast, broad, end-to-end scaffolding that stayed coherent: the repository pattern,
guards, DTOs, the order-integrity logic (price snapshot + atomic stock decrement + rollback), the
two-palette MUI theme extracted faithfully from the mockup, and the full RTK Query layer all came
together quickly and consistently because the contract was pinned in `CLAUDE.md` + the api-contract
skill.

**Failed / subtly wrong — caught and corrected:**

- **Empty-string `description` rejected (runtime 500).** The product schema marked `description`
  `required: true`; Mongoose treats `''` as missing, so creating a product without a description
  500'd. Caught while verifying admin image upload (a product with no description). Fixed: default
  `''`, not required.
- **Non-hermetic e2e test (caught by the supervisor).** The e2e set `process.env.MONGO_URI` to an
  in-memory server, but `ConfigModule` re-read `backend/.env` and the app connected to the real
  local MongoDB — so reruns failed with 409s on duplicate seed emails. Fixed by overriding
  `ConfigService` in the test module and dropping the DB in `afterAll`. This is the single best
  example of the supervisor catching something the implementer's own "5 green" run hid.
- **Mongoose v9 API rename.** `FilterQuery` no longer exists (renamed `QueryFilter`); the build
  failed until switched. A reminder that the agent's training-time API knowledge needed
  verification against the installed version.
- **`isNew` is a reserved Mongoose document flag.** A product field named `isNew` collides with
  `doc.isNew`; stored as `isNewArrival` internally and mapped to `isNew` in the API.
- **TypeScript decorator metadata.** Types used in decorated controller signatures
  (`@CurrentUser() user: AuthUser`) needed `import type` under `isolatedModules` +
  `emitDecoratorMetadata`; and string-enum `@Prop`s needed an explicit `type: String` to resolve
  under ts-jest. Both surfaced as build/test failures and were fixed.

**Caught by the supervisor as quality gaps (then fixed):**
- Product `category` was validated as a free-form string while a `Category` enum sat unused →
  constrained to `@IsEnum`.
- `cart.findOrCreate` was a non-atomic read-then-create (could 409 under a concurrent first request)
  → converted to an atomic upsert.
- `GET /admin/orders?status=` accepted any string → bound to an `@IsEnum`-validated query DTO.
- **(Phase 6 security sweep) Client-trusted payment.** `POST /orders` marked an order `paid`
  whenever the client supplied any `paymentIntentId` string — no Stripe verification. Fixed: when
  Stripe is enabled the server retrieves the intent and requires `succeeded` + amount matches the
  server-computed total + the intent's `metadata.userId` matches, before marking `paid`; otherwise
  it rejects (400). Without Stripe keys it stays `mock`. Also: randomized the mock intent id, added
  a min-length check on `JWT_SECRET`, and made the admin route group guarded-by-construction.

---

## 3. Supervision & verification

Every module was gated by the **supervision-verifier** subagent before moving on. It reviewed the
diff against the Definition of Done, adversarially probed auth/authorization/ownership and
money/stock edge cases, and ran the build + tests. Verdicts were surfaced verbatim and findings
fixed before the next module.

- Backend Products / Cart / Orders / Admin and the Design System passed on first review (with
  non-blocking NOTES items).
- The Recommendations/Seed/Tests batch **FAILED** on the non-hermetic e2e (see §2); it was fixed
  and re-verified green.
- A final whole-app security & data-integrity sweep (Phase 6) re-audited the entire surface.

Beyond the agent reviews, the running behavior was checked directly at each step with real HTTP
calls — e.g. order over-stock → 409 with stock left intact, price tampering rejected (400 via the
whitelist pipe), a normal user blocked from admin (403), cross-user order access (403), and the
full happy path (signup → cart → **real Stripe test** PaymentIntent → order → admin status advance →
customer sees the new status) including the CORS preflight.

**Tests** cover the logic most worth testing: order integrity (server price snapshot, over-stock
409 with no decrement, and the compensation/rollback path that the e2e can't reach), the shipping/
totals math, the role guard, and an e2e for auth + the deny-by-default + role gates.

---

## 4. Design workflow

The approved design was a self-contained, base64-bundled HTML mockup
(`MARL_Ecommerce_(standalone).html`). It was **decoded** to `docs/design.decoded.html` (the full
rendered DOM, all screens, copy, and inline styles) and `docs/design.css`, which became the visual
contract — this is also where the sample product catalog, categories, pricing rules, and
order-status colors were extracted from.

The **design-system** agent translated that mockup into:
- `theme/tokens.ts` — exact hex tokens (storefront warm-light + admin dark ramps, emerald accent,
  stock colors, the order-status color map) verified against the mockup.
- two MUI themes (`storefrontTheme`, `adminTheme`), Hanken Grotesk via `next/font`, ported global
  styles (emerald `::selection`, slim scrollbars, fade keyframes, ink focus ring).
- a presentational component library (Navbar, Footer, ProductCard, StatusChip, AdminShell,
  EmptyState, QuantityStepper, …) reused by every feature page.

**Iteration / decision:** storefront MUI `primary` was mapped to **ink** (`#111827`) rather than
emerald, because the mockup's primary CTAs ("Add to cart", "Checkout") are black pills and emerald
is reserved as the brand accent (the wordmark dot, links, the bright "Pay"/admin "Sign in"
buttons). Emerald is `secondary`; admin flips `primary` to emerald on dark. The supervisor
confirmed this against the mockup.

---

## 5. Assumptions

- **Open-ended "relevant suggestions" requirement** — interpreted two ways, both content/
  behaviour-based and deterministic (no external ML):
  - *Product page "You may also like"* — other products in the **same category**, newest first,
    topped up with newest arrivals when the category is thin.
  - *Personalized "Recommended for you"* (logged-in) — products from the **categories the user has
    actually purchased**, excluding items they already own, newest first, falling back to newest
    arrivals for users with no order history.
  Rationale: explainable, needs no third-party service, and uses data we already have (orders +
  catalog). Exposed as `GET /products/:id/recommendations` (public) and `GET /recommendations`
  (auth).
- **Cart requires login.** The cart is persisted per user (the spec wants a returning logged-in
  user to see their cart), so add-to-cart and the cart page require authentication; an
  unauthenticated add-to-cart redirects to login and returns to the product afterward.
- **Admin accounts are seed-only.** Signup always creates a `user`; role is never client-settable.
  Admins are created by the seed script. The staff login verifies `role === 'admin'` and revokes
  credentials otherwise.
- **Prices are whole USD dollars** (as in the mockup) and snapshotted on the order server-side.
- **Shipping**: flat **$12**, free strictly **over $150**, $0 for an empty cart — matching the
  mockup verbatim (so a $150 subtotal still pays shipping).
- **Order status lifecycle**: `pending → processing → shipped → delivered`, with `cancelled`
  reachable from any non-terminal state; illegal transitions are rejected (400).
- **Product images** are file uploads (Multer → local `/uploads`, served statically). The mockup's
  "or paste a URL" affordance was not wired (no image-URL field in the contract).
- **Payments** use Stripe **test mode**; if no secret key is configured the checkout uses a clearly
  marked mock that still creates the order (`paymentStatus: 'mock'` vs `'paid'`).
- **Zero-install dev database** (`mongodb-memory-server`) is provided for convenience; production
  use expects a real MongoDB / Atlas via `MONGO_URI`.

---

## 6. Trade-offs & scope

**Built fully:** auth (JWT + roles, deny-by-default), catalog (search/filter/sort/paginate),
product detail, persistent per-user cart, orders with stock + price integrity, Stripe test-mode
checkout, order history, admin product CRUD with image upload, admin order management with a
lifecycle, the analytics dashboard (with a chart), recommendations (both kinds), the seed script,
tests, and the full MUI design system across storefront + admin.

**Simplified / mocked (and why):**
- **Stock decrement uses single-document compare-and-set + compensating rollback**, not a multi-doc
  transaction, because the dev database (standalone `mongodb-memory-server`) doesn't support
  transactions. This is correct and race-safe per item; a production replica set + transaction (or
  a reconciliation job) would harden the multi-item rollback against a mid-rollback failure.
- **Dashboard category counts + featured row** are derived client-side from a single capped query
  (`limit: 100`) since there's no facet/count endpoint; with >100 products the sidebar counts would
  under-report. A backend facet endpoint is the real fix.
- **`minPrice`** is supported by the API but the storefront only surfaces a max-price slider (the
  mockup only had a max).
- **Admin product form doesn't collect `sizes`** yet (the API/DTO support it); admin-created
  products start size-less.
- **Seed wipes** `products/users/carts/orders` to a known state — convenient for a demo, but it
  will clear whatever `MONGO_URI` points at; treat it as a dev/setup tool.
- No refresh tokens (access token only), no email sending (the confirmation copy is cosmetic), and
  the product-detail image gallery uses placeholder thumbnails (the backend stores a single image).
- The auth token is kept in `localStorage` (so it survives reloads and the RTK Query base query can
  inject it). This is acceptable for the assessment but carries an XSS-exposure trade-off; an
  httpOnly, SameSite cookie would be the hardened production choice.

**With more time:** facet/counts endpoints, a real image gallery, refresh-token rotation, admin
size editing, transactional ordering on a replica set, richer dashboard metrics (AOV, deltas),
httpOnly-cookie auth, and broader test coverage (component/integration tests on the frontend).
