# Claude Code — Master Prompt: MARL Mini E-Commerce Platform

> **How to use this**
> 1. Open Claude Code in an empty project folder.
> 2. Attach both files to the session: `Fullstack_Assessment_Task_Final_3.md` (the spec) and `MARL_Ecommerce__standalone_.html` (the design).
> 3. Paste **everything below the line** as your first message.
> 4. Supervise. Claude Code will pause at the end of each phase for your review — read its diffs, don't rubber-stamp.

---

You are the orchestrator for a supervised, timed build of a full-stack e-commerce platform called **MARL**. Two attached files are your source of truth:

- `Fullstack_Assessment_Task_Final_3.md` — the **requirements spec**. Re-read it fully before doing anything. Everything you build must trace back to a requirement in it.
- `MARL_Ecommerce__standalone_.html` — the **approved design**. This is a self-contained bundled HTML mockup of the storefront and admin panel. Open and render it (it base64-unpacks on load) and treat it as the visual + UX contract. Do not invent a different look. Extract its design tokens and reproduce its layouts, copy, and component structure.

**Do not start coding features yet.** Work through the phases below in order. Commit after every module as specified. After each phase, stop and summarise what you did and what you'll do next, then wait for my go-ahead.

---

## Tech stack (fixed — do not substitute)

**Backend**
- NestJS (modular, repository pattern — services talk to repositories, repositories wrap Mongoose models; no raw model access in controllers)
- MongoDB via Mongoose
- JWT authentication (access token; refresh optional) with two roles: `admin` and `user`
- `@nestjs/swagger` — full Swagger UI at `/api/docs`, every endpoint documented with DTOs
- Stripe (test mode) for payment
- Local filesystem storage for product images (Multer → `/uploads`, served statically). No cloud buckets.

**Frontend**
- Next.js (App Router) + TypeScript
- MUI (Material UI) as the component layer, themed to the MARL design
- Redux Toolkit + **RTK Query** for all server state / API calls
- React Hook Form + **Yup** for every form and all client-side validation
- Framer Motion for page/element animations
- Swiper for carousels (e.g. "You may also like", featured/new-in)
- Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`) for the checkout payment element

---

## Design tokens (extracted from the HTML — use these in the MUI theme)

- **Brand:** `MARL.` (wordmark with an emerald dot accent)
- **Type:** `Hanken Grotesk`, sans-serif (load via `next/font` or Google Fonts)
- **Storefront palette (light, warm):** background `#faf9f5`; ink `#111827` / `#0E1116`; muted text `#374151`, `#4B5563`, `#6B7280`; borders/dividers `#E5E7EB`, `#D1D5DB`
- **Accent (emerald):** primary `#10B981`; dark `#047857`; deep `#06281D`; tints `#ECFDF5`, `#D1FAE5`, `#A7F3D0`
- **Admin palette (dark "ADMIN CONSOLE"):** surfaces `#0E1116`, `#111827`, `#161B22`, `#1B2129`, `#232A33`
- **Order-status palette:** pending/processing → amber (`#D97706`, `#92400E`); shipped → blue (`#1E40AF`, `#DBEAFE`); delivered → green (`#047857`, `#D1FAE5`); cancelled → red (`#DC2626`, `#9F1239`)
- **Voice:** quiet, editorial apparel — e.g. "The Autumn Edit", "Quietly considered wardrobe staples". Products have a **Size** selector.

**Screens present in the mockup (match these):**
- Storefront: catalog/shop (Filter, Category, Max price, sort, pagination, "Showing N", NEW badges, empty state), product detail (Size, "You may also like"), cart (line items, Subtotal/Shipping/Total, empty state), checkout (Contact, Shipping address, Payment: card number/expiry/CVC, Order summary), order confirmed, "Your orders" history, customer auth.
- Admin: "Staff sign in" / "ADMIN CONSOLE" dark login, dashboard (Sales over time, Orders by status, Top-selling products), product management (table with Edit/Delete + create/edit form with "Drop image or browse" upload), order management (status: Pending/Processing/Shipped/Delivered/Cancelled).

