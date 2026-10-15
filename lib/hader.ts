// Reads the Organoli product catalogue from hader.ai's storefront API
// (GET /api/v1/storefront/products, scope `read:storefront`; see
// docs/HADER-INTEGRATION-SPEC.md §3): every product with all its images, paged
// with a cursor, hidden ("not visible to customers") products left out.
//
// Results are cached under CATALOG_TAG for 5 minutes and dropped immediately
// when hader's product webhooks hit /api/hader/webhook.
//
// A sync that fails or shrinks suddenly is never shown: the site keeps serving
// the last good catalogue saved in Neon (lib/catalogSnapshot.ts), and
// /api/health/catalog raises the alarm.
import { createHash } from "node:crypto";
import { readSnapshot, writeSnapshot } from "./catalogSnapshot";
import { CATEGORY_SLUGS, normalizeProducts, slugify, type RawProduct } from "./normalize";
import type { Brand, Product } from "./types";

/** A sync result we refuse to show. */
export class SyncError extends Error {}

/** More than this share of products disappearing at once is treated as a broken sync, not a real edit. */
const MAX_DROP = 0.2;
const PAGE_SIZE = 200;
const MAX_PAGES = 50; // 10,000 products — a guard against a cursor that never ends

export const CATALOG_TAG = "hader-catalog";
export const CATALOG_REVALIDATE_SECONDS = 300;

interface StorefrontProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  priceMinor: number | null;
  compareAtMinor: number | null;
  currency: string;
  isAvailable: boolean;
  isPublished?: boolean;
  category: { slug: string; name: string } | null;
  /** Primary first. URLs are permanent: they redirect to a fresh signed storage link. */
  images: { url: string; alt: string | null; isPrimary: boolean }[];
  deletedAt: string | null;
}

const config = () => {
  const url = process.env.HADER_API_URL?.replace(/\/+$/, "");
  const key = process.env.HADER_API_KEY;
  return url && key ? { url, key } : null;
};

export const haderConfigured = () => config() !== null;

// Currencies whose minor unit is 1/1000 (hader stores prices in minor units).
const THOUSANDTHS = new Set(["KWD", "BHD", "OMR", "JOD", "TND", "IQD", "LYD"]);
const fromMinor = (minor: number | null, currency: string) => (minor == null ? 0 : minor / (THOUSANDTHS.has(currency) ? 1000 : 100));

/** Every page of /storefront/products. `extra` adds query params (e.g. updatedSince). */
async function fetchAll(cfg: { url: string; key: string }, fresh: boolean, extra = ""): Promise<StorefrontProduct[]> {
  // Accept either the API host ("https://api.example.com") or a base that already ends in /api/v1.
  const root = /\/api\/v1$/.test(cfg.url) ? cfg.url : `${cfg.url}/api/v1`;
  const rows: StorefrontProduct[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = `${root}/storefront/products?limit=${PAGE_SIZE}${extra}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const res = await fetch(url, {
      headers: { "X-Aligned-Api-Key": cfg.key, Accept: "application/json" },
      ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] } }),
      signal: AbortSignal.timeout(15_000),
    }).catch((e: Error) => {
      throw new SyncError(`couldn't reach hader (${e.name === "TimeoutError" ? "no answer within 15 s" : e.message}${e.cause instanceof Error ? `: ${e.cause.message}` : ""})`);
    });
    if (!res.ok) throw new SyncError(`hader answered ${res.status} on page ${page + 1}: ${(await res.text()).slice(0, 200)}`);
    const body = (await res.json()) as { data: StorefrontProduct[]; nextCursor: string | null };
    if (!Array.isArray(body.data)) throw new SyncError(`hader returned no product list on page ${page + 1}`);
    rows.push(...body.data);
    cursor = body.nextCursor;
    if (!cursor) return rows;
  }
  throw new SyncError(`hader's product list didn't end after ${MAX_PAGES} pages`);
}

