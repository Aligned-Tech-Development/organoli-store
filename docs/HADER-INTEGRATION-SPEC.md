# Organoli website ↔ hader.ai integration spec

**For:** the Alignbot (hader.ai) team · **From:** the Organoli website (`organoli-store`, Next.js on Vercel)
**Goal:** hader is the single source of truth for Organoli's products and orders. The website reads products from the Organoli tenant, and orders placed on the website land in the tenant's orders page next to WhatsApp/bot orders.

Everything below is additive: new API-key scopes, three API-key endpoints, one `carts` migration. No existing behaviour changes.

---

## 1. What exists today and why it isn't enough

| Need | Today | Gap |
|---|---|---|
| Read the full catalogue | `GET /v1/read/products` (`read:catalog`) — `apps/api/src/modules/read/read.routes.ts` | `limit` max 100 and `nextCursor` is always `null`, so a 320-product tenant can't be listed. Returns only the first image, no `attributes`, no `stockQuantity`, `compareAtMinor` or category slug. |
| Create an order from a website | Orders (`Cart`) are created only from chat (`captureCart` in `apps/api/src/lib/cart-flow.ts`) and voice (`POST /v1/voice/calls/:callUuid/order`) | No API-key endpoint and no `web` channel. |
| Show a customer their orders | Dashboard only (`carts.routes.ts`, session auth) | No way to read a customer's orders with an API key. |
| Keep the website in sync | Webhooks `product_created/updated/deleted`, `cart_status_changed` exist and are HMAC-signed | Payloads carry only `{ id, sku }` (fine), but the **CSV import worker emits no webhooks**, so bulk changes are invisible to subscribers. |

### Interim product sync (live on the website now)

Until §3 ships, the website reads the existing `GET /api/v1/read/products` with a `read:catalog` key, one request per website category × availability (16 requests, each group < 100 products), cached 5 minutes and refreshed instantly by the `product_*` / `catalog_changed` webhooks. Limits of this stop-gap: only the main photo comes from hader, products must sit in one of the 8 website categories, and a group reaching 100 products would be truncated (the website logs a warning). Code: `organoli-store/lib/hader.ts`.

---

## 2. New API-key scopes

Add to `apiKeyScopes` in `packages/shared/src/schemas/api-key.ts`:

| Scope | Grants |
|---|---|
| `read:storefront` | `GET /v1/storefront/products`, `GET /v1/storefront/products/:sku` |
| `write:orders` | `POST /v1/orders` |
| `read:orders` | `GET /v1/orders`, `GET /v1/orders/:id` (always filtered by `customerRef`) |

The Organoli website will hold one server-side key with all three. It is never exposed to browsers.

---

## 3. `GET /v1/storefront/products`

Full-fidelity, paginated catalogue for storefronts.

**Query**

| Param | Type | Notes |
|---|---|---|
| `limit` | int 1–200, default 100 | |
| `cursor` | string | Opaque; returned as `nextCursor`. Order by `(updatedAt, id)`. |
| `updatedSince` | ISO datetime, optional | Incremental sync. When set, **include soft-deleted rows** with `deletedAt` populated so the client can remove them. |