---

## PHASE 0 — Project context, agents, and repo setup (do this first)

1. **Read** the spec end-to-end and skim the rendered HTML. Produce a short data model (collections: `users`, `products`, `carts`, `orders`) and an endpoint list before writing code. Show it to me.
2. **Initialise git** in the repo root. Make your first commit `chore: scaffold repo and project context`. Add a sensible `.gitignore` (node_modules, `.env`, `/uploads/*` except a `.gitkeep`, `.next`, `dist`).
3. **Copy the two attached files into the repo** at `/docs/spec.md` and `/docs/design.html` so they live alongside the code and agents can reference them.
4. **Create `CLAUDE.md`** at the repo root — the shared project memory. It must contain: the project summary, the fixed tech stack above, the data model, the API contract conventions (base path `/api`, error shape, auth header), the design tokens, the commit convention (Conventional Commits, one commit per module), the directory layout, and a "definition of done" checklist for every module (validation client+server, auth/authz enforced, tests where it matters, no secrets committed, matches design).
5. **Create the `.claude/` structure** with agents, skills, and roles for frontend and backend **separately**:

```
.claude/
  agents/
    backend-engineer.md
    frontend-engineer.md
    design-system.md
    integration-agent.md
    supervision-verifier.md
  skills/
    commit-discipline/SKILL.md
    api-contract/SKILL.md
  commands/
    review-module.md        # reusable prompt to invoke the supervisor on the last module
    next-module.md          # reusable prompt to scope + start the next module
```

Define each agent as a proper Claude Code subagent (YAML frontmatter: `name`, `description`, `tools`, and a focused system prompt). Roles:

- **backend-engineer** — owns everything under `/backend`. NestJS modular architecture, **repository pattern**, Mongoose schemas, DTOs + `class-validator`, JWT + role guards, Swagger decorators, Stripe test-mode service, Multer local image upload. Knows nothing about React; its contract with the world is the OpenAPI spec.
- **frontend-engineer** — owns everything under `/frontend`. Next.js App Router, MUI themed to MARL, RTK Query slices, React Hook Form + Yup, Framer Motion, Swiper, Stripe Elements. Consumes the backend strictly through RTK Query endpoints; never reaches into backend internals.
- **design-system** — translates the MARL HTML mockup into a reusable MUI theme + shared components (typography scale, the two palettes, buttons, inputs, cards, badges, status chips, nav/footer, admin shell). This is how we "produce the design through design tooling" rather than dropping in a template. It runs before the bulk of frontend feature work and is the single owner of visual tokens.
- **integration-agent** — the bridge between frontend and backend. After a backend module and its frontend counterpart exist, it verifies the **API contract** matches on both sides: request/response shapes, status codes, auth headers, error envelope, pagination params, enum values (order statuses). It wires RTK Query endpoints to real NestJS routes, fixes mismatches, and confirms the happy path works end-to-end (e.g. via the running servers / Swagger). It is the only agent allowed to edit both `/frontend` and `/backend` in the same change, and only to reconcile the contract.
- **supervision-verifier** (**compulsory, runs after every module**) — does not write features. It reviews the diff against the spec and the module's definition of done: checks input validation on client **and** server, confirms auth + role authorization is actually enforced (not just present), checks money/stock/status correctness and edge cases (ordering more than stock, negative quantities, price tampering, accessing another user's cart/orders, a normal user hitting admin endpoints), confirms no secrets or stack traces leak, runs the test suite and the build, and writes a short pass/fail verdict with required fixes. **A module is not "done" until this agent passes it.** If it fails, the responsible agent fixes and it re-runs.

