// Normalises the WooCommerce export (data/products.json) into data/catalog.json —
// the website's built-in catalogue. It is the fallback when hader.ai is not
// configured or unreachable, and it supplies extra photos and dietary tags for
// products that hader returns with less detail. Run with `npm run catalog`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { clean, normalizeProducts, type RawProduct } from "../lib/normalize.ts";

interface WooProduct {
  id: number;
  slug: string;
  name: string;
  permalink: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  is_in_stock: boolean;
  prices: { price: string; regular_price: string; currency_code: string; currency_minor_unit?: number };
  images: { src: string; alt: string }[];
  categories: { slug: string; name: string }[];
  tags: { name: string }[];
  brands?: { name: string }[];
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const woo = JSON.parse(readFileSync(join(root, "data/products.json"), "utf8")) as WooProduct[];

const raws: RawProduct[] = woo.map((p) => {
  const unit = 10 ** (p.prices.currency_minor_unit ?? 0);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brands?.[0]?.name ?? null,
    shortDescription: p.short_description,
    description: p.description,
    price: Number(p.prices.price) / unit,
    compareAt: p.on_sale ? Number(p.prices.regular_price) / unit : null,
    currency: p.prices.currency_code,
    inStock: p.is_in_stock,
    images: p.images,
    sourceCategories: p.categories.map((c) => ({ slug: c.slug, name: clean(c.name) })),
    tags: p.tags.map((t) => t.name),
    permalink: p.permalink,
  };
});

const { products, brands } = normalizeProducts(raws);
writeFileSync(join(root, "data/catalog.json"), JSON.stringify({ generatedAt: new Date().toISOString(), products, brands }));

const count = (k: keyof (typeof products)[number]) => products.filter((p) => p[k]).length;
console.log(`catalog: ${products.length} products, ${brands.length} brands`);
console.log(`  brand ${count("brand")} · spec ${count("specLine")} · purpose ${count("purpose")} · format ${count("format")} · dose ${count("dose")} · in stock ${products.filter((p) => p.stock === "in").length}`);