**Response** `200`
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "sku": "zinc-glycinate-now-120-softgels",
      "name": "Zinc Glycinate (Now), 120 softgels",
      "slug": "zinc-glycinate-now-120-softgels",
      "shortDescription": "…",            // plain text (stripHtmlForBot is fine)
      "description": "…",
      "priceMinor": 2500,                 // null = no price yet
      "compareAtMinor": null,
      "currency": "USD",
      "isAvailable": true,
      "stockQuantity": null,              // null when trackInventory = false
      "category": { "slug": "vitamins-minerals", "name": "Vitamins & Minerals" },   // or null
      "images": [ { "url": "https://…", "alt": "…", "isPrimary": true } ],         // ALL images, sortOrder asc, resolved URLs
      "variants": [ { "sku": "…", "name": "…", "options": {}, "priceMinor": null, "isAvailable": true, "stockQuantity": null } ],
      "attributes": { },                  // Product.attributes as stored (may be null)
      "updatedAt": "2026-10-08T12:00:00.000Z",
      "deletedAt": null                   // only non-null when updatedSince is used
    }
  ],
  "nextCursor": "…"                       // null on the last page
}
```

`GET /v1/storefront/products/:sku` returns one item of the same shape (404 if missing or deleted).

Notes
- Exclude `sourceSystem = 'alinia'` rows (not relevant to retail storefronts) or include them — either is fine for Organoli.
- Reuse `read-cache` (60 s) keyed by query; `emitWebhookEvent` already invalidates it.
- Image URLs must be publicly fetchable (the website serves them through `next/image`). If `resolveAssetUrl` returns expiring signed URLs, please give them ≥ 24 h validity or return a stable public URL.

---

## 4. `POST /v1/orders`

Creates a `Cart` with `channel = 'web'`, through the same `captureCart` path as chat orders, so pricing, promotions, delivery fee, minimum order, operator notification and the `cart_created` webhook all behave identically.

**Request**
```jsonc
{
  "idempotencyKey": "web_7f2c…",          // required; same key → same order returned, no duplicate
  "customer": {
    "name": "Rana K.",
    "phone": "+96181047743",              // E.164; becomes Cart.customerPhone
    "email": "rana@example.com"           // optional
  },
  "customerRef": "user_2abc…",            // optional; the website's account id (Clerk). Null for guests.
  "items": [ { "sku": "zinc-glycinate-now-120-softgels", "quantity": 2 } ],
  "fields": {                              // keys must match the tenant's shopForm.fields[].key
    "address": "Hamra, Bliss St, Bldg 12, 3rd floor",
    "area": "Beirut",
    "payment": "Cash on delivery",
    "notes": "Call before arriving"
  }
}
```

**Server rules**
- Prices come from the catalogue only — the request carries SKUs and quantities, never prices.
- Reject with `422` and per-line reasons if a SKU is unknown, deleted, unavailable, or has no price: `{ "error": "...", "lines": [ { "sku": "…", "reason": "unavailable" } ] }`.
- Enforce the tenant's minimum order and required `shopForm` fields (as `voice-order.ts` already does).
- Create the Cart with `status = 'new'`, `channel = 'web'`, `threadId = null`, fire `createNotification` (no thread, so always notify) and `emitWebhookEvent('cart_created')`.
- Rate-limit per key (e.g. 30/min).

**Response** `201` (or `200` when the idempotency key matched an existing order)
```jsonc
{
  "id": "uuid",
  "number": "OR-1042",                    // see §6 — or omit and the website shows a short id
  "status": "new",
  "currency": "USD",
  "subtotalMinor": 9500, "discountMinor": 0, "deliveryMinor": 0, "totalMinor": 9500,
  "items": [ { "sku": "…", "name": "…", "quantity": 2, "unitPriceMinor": 2500, "lineTotalMinor": 5000 } ],
  "createdAt": "…"
}
```

### Migration on `carts`
```sql
ALTER TABLE carts ADD COLUMN external_customer_ref text;
ALTER TABLE carts ADD COLUMN idempotency_key text;
CREATE INDEX carts_org_customer_ref_idx ON carts (organization_id, external_customer_ref, created_at DESC);
CREATE UNIQUE INDEX carts_org_idempotency_key_uidx ON carts (organization_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
```
(Prisma: `externalCustomerRef String? @map("external_customer_ref")`, `idempotencyKey String? @map("idempotency_key")`.)

### Dashboard
- Show channel **Web** in the orders list and channel filter (`apps/web`), with the delivery fields from `Cart.fields`.

---

## 5. `GET /v1/orders` and `GET /v1/orders/:id`

For the website's "Your orders" page.

- `GET /v1/orders?customerRef=user_2abc…&limit=50` → `{ data: Order[], nextCursor }`, newest first. `customerRef` is **required** — the key must never list all orders.
- `GET /v1/orders/:id?customerRef=…` → one order, 404 unless it belongs to that `customerRef`.
- `Order` = the §4 response shape plus `status`, `updatedAt` and `fields`.

---

## 6. Order numbers (recommended, optional)

Carts only have UUIDs. Customers and the pharmacist need something they can say on the phone. Suggest a per-org sequence:
```sql
ALTER TABLE carts ADD COLUMN order_number int;
-- assigned on insert from a per-organization counter (e.g. organizations.next_order_number)
CREATE UNIQUE INDEX carts_org_order_number_uidx ON carts (organization_id, order_number);
```
Displayed as `OR-<number>` (prefix could be a tenant setting). Useful for WhatsApp orders too. If skipped, the website shows `#` + the first 8 characters of the UUID.

---

## 7. Webhooks (product sync)

The website will register an endpoint `https://organoli-store.vercel.app/api/hader/webhook` for: `product_created`, `product_updated`, `product_deleted`, `catalog_changed`, `cart_status_changed`. It verifies `X-Aligned-Signature` (`sha256=hex(hmac(secret, timestamp + "." + body))`) and rejects timestamps older than 5 minutes.

On a product event it re-fetches that SKU from §3 (or deletes it); on `catalog_changed` it re-syncs with `updatedSince`.

**Request:** have the CSV import worker (`apps/worker/src/jobs/import.ts`) emit **one `catalog_changed`** per completed import job (not one event per row), and make sure availability/stock toggles from the dashboard and bot paths emit `product_updated`.

---

## 8. Status mapping

| hader `Cart.status` | Website label |
|---|---|
| `new` | Placed |
| `confirmed` | Confirmed |
| `completed` | Delivered |
| `cancelled` | Cancelled |

---

## 9. Bug found during the first import

`intish` in `apps/worker/src/jobs/shared-upsert.ts` accepts only digits, so an **empty** `Price` or `Stock` cell fails with `Invalid input` — although the template (`apps/api/src/modules/imports/template.ts`) says "Leave blank to set later". The first Organoli import failed on every row for this reason. Suggested fix: treat `''` (after trim) as `undefined` before validation, e.g.
```ts
const intish = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/).transform(Number)]).nullable().optional(),
);
```
Until then, the website's export omits the Stock column and puts unpriced products in a separate file without a Price column.

## 10. Nice to have

- **Import: an `Attributes` column** (JSON) so storefront facets (brand, goals, dietary, format, dose) can be bulk-loaded and edited in hader. Until then the website derives them from the product name and description.
- **Per-area delivery fees** (Beirut / Mount Lebanon / North, South & Bekaa). `ShopFormLite` supports a flat fee + free-above threshold and per-country rules, not per-area.

---

## 11. Organoli tenant setup (once the above ships)

1. **API key** with `read:storefront`, `write:orders`, `read:orders` → given to the website as `HADER_API_KEY` (Vercel env, server-only), plus `HADER_API_URL`.
2. **Webhook endpoint** as in §7 → signing secret given to the website as `HADER_WEBHOOK_SECRET`.
3. **Shop form fields** with keys `address`, `area`, `payment`, `notes`; delivery fee and free-delivery threshold ($75 for Beirut today).
4. **Products** — imported once from `data/hader/organoli-products.csv` and `organoli-products-no-price.csv` (Catalog → Import → Products); SKU = website slug.
5. **WhatsApp bot** on its own number (to be decided — **not** +961 81 047 743, which stays the website's customer-service WhatsApp), so bot orders and website orders share the same orders page.