The two **skills**: `commit-discipline` (Conventional Commit messages, one logical commit per module, never a single "final dump", what to stage/ignore) and `api-contract` (the canonical error shape, pagination convention, auth header, and status-code rules every agent must follow).

6. Commit: `chore: add CLAUDE.md, agents, skills, and project docs`.

**Stop here and show me the data model, endpoint list, and the agent/skill files before continuing.**

---

## PHASE 1 — Backend scaffold + auth (foundation)

Build with the **backend-engineer**, in this order, **committing after each numbered module** and running **supervision-verifier** after each:

1. Scaffold NestJS, Mongo connection, config (`@nestjs/config`, `.env` + `.env.example`), global validation pipe, global exception filter (consistent JSON error shape, no stack traces), Swagger at `/api/docs`, static serving of `/uploads`. → commit `feat(backend): scaffold nest app, config, swagger, error handling`
2. **Auth module** — `users` schema (password hashed with bcrypt, `role: 'user' | 'admin'`), signup, login, JWT issuance, `JwtAuthGuard`, `RolesGuard` + `@Roles()` decorator, `/auth/me`. → commit `feat(backend): auth with jwt and role-based guards`

After each: run supervision-verifier, address findings, then move on.

---

## PHASE 2 — Backend domain (catalog → cart → orders → checkout → admin → recommendations)

Continue with **backend-engineer**, one module per commit, supervisor after each:

3. **Products** — schema (name, description, price, image path, category, stock, size/options, `createdAt`); public list endpoint with **search by name, filter by category + price range, sort by price/newest, pagination**; public detail endpoint. → `feat(backend): product catalog with search, filter, sort, pagination`
4. **Cart** — per-user cart persisted in Mongo (survives sessions), add/remove/update quantity, server-recomputed line + order totals, ownership enforced. → `feat(backend): persistent per-user cart`
5. **Orders** — create order from cart with a **transaction-style stock check** (reject ordering more than in stock; decrement stock atomically; snapshot prices server-side so the client can't tamper), customer order history, single order view, status field. → `feat(backend): orders with stock + price integrity`
6. **Checkout / payment** — Stripe **test mode** PaymentIntent; on confirmed payment, finalise the order and set status `pending`; mocked fallback clearly marked if Stripe keys absent. → `feat(backend): stripe test-mode checkout`
7. **Admin** — product CRUD (create/edit/delete) with **Multer local image upload** to `/uploads`; order management (list all, update status through `pending → processing → shipped → delivered` and the `cancelled` path); dashboard analytics (total sales, order count by status, top-selling products). All admin routes behind `RolesGuard('admin')`. → `feat(backend): admin product/order management and analytics`
8. **Recommendations** (the open-ended requirement) — implement a reasonable "products relevant to them" endpoint and **document the interpretation in NOTES.md** (e.g. same-category / co-purchased / recently-viewed fallback to top-sellers). → `feat(backend): personalized product recommendations`
9. **Seed script** — sample products, one admin, one customer; idempotent; npm script. → `feat(backend): seed script`
10. **Backend tests** — a few meaningful tests on the tricky logic (stock/price integrity on order creation, auth/role guard behaviour, totals math). → `test(backend): cover order integrity and access control`

---

## PHASE 3 — Design system

With the **design-system** agent: build the MUI theme (two palettes — storefront light + admin dark), Hanken Grotesk typography, and shared components matching the HTML (buttons, inputs, product card, status chip, nav, footer, admin shell, empty states). → commit `feat(frontend): MARL design system and MUI theme`. Run supervisor (design fidelity + accessibility basics).

---

## PHASE 4 — Frontend (storefront read → write → admin)

With **frontend-engineer**, one module per commit, supervisor after each. Scaffold first:

11. Scaffold Next.js + TS, MUI provider, Redux store + RTK Query base API (auth header injection, error handling), Framer Motion layout transitions. → `feat(frontend): scaffold next app, store, rtk query base`
12. **Auth UI** — signup/login (React Hook Form + Yup), token handling, auth-gated routing, separate **Staff sign in** for admin. → `feat(frontend): auth flows for customer and staff`
13. **Catalog** — shop page with filters (category, max price), sort, search, pagination, NEW badges, empty state; Swiper for featured/new-in. → `feat(frontend): product catalog`
14. **Product detail** — full info, Size + quantity, add-to-cart, "You may also like" Swiper. → `feat(frontend): product detail and add-to-cart`
15. **Cart** — line items, update/remove, Subtotal/Shipping/Total, empty state, persists for logged-in users. → `feat(frontend): cart`
16. **Checkout** — Contact + Shipping + Stripe payment element, order summary, validation; success → **Order confirmed** page. → `feat(frontend): checkout with stripe`
17. **Order history** — "Your orders" list with statuses + single order view. → `feat(frontend): order history`
18. **Admin panel** — dark console: dashboard (Sales over time + Orders by status + Top-selling, **at least one chart**), product management table + create/edit form with "Drop image or browse" upload, order management with status updates. Route + UI guarded to admins. → `feat(frontend): admin console`
19. **Recommendations UI** — surface the relevant-products feature where the design shows it. → `feat(frontend): product recommendations ui`

---

## PHASE 5 — Integration pass

Run the **integration-agent** across every feature pair. Verify each RTK Query endpoint hits the real NestJS route with matching shapes, auth headers, status codes, error envelope, pagination params, and status enums. Fix mismatches. Confirm full end-to-end happy paths against the running servers: signup → browse → cart → checkout (Stripe test card) → order appears in history → admin sees it → admin advances status → customer sees the new status. → commit `fix: reconcile frontend/backend api contract` (plus granular fixes as needed). Supervisor signs off on the integrated flows.

---

## PHASE 6 — Hardening, docs, and clean-clone check

20. **Security/integrity sweep** (supervision-verifier-led): authz on every protected route, a normal user blocked from all admin endpoints and others' data, secrets only in `.env`, no plaintext passwords, no stack traces to users, totals/stock correct under edge cases. Fix anything found. → `fix: security and data-integrity hardening`
21. **README.md** — prerequisites, env vars (with `.env.example` for both apps), how to run backend + frontend, how to seed, **seeded admin + customer credentials**, Stripe test card note. → `docs: readme with setup and seeded credentials`
22. **NOTES.md** — exactly the six sections the spec requires: **Agent workflow** (which agents, how scoped/prompted, how context was managed via CLAUDE.md and commands), **where the agent helped and where it failed** (concrete caught mistakes + fixes), **supervision & verification** (how the supervisor gated each module), **design workflow** (HTML mockup → design-system agent → MUI theme, iterations), **assumptions** (every ambiguous decision, **including the recommendations interpretation**), **trade-offs & scope** (built fully vs mocked vs future work). → `docs: notes on agent workflow, decisions, and trade-offs`
23. **Clean-clone test** — clone into a fresh folder, follow your own README, seed, run both apps, smoke-test the end-to-end flow. Fix any gap the README missed. → `chore: verify clean clone setup`

---

## Standing rules for the whole build

- **Commit after every module** with a Conventional Commit message. Never squash into one final dump — the history is reviewed.
- **Run supervision-verifier after every module.** A module isn't done until it passes. Surface its verdicts to me.
- **Stop at the end of each phase**, summarise, and wait for my go-ahead before the next.
- **Trace to the spec.** Working over polished, coherent over complete. If you're short on time, prefer breadth that connects end-to-end over depth in one corner — mock clearly and note it in NOTES.md.
- **Never** commit secrets, store plaintext passwords, leak stack traces, trust client-supplied prices/totals, or let a normal user reach admin functionality or another user's data.
- If a requirement is genuinely ambiguous (beyond the open-ended one), ask me rather than guessing.

Begin with **Phase 0** now.
