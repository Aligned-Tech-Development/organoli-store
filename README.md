# Organoli store

Next.js (App Router, TypeScript, Tailwind) storefront for Organoli, built from the design handoff.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # regenerates data/catalog.json, then builds
npm run lint && npm run typecheck
```

## Data

- `data/products.json` — raw export from the WooCommerce Store API (`scrape_products.py`).
- `scripts/build-catalog.mjs` — normalises it into `data/catalog.json`: brand, clean name, count, dose, spec line, format, ingredient form, 8 shop categories, 10 goals and dietary flags (all derived from the source data). Runs automatically before `next build`; run `npm run catalog` after replacing `products.json`.
- `lib/catalog.ts` — the only module that reads the catalogue. Swap its loader for a database client later; pages don't change.

## Editorial content (`content/`)

| File | What it holds |
|---|---|
| `site.ts` | Contact details, WhatsApp, pharmacist, delivery zones. **Placeholders from the design — replace before launch.** |
| `merchandising.ts` | Best sellers, pharmacist picks, hero product, homepage chips (sample curation). |
| `editorial.ts` | The edits, trust points, curation steps, featured brands, articles, per-category pharmacist notes. |
| `products.ts` | Pharmacist-written product content (why we chose it, authorised claims, how to take, supplement facts, suits / not for). Product-page sections appear only when filled in. |

## Notes

- Cart and wishlist persist to `localStorage`. Checkout sends the order to WhatsApp (cash on delivery) until a payment provider is connected.
- Product images load from `organoli.com/wp-content/uploads` through `next/image`.
- Newsletter signups POST to `/api/newsletter`; set `NEWSLETTER_WEBHOOK_URL` to forward them to your email tool.

## Environment variables (optional)

| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, e.g. `https://organoli.com` |
| `NEWSLETTER_WEBHOOK_URL` | Endpoint that receives `{ email }` for newsletter signups |