/** Fetches the published catalogue from hader as raw products. Throws SyncError on anything we wouldn't show. */
export async function fetchHaderRaws(builtIn: Product[], { fresh = false } = {}): Promise<{ raws: RawProduct[]; imageUrls: [string, string][] }> {
  const cfg = config();
  if (!cfg) throw new SyncError("HADER_API_URL / HADER_API_KEY are not set");
  const rows = await fetchAll(cfg, fresh);
  // Products imported from the old site keep their original id (for "New" ordering) and dietary tags.
  const known = new Map(builtIn.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  const raws: RawProduct[] = [];
  let newIndex = 0;

  for (const r of rows) {
    if (seen.has(r.id) || r.deletedAt || r.isPublished === false) continue;
    seen.add(r.id);
    // SKU = website slug for imported products; products created in hader use hader's slug.
    const prev = known.get(r.sku.toLowerCase());
    const slug = prev?.slug ?? (r.slug || slugify(r.sku));
    const category = CATEGORY_SLUGS.find((c) => c === r.category?.slug) ?? null;
    raws.push({
      id: prev?.id ?? 1_000_000_000 + newIndex++,
      slug,
      name: r.name,
      brand: prev?.brand ?? null,
      shortDescription: r.shortDescription,
      description: r.description,
      price: fromMinor(r.priceMinor, r.currency),
      compareAt: r.compareAtMinor ? fromMinor(r.compareAtMinor, r.currency) : null,
      currency: r.currency,
      inStock: r.isAvailable,
      // All photos come from hader now (primary first) — nothing loads from the old WordPress site.
      images: r.images.map((i) => ({ src: i.url, alt: i.alt || r.name })),
      sourceCategories: [
        ...(prev?.sourceCategories ?? []).map((name) => ({ slug: slugify(name), name })),
        ...(r.category ? [{ slug: r.category.slug, name: r.category.name }] : []),
      ],
      dietary: prev?.dietary ?? null,
      // hader's category decides where the product is listed (lib/normalize.ts). A category
      // outside the website's 8 falls back to rules on the name, so the product still shows.
      categoryHint: category,
      permalink: prev?.permalink ?? null,
    });
  }
  if (!raws.length) throw new SyncError("hader returned no products at all");
  return { raws, imageUrls: [] };
}

export const hashRaws = (raws: RawProduct[]) => createHash("sha1").update(JSON.stringify(raws)).digest("hex");

/**
 * Throws when the new catalogue is suspiciously smaller than the last good one.
 * Products the client hid on purpose ("not visible to customers") don't count as
 * missing, so hiding a batch of discontinued products isn't mistaken for a broken sync.
 */
export async function checkShrink(count: number, previous: number | null | undefined, { fresh = false } = {}) {
  if (!previous || count >= previous * (1 - MAX_DROP)) return;
  const cfg = config();
  let hidden = 0;
  if (cfg) {
    // updatedSince returns hidden products too (flagged isPublished: false) — count the ones not deleted.
    const everything = await fetchAll(cfg, fresh, `&updatedSince=${encodeURIComponent("1970-01-01T00:00:00.000Z")}`);
    hidden = everything.filter((p) => p.isPublished === false && !p.deletedAt).length;
  }
  if (count + hidden < previous * (1 - MAX_DROP))
    throw new SyncError(`hader returned ${count} products (plus ${hidden} hidden), down from ${previous} — more than ${MAX_DROP * 100}% gone at once, treated as a broken sync.`);
}

// Saved hash per server instance, so the snapshot is written once per change, not on every request.
let savedHash: string | null = null;

type Loaded = { products: Product[]; brands: Brand[]; imageUrls: Map<string, string>; stale: boolean };
const build = (raws: RawProduct[], imageUrls: [string, string][], stale: boolean): Loaded => ({ ...normalizeProducts(raws), imageUrls: new Map(imageUrls), stale });

/**
 * Live products from hader, merged with the built-in catalogue for detail hader
 * doesn't expose yet (dietary tags, original ids for "New" ordering).
 * If hader fails, serves the last good catalogue; null only when there has never
 * been one (the caller then uses the built-in catalogue).
 */
export async function loadHaderCatalog(builtIn: Product[]): Promise<Loaded | null> {
  if (!config()) return null;
  try {
    const { raws, imageUrls } = await fetchHaderRaws(builtIn);
    const hash = hashRaws(raws);
    if (hash !== savedHash) {
      try {
        const snap = await readSnapshot();
        if (snap?.hash !== hash) {
          await checkShrink(raws.length, snap?.count);
          await writeSnapshot({ raws, imageUrls, count: raws.length, hash });
        }
        savedHash = hash;
      } catch (e) {
        if (e instanceof SyncError) throw e;
        console.error("[hader] couldn't save the catalogue snapshot", e); // still serve the live data
      }
    }
    return build(raws, imageUrls, false);
  } catch (e) {
    console.error("[hader] sync failed — serving the last good catalogue.", e);
    try {
      const snap = await readSnapshot();
      if (snap) return build(snap.raws, snap.imageUrls, true);
    } catch (e2) {
      console.error("[hader] no snapshot available", e2);
    }
    return null;
  }
}
