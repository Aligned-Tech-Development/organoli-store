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
import { CATEGORY_SLUGS, normalizeProducts, slugify, type RawProduct } from "./normalize";
import type { Brand, Product } from "./types";

export const CATALOG_TAG = "hader-catalog";
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

async function fetchGroup(base: string, key: string, category: string, available: boolean): Promise<ReadApiProduct[]> {
  // Accept either the API host ("https://api.example.com") or a base that already ends in /api/v1.
  const root = /\/api\/v1$/.test(base) ? base : `${base}/api/v1`;
  const url = `${root}/read/products?category=${encodeURIComponent(category)}&available=${available}&limit=100`;
  const res = await fetch(url, {
    headers: { "X-Aligned-Api-Key": key, Accept: "application/json" },
    next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
  });
  if (!res.ok) throw new Error(`hader ${res.status} for ${category}/${available}: ${(await res.text()).slice(0, 200)}`);
  const body = (await res.json()) as { data: ReadApiProduct[] };
  if (body.data.length >= 100) console.warn(`[hader] ${category} (${available ? "available" : "unavailable"}) returned 100 products — some may be missing until hader paginates.`);
  return body.data;
}

/**
 * Live products from hader, merged with the built-in catalogue for detail hader
 * doesn't expose yet (extra photos, dietary tags, original ids for "New" ordering).
 * Returns null when hader isn't configured or can't be reached.
 */
export async function loadHaderCatalog(builtIn: Product[]): Promise<{ products: Product[]; brands: Brand[] } | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const groups = await Promise.all(
      CATEGORY_SLUGS.flatMap((category) => [true, false].map(async (available) => ({ category, rows: await fetchGroup(cfg.url, cfg.key, category, available) }))),
    );
    const known = new Map(builtIn.map((p) => [p.slug, p]));
    const seen = new Set<string>();
    const raws: RawProduct[] = [];
    let newIndex = 0;

    for (const { category, rows } of groups) {
      for (const r of rows) {
        if (seen.has(r.id)) continue;
        seen.add(r.id);
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
          images: r.imageUrl ? [{ src: r.imageUrl, alt: r.name }, ...extraPhotos] : (prev?.images ?? []),
          sourceCategories: [
            ...(prev?.sourceCategories ?? []).map((name) => ({ slug: slugify(name), name })),
            { slug: category, name: r.categoryName ?? category },
          ],
          dietary: prev?.dietary ?? null,
          categoryHint: category,
          permalink: prev?.permalink ?? null,
        });
      }
    }
    if (!raws.length) {
      console.warn("[hader] catalogue came back empty — using the built-in catalogue.");
      return null;
    }
    return normalizeProducts(raws);
  } catch (e) {
    console.error("[hader] catalogue fetch failed — using the built-in catalogue.", e);
    return null;
  }
}
