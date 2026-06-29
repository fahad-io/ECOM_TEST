# MARL — Mini E-Commerce Platform (Project Memory)

This file is the shared source of truth for every agent working in this repo. Read it before
making changes. It encodes the architecture, contracts, conventions, and the definition of done.

## 1. Project summary

MARL is a full-stack e-commerce platform: a **customer storefront** and an **admin console**,
backed by a single API. Visual + UX contract is the approved design in `docs/design.html`
(decoded to `docs/design.decoded.html`). Requirements spec is `docs/spec.md`.

Voice: quiet, editorial apparel ("The Autumn Edit", "Quietly considered wardrobe staples").
Products have a **Size** selector.

Guiding principle (from the spec): **Working over polished. Coherent over complete.** Prefer
breadth that connects end-to-end over depth in one corner. Mock clearly and record it in NOTES.md.

## 2. Fixed tech stack (do not substitute)

**Backend** (`/backend`)
- NestJS, modular architecture with the **repository pattern** — controllers → services →
  repositories → Mongoose models. No raw model access in controllers.
- MongoDB via Mongoose.
- JWT auth (access token; refresh optional), two roles: `admin`, `user`.
- `@nestjs/swagger` — Swagger UI at `/api/docs`, every endpoint documented with DTOs.
- Stripe (test mode) for payment.
- Local filesystem image storage (Multer → `/backend/uploads`, served statically). No cloud buckets.

**Frontend** (`/frontend`)
- Next.js (App Router) + TypeScript.
- MUI (Material UI) themed to the MARL design.
- Redux Toolkit + **RTK Query** for all server state / API calls.
- React Hook Form + **Yup** for every form and all client-side validation.
- Framer Motion for animations. Swiper for carousels. Stripe Elements for the payment element.

## 3. Data model (MongoDB collections)

**users**
- `name: string`, `email: string` (unique, lowercase), `passwordHash: string` (bcrypt),
  `role: 'user' | 'admin'` (default `user`), timestamps.

**products**
- `name: string`, `description: string`, `price: number` (USD, integer dollars in the design),
  `category: string` (Tops | Knitwear | Outerwear | Trousers | Footwear | Accessories),
  `stock: number` (>= 0), `sizes: string[]` (e.g. `['S','M','L','XL']`; empty for one-size),
  `imagePath: string | null` (relative `/uploads/...`), `isNew: boolean`, `tint: string` (hex
  placeholder swatch from the design), timestamps. `createdAt` drives "newest" sort + NEW badge.

**carts** (one per user, persisted)
- `user: ObjectId` (ref users, unique), `items: [{ product: ObjectId, qty: number (>=1),
  size: string | null }]`, timestamps. Ownership always enforced by `user` from the JWT.

**orders**
- `user: ObjectId` (ref users), `items: [{ product: ObjectId, name, price (snapshot), qty,
  size }]`, `subtotal: number`, `shipping: number`, `total: number`,
  `status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled'` (default `pending`),
  `shippingAddress: { fullName, email, street, city, postalCode }`,
  `paymentIntentId: string | null`, `paymentStatus: 'mock'|'paid'`, timestamps.
- Prices are **snapshotted server-side** at order creation. Never trust client totals.

### Business rules (from the design)
- Shipping: flat **$12**, **free** when subtotal > $150 (or cart empty → $0).
- Catalog page size: **6** per page.
- Stock labels: `<=0` Sold out; `<=5` "Only N left" (amber); else In stock (emerald).
- Order status colors — pending: amber `#92400E/#FEF3C7`; processing: blue `#1E40AF/#DBEAFE`;
  shipped: indigo `#3730A3/#E0E7FF`; delivered: green `#047857/#D1FAE5`;
  cancelled: red `#9F1239/#FFE4E6`.

## 4. API contract conventions

- Base path: **`/api`**. Swagger at `/api/docs`.
- Auth header: `Authorization: Bearer <accessToken>`.
- **Error envelope** (global exception filter, never leak stack traces):
  ```json
  { "statusCode": 400, "message": "Human readable" | ["field errors"], "error": "Bad Request", "path": "/api/...", "timestamp": "ISO" }
  ```
- **Pagination**: query `page` (1-based), `limit`; response `{ items: [...], total, page, limit }`.
- Status codes: 200 OK, 201 Created, 204 No Content, 400 validation, 401 unauthenticated,
  403 unauthorized (wrong role / not owner), 404 not found, 409 conflict (e.g. out of stock).
- Order status enum values are lowercase exactly as listed above. The full canonical contract
  lives in `.claude/skills/api-contract/SKILL.md`.

### Endpoint list
Auth:        `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
Products:    `GET /api/products` (search, category, minPrice, maxPrice, sort, page, limit),
             `GET /api/products/:id`, `GET /api/products/:id/recommendations`
Cart:        `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`,
             `DELETE /api/cart/items/:productId`, `DELETE /api/cart`
Orders:      `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`
Checkout:    `POST /api/checkout/payment-intent`, `POST /api/checkout/confirm`
Recommend:   `GET /api/recommendations` (personalized for the logged-in user)
Admin:       `POST /api/admin/products` (multipart), `PATCH /api/admin/products/:id`,
             `DELETE /api/admin/products/:id`, `GET /api/admin/orders`,
             `PATCH /api/admin/orders/:id/status`, `GET /api/admin/dashboard`

## 5. Directory layout

```
/backend     NestJS app (src/modules/*, repository pattern), uploads/, test/
/frontend    Next.js App Router app (src/app, src/components, src/store, src/theme)
/docs        spec.md, design.html (bundled), design.decoded.html, design.css
/.claude     agents/, skills/, commands/
CLAUDE.md    this file
README.md    setup + seeded credentials (Phase 6)
NOTES.md     agent workflow, decisions, trade-offs (Phase 6)
```

## 6. Commit convention

- **Conventional Commits**, one logical commit per module. Never squash into a single final dump.
- Scope by area: `feat(backend): ...`, `feat(frontend): ...`, `fix: ...`, `docs: ...`,
  `chore: ...`, `test(backend): ...`.
- Commit project-infra changes too (CLAUDE.md, .claude/, docs). History is reviewed.
- Details + staging rules: `.claude/skills/commit-discipline/SKILL.md`.

## 7. Definition of Done (every module)

A module is **not done** until `supervision-verifier` passes it against this list:
- [ ] Input validation on **client** (Yup) **and** server (class-validator DTOs).
- [ ] Auth enforced where required; **role authorization actually enforced** (not just present).
- [ ] Ownership checks: a user can only read/act on their own cart and orders.
- [ ] Money / stock / status correct under edge cases (over-stock order, negative qty,
      price tampering, accessing another user's data, a `user` hitting admin routes).
- [ ] No secrets committed; no plaintext passwords; no stack traces leaked to clients.
- [ ] Matches the approved design (tokens, layout, copy) for any UI.
- [ ] Tests where they matter; build passes.
- [ ] Swagger documents the endpoint (backend).

## 8. Workflow

Phased build (see `CLAUDE_CODE_PROMPT.md`). After each module: commit → run
`supervision-verifier` → fix findings. Stop at the end of each phase and wait for go-ahead.
