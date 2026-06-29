---
name: api-contract
description: The canonical MARL API contract every agent must follow — error envelope, pagination, auth header, status codes, enum values, and the full endpoint list with request/response shapes.
---

# API contract (canonical)

Base path **`/api`**. Swagger UI at `/api/docs`. JSON everywhere except image upload (multipart).

## Auth
- Header: `Authorization: Bearer <accessToken>`.
- Token payload: `{ sub: userId, email, role }`. Access token; refresh optional.
- `@Public()` marks routes that skip `JwtAuthGuard`. `@Roles('admin')` + `RolesGuard` for admin.

## Error envelope (every error response)
```json
{
  "statusCode": 409,
  "message": "Not enough stock for Merino Crew Knit",
  "error": "Conflict",
  "path": "/api/orders",
  "timestamp": "2026-06-29T12:00:00.000Z"
}
```
- `message` is a string, or an array of strings for field validation errors.
- Never return stack traces, Mongoose errors, or internal details.

## Status codes
- `200` OK · `201` Created · `204` No Content (deletes)
- `400` validation / malformed · `401` missing/invalid token · `403` wrong role or not owner
- `404` not found · `409` conflict (out of stock, duplicate email)

## Pagination
- Request: `?page=1&limit=6` (page is 1-based; default limit 6 for catalog).
- Response: `{ "items": [...], "total": <int>, "page": <int>, "limit": <int> }`.

## Enums
- Order status: `pending | processing | shipped | delivered | cancelled` (lowercase).
  Lifecycle: `pending → processing → shipped → delivered`, plus a `cancelled` path.
- Sort values (products): `new` (default, newest first), `price-asc`, `price-desc`.
- Categories: `Tops | Knitwear | Outerwear | Trousers | Footwear | Accessories`.

## Endpoints

### Auth
- `POST /api/auth/signup` — body `{ name, email, password }` → `201 { accessToken, user }`.
- `POST /api/auth/login` — body `{ email, password }` → `200 { accessToken, user }`.
- `GET /api/auth/me` — auth → `200 { id, name, email, role }`.

### Products (public)
- `GET /api/products?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=` →
  `200 { items: Product[], total, page, limit }`.
- `GET /api/products/:id` → `200 Product` | `404`.
- `GET /api/products/:id/recommendations` → `200 Product[]` (related items).

`Product`: `{ id, name, description, price, category, stock, sizes, imagePath, isNew, tint, createdAt }`.

### Cart (auth, owner = token user)
- `GET /api/cart` → `200 { items: [{ product, qty, size }], subtotal, shipping, total }`.
- `POST /api/cart/items` — `{ productId, qty, size }` → `200 cart`.
- `PATCH /api/cart/items/:productId` — `{ qty, size? }` → `200 cart`.
- `DELETE /api/cart/items/:productId` → `200 cart`.
- `DELETE /api/cart` → `204`.

### Orders (auth, owner)
- `POST /api/orders` — `{ shippingAddress, paymentIntentId? }`; builds from the user's cart,
  snapshots prices, checks/decrements stock → `201 Order` | `409` out of stock.
- `GET /api/orders` → `200 Order[]` (the caller's orders, newest first).
- `GET /api/orders/:id` → `200 Order` (owner only, else `403/404`).

`Order`: `{ id, items:[{ product, name, price, qty, size }], subtotal, shipping, total,
status, shippingAddress, paymentStatus, createdAt }`.

### Checkout
- `POST /api/checkout/payment-intent` — `{ }` (amount derived server-side from cart) →
  `200 { clientSecret, paymentIntentId }`; if Stripe keys absent → `200 { mock: true }`.
- `POST /api/checkout/confirm` — `{ paymentIntentId }` → finalises; usually clients call
  `POST /api/orders` after a confirmed payment.

### Recommendations
- `GET /api/recommendations` — auth → `200 Product[]` personalized for the user.
  (Interpretation documented in NOTES.md.)

### Admin (auth + `@Roles('admin')`)
- `POST /api/admin/products` — multipart (`image` file + fields) → `201 Product`.
- `PATCH /api/admin/products/:id` — multipart or JSON → `200 Product`.
- `DELETE /api/admin/products/:id` → `204`.
- `GET /api/admin/orders?status=` → `200 Order[]` (all orders, with customer).
- `PATCH /api/admin/orders/:id/status` — `{ status }` → `200 Order`.
- `GET /api/admin/dashboard` → `200 { totalSales, ordersByStatus, topProducts, salesOverTime }`.
