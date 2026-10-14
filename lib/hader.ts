// Reads the Organoli product catalogue from hader.ai's existing read API
// (GET /api/v1/read/products, scope `read:catalog`).
//
// That endpoint returns at most 100 products per call and doesn't paginate yet,
// so we ask for each shop category × availability separately — every one of
// those groups is well under 100. Products must therefore sit in one of the 8
// website categories in hader to appear. When hader ships the storefront
// endpoint in docs/HADER-INTEGRATION-SPEC.md §3, replace fetchGroup with it.
//
// Results are cached under CATALOG_TAG for 5 minutes and dropped immediately
// when hader's product webhooks hit /api/hader/webhook.
//
// A sync that fails, comes back truncated (a group at the 100 limit) or shrinks
// suddenly is never shown: the site keeps serving the last good catalogue saved
// in Neon (lib/catalogSnapshot.ts), and /api/health/catalog raises the alarm.
import { createHash } from "node:crypto";
import { readSnapshot, writeSnapshot } from "./catalogSnapshot";
import { CATEGORY_SLUGS, normalizeProducts, slugify, type RawProduct } from "./normalize";
import type { Brand, Product } from "./types";

/** A sync result we refuse to show. */
export class SyncError extends Error {}

/** More than this share of products disappearing at once is treated as a broken sync, not a real edit. */
const MAX_DROP = 0.2;

export const CATALOG_TAG = "hader-catalog";

/**
 * hader serves photos through signed storage links that expire after an hour, so
 * pages never embed them directly. Each photo gets a stable website URL
 * (/api/hader/img/<productId>?v=<photo id>) that redirects to the current signed
 * link; `v` changes when the photo is replaced in hader, so caches refresh too.
 */
const imagePath = (productId: string, signedUrl: string) => {
  const version = new URL(signedUrl).pathname.split("/").pop() ?? "1";
  return `/api/hader/img/${encodeURIComponent(productId)}?v=${encodeURIComponent(version)}`;
};
export const CATALOG_REVALIDATE_SECONDS = 300;

interface ReadApiProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  priceMinor: number | null;
  currency: string;
  available: boolean;
  categoryName: string | null;
  imageUrl: string | null;
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

async function fetchGroup(base: string, key: string, category: string, available: boolean, fresh: boolean): Promise<ReadApiProduct[]> {
  // Accept either the API host ("https://api.example.com") or a base that already ends in /api/v1.
  const root = /\/api\/v1$/.test(base) ? base : `${base}/api/v1`;
  const url = `${root}/read/products?category=${encodeURIComponent(category)}&available=${available}&limit=100`;
  const res = await fetch(url, {
    headers: { "X-Aligned-Api-Key": key, Accept: "application/json" },
    ...(fresh ? { cache: "no-store" as const } : { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] } }),
    signal: AbortSignal.timeout(15_000),
  }).catch((e: Error) => {
    throw new SyncError(`couldn't reach hader (${e.name === "TimeoutError" ? "no answer within 15 s" : e.message}${e.cause instanceof Error ? `: ${e.cause.message}` : ""})`);
  });
  if (!res.ok) throw new SyncError(`hader answered ${res.status} for ${category} (${available ? "available" : "unavailable"}): ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { data: ReadApiProduct[] };
  if (!Array.isArray(body.data)) throw new SyncError(`hader returned no product list for ${category}`);
  // The read API stops at 100 and can't page yet, so a full group means products are missing.
  if (body.data.length >= 100) throw new SyncError(`${category} (${available ? "available" : "unavailable"}) hit hader's 100-product limit — products would be missing.`);
  return body.data;
}

/** Fetches every group from hader and turns it into raw products. Throws SyncError on anything we wouldn't show. */
export async function fetchHaderRaws(builtIn: Product[], { fresh = false } = {}): Promise<{ raws: RawProduct[]; imageUrls: [string, string][] }> {
  const cfg = config();
  if (!cfg) throw new SyncError("HADER_API_URL / HADER_API_KEY are not set");
  const groups = await Promise.all(
    CATEGORY_SLUGS.flatMap((category) => [true, false].map(async (available) => ({ category, rows: await fetchGroup(cfg.url, cfg.key, category, available, fresh) }))),
  );
  const known = new Map(builtIn.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  const raws: RawProduct[] = [];
  const imageUrls: [string, string][] = [];
  let newIndex = 0;

  for (const { category, rows } of groups) {
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      if (r.imageUrl) imageUrls.push([r.id, r.imageUrl]);
      // SKU = website slug for imported products; new hader products use hader's slug.
      const prev = known.get(r.sku.toLowerCase());
      const slug = prev?.slug ?? (r.slug || slugify(r.sku));
      const extraPhotos = prev?.images.slice(1) ?? [];
      raws.push({
        // Imported products keep their original id; products added in hader rank as newest.
        id: prev?.id ?? 1_000_000_000 + newIndex++,
        slug,
        name: r.name,
        brand: prev?.brand ?? null,
        shortDescription: r.shortDescription,
        description: r.description,
        price: fromMinor(r.priceMinor, r.currency),
        compareAt: prev?.compareAt ?? null,
        currency: r.currency,
        inStock: r.available,
        images: r.imageUrl ? [{ src: imagePath(r.id, r.imageUrl), alt: r.name }, ...extraPhotos] : (prev?.images ?? []),
        sourceCategories: [
          ...(prev?.sourceCategories ?? []).map((name) => ({ slug: slugify(name), name })),
          { slug: category, name: r.categoryName ?? category },
        ],
        dietary: prev?.dietary ?? null,
        // hader's category decides where the product is listed (lib/normalize.ts).
        categoryHint: category,
        permalink: prev?.permalink ?? null,
      });
    }
  }
  if (!raws.length) throw new SyncError("hader returned no products at all");
  return { raws, imageUrls };
}

export const hashRaws = (raws: RawProduct[]) => createHash("sha1").update(JSON.stringify(raws)).digest("hex");

/** Throws when the new catalogue is suspiciously smaller than the last good one. */
export function checkShrink(count: number, previous: number | null | undefined) {
  if (previous && count < previous * (1 - MAX_DROP))
    throw new SyncError(`hader returned ${count} products, down from ${previous} — more than ${MAX_DROP * 100}% gone at once, treated as a broken sync.`);
}

// Saved hash per server instance, so the snapshot is written once per change, not on every request.
let savedHash: string | null = null;

type Loaded = { products: Product[]; brands: Brand[]; imageUrls: Map<string, string>; stale: boolean };
const build = (raws: RawProduct[], imageUrls: [string, string][], stale: boolean): Loaded => ({ ...normalizeProducts(raws), imageUrls: new Map(imageUrls), stale });

/**
 * Live products from hader, merged with the built-in catalogue for detail hader
 * doesn't expose yet (extra photos, dietary tags, original ids for "New" ordering).
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
          checkShrink(raws.length, snap?.count);
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
