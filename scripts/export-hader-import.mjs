// Exports the current catalogue as a hader.ai product import file.
//   npm run hader:export  →  data/hader/organoli-products.csv
//
// Upload it in hader: Catalog → Import → Products (CSV). Columns use hader's own
// template labels, so they map automatically:
//   SKU, Name, Short description, Description, Price, Currency, Available,
//   Stock, Category slug, Image URLs
//
// Mapping decisions
// - SKU = the website slug, so hader and the website refer to a product by the
//   same key (the WooCommerce export had no SKUs).
// - Name = the full original name, e.g. "Zinc Glycinate (Now), 120 softgels".
//   The website derives brand, count and dose from it, and the bot matches on it.
// - Price is in cents (hader stores minor units); $0 products are left blank so
//   they can be priced in hader.
// - Category slug = the website's primary category (8 groups). hader creates
//   missing categories automatically — rename them in hader afterwards.
// - Image URLs = up to 6 photos from organoli.com (hader's import limit).
// - Brand / goals / dietary / format can't be imported (hader's import has no
//   attributes column), so the website keeps deriving them itself.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { products } = JSON.parse(readFileSync(join(root, "data/catalog.json"), "utf8"));

const HEADERS = ["SKU", "Name", "Short description", "Description", "Price", "Currency", "Available", "Stock", "Category slug", "Image URLs"];

const cell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const rows = products.map((p) => [
  p.slug,
  p.fullName,
  p.shortDescription ?? "",
  p.description ?? "",
  p.price > 0 ? Math.round(p.price * 100) : "",
  p.currency ?? "USD",
  p.stock === "out" ? "false" : "true",
  "",
  p.category,
  p.images.slice(0, 6).map((i) => i.src).join(", "),
]);

const out = join(root, "data/hader/organoli-products.csv");
mkdirSync(dirname(out), { recursive: true });
// BOM so Excel opens the UTF-8 file correctly (Arabic/accents, "–", "’").
writeFileSync(out, "﻿" + [HEADERS, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n");

const priced = rows.filter((r) => r[4] !== "").length;
console.log(`Wrote ${rows.length} products to ${out}`);
console.log(`  ${priced} priced · ${rows.length - priced} without a price · ${rows.filter((r) => r[6] === "true").length} available`);
