# MARL — Mini E-Commerce Platform

A full-stack e-commerce platform: a **customer storefront** and an **admin console**, backed by a
single API. Quiet, editorial apparel ("The Autumn Edit"). Built with a supervised, agent-driven
workflow — see [`NOTES.md`](NOTES.md).

- **Backend** — NestJS (modular, repository pattern), MongoDB/Mongoose, JWT auth with `user`/`admin`
  roles, Swagger, Stripe test-mode checkout, local image upload.
- **Frontend** — Next.js (App Router) + TypeScript, MUI (themed to the MARL design), Redux Toolkit +
  RTK Query, React Hook Form + Yup, Framer Motion, Swiper, Stripe Elements.

```
/backend     NestJS API (src/modules/*, repository pattern), uploads/, test/
/frontend    Next.js App Router app (src/app, src/components, src/store, src/theme)
/docs        spec.md, design.html (approved mockup), design.decoded.html
CLAUDE.md    shared project memory / contract
NOTES.md     agent workflow, decisions, trade-offs
```

---

## Prerequisites

- **Node.js 20+** and npm.
- **MongoDB** — any one of:
  - a local MongoDB on `mongodb://127.0.0.1:27017`, **or**
  - a MongoDB Atlas connection string, **or**
  - **nothing at all** — the backend ships a zero-install in-memory MongoDB (`npm run db:mem`),
    handy for a clean-clone smoke test (data is ephemeral, lost when the process stops).
- (Optional) **Stripe test keys** — without them, checkout falls back to a clearly-marked mock
  payment (no real charge). With them, checkout uses real Stripe **test mode**.

---

## 1. Backend (`/backend`)

```bash
cd backend
npm install
cp .env.example .env          # then edit .env (see below)
```

### Environment (`backend/.env`)

| Var | Purpose | Default / example |
|-----|---------|-------------------|
| `PORT` | API port | `8000` |
| `NODE_ENV` | environment | `development` |
| `CLIENT_URL` | allowed CORS origin (the frontend) | `http://localhost:3000` |
| `MONGO_URI` | MongoDB connection | `mongodb://127.0.0.1:27017/marl` or an Atlas `mongodb+srv://…` URI |
| `JWT_SECRET` | JWT signing secret (**required**) | a long random string |
| `JWT_EXPIRES_IN` | access-token lifetime | `7d` |
| `STRIPE_SECRET_KEY` | Stripe **test** secret key (optional) | blank → mock payment |
| `STRIPE_WEBHOOK_SECRET` | (reserved) | blank |

### Run

```bash
# Option A — you have a MongoDB (local or Atlas): point MONGO_URI at it.
npm run seed          # populates sample products, an admin, two customers, sample orders
npm run start         # API at http://localhost:8000/api  (Swagger: /api/docs)

# Option B — no MongoDB installed (zero-install ephemeral DB):
#   terminal 1:
npm run db:mem        # starts an in-memory MongoDB on 127.0.0.1:27017
#   terminal 2 (with MONGO_URI=mongodb://127.0.0.1:27017/marl):
npm run seed && npm run start
```

- **Swagger UI**: <http://localhost:8000/api/docs>
- `npm run start:dev` for watch mode.

### Backend tests

```bash
npm test              # unit tests (pricing, order integrity + rollback, role guard)
npm run test:e2e      # e2e (auth + guards) — spins up its own in-memory MongoDB, no setup needed
```

---

## 2. Frontend (`/frontend`)

```bash
cd frontend
npm install
cp .env.example .env.local    # then edit .env.local (see below)
```

### Environment (`frontend/.env.local`)

| Var | Purpose | Example |
|-----|---------|---------|
| `NEXT_PUBLIC_API_URL` | backend base URL (include `/api`) | `http://localhost:8000/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **publishable** test key (optional) | `pk_test_…` (blank → mock checkout) |

> Only the Stripe **publishable** (`pk_`) key belongs in the frontend. The secret (`sk_`) key
> stays in the backend `.env`.

### Run

```bash
npm run dev           # http://localhost:3000   (or: npm run build && npm run start)
```

---

## Seeded credentials

After `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@marl.test` | `admin12345` |
| **Customer** (has order history) | `customer@marl.test` | `customer123` |
| Customer | `maya@marl.test` | `customer123` |

- The storefront is at `/`; sign in at `/login`.
- The admin console is at `/admin`; staff sign in at `/admin/login` (admins only — a normal
  customer is rejected).

## Stripe test payment

When Stripe keys are configured (test mode), use card **`4242 4242 4242 4242`**, any future
expiry, any CVC, any postal code. No real charge is made. Without keys, the checkout shows a clear
"mock payment" path and still creates the order.

## Quick end-to-end flow to try

Sign up (or log in as the seeded customer) → browse the catalog → open a product → add to cart →
checkout with the test card → see the order confirmation and your order in **Your orders** → sign
in as the admin → see the order under **Orders**, advance its status → the customer sees the new
status.
