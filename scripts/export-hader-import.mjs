// Exports the current catalogue as hader.ai product import files.
//   npm run hader:export  →  data/hader/organoli-products.csv            (priced products)
//                            data/hader/organoli-products-no-price.csv   (products without a price)
//
// Upload both in hader: Catalog → Import → Products (CSV). Columns use hader's own
// template labels, so they map automatically:
//   SKU, Name, Short description, Description, Price, Currency, Available,
//   Category slug, Image URLs
//
// Mapping decisions
// - SKU = the website slug, so hader and the website refer to a product by the
//   same key (the WooCommerce export had no SKUs). Re-importing updates by SKU.
// - Name = the full original name, e.g. "Zinc Glycinate (Now), 120 softgels".
//   The website derives brand, count and dose from it, and the bot matches on it.
// - Price is in cents (hader stores minor units).
// - hader rejects EMPTY numeric cells ("Invalid input"), so there is no Stock
//   column, and unpriced products go in a second file with no Price column.
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

const HEADERS = ["SKU", "Name", "Short description", "Description", "Price", "Currency", "Available", "Category slug", "Image URLs"];

const cell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const row = (p) => ({
  SKU: p.slug,
  Name: p.fullName,
  "Short description": p.shortDescription ?? "",
  Description: p.description ?? "",
  Price: Math.round(p.price * 100),
  Currency: p.currency ?? "USD",
  Available: p.stock === "out" ? "false" : "true",
  "Category slug": p.category,
  "Image URLs": p.images.slice(0, 6).map((i) => i.src).join(", "),
});

function write(file, headers, items) {
  const out = join(root, "data/hader", file);
  mkdirSync(dirname(out), { recursive: true });
  const lines = [headers, ...items.map((p) => headers.map((h) => row(p)[h]))].map((r) => r.map(cell).join(","));
  // BOM so Excel opens the UTF-8 file correctly ("–", "’", accents).
  writeFileSync(out, "﻿" + lines.join("\r\n") + "\r\n");
  return out;
}

const priced = products.filter((p) => p.price > 0);
const unpriced = products.filter((p) => !(p.price > 0));
console.log(`Wrote ${priced.length} priced products → ${write("organoli-products.csv", HEADERS, priced)}`);
console.log(`Wrote ${unpriced.length} products without a price → ${write("organoli-products-no-price.csv", HEADERS.filter((h) => h !== "Price"), unpriced)}`);
console.log(`  ${products.filter((p) => p.stock !== "out").length} of ${products.length} marked available`);
