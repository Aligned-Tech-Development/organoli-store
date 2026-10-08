// Server-side data access. Today the source is data/catalog.json (generated from
// the WooCommerce export); swap the loader below for a database client later and
// the rest of the app stays the same.
import catalogJson from "@/data/catalog.json";
import { bestSellers, newArrivalCount, pharmacistPicks } from "@/content/merchandising";
import { CATEGORIES, CATEGORY_BY_SLUG, GOALS, GOAL_BY_SLUG } from "./taxonomy";
import { FILTER_KEYS, matches, sortProducts, type FilterKey, type Filters } from "./filters";
import type { Badge, Brand, CardProduct, CategorySlug, GoalSlug, Product } from "./types";

const catalog = catalogJson as unknown as { products: Product[]; brands: Brand[] };

const products = catalog.products;
const bySlug = new Map(products.map((p) => [p.slug, p]));

const newSlugs = new Set(
  [...products]
    .filter((p) => p.stock !== "out")
    .sort((a, b) => b.id - a.id)
    .slice(0, newArrivalCount)
    .map((p) => p.slug),
);

export function badgeFor(slug: string): Badge | null {
  if (pharmacistPicks.includes(slug)) return "Pharmacist pick";
  if (bestSellers.includes(slug)) return "Best seller";
  if (newSlugs.has(slug)) return "New";
  return null;
}

/** Merchandising rank used by "Recommended" sort. */
function rank(p: Product) {
  let r = 0;
  if (pharmacistPicks.includes(p.slug)) r += 30;
  if (bestSellers.includes(p.slug)) r += 20;
  if (p.images.length > 1) r += 2;
  if (p.purpose) r += 2;
  if (p.price > 0) r += 5;
  return r;
}

export const getProducts = () => products;
export const getProduct = (slug: string) => bySlug.get(slug) ?? null;
export const getBrands = () => catalog.brands;
export const getBrand = (slug: string) => catalog.brands.find((b) => b.slug === slug) ?? null;

export function toCard(p: Product): CardProduct {
  return {
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    purpose: p.purpose,
    specLine: p.specLine,
    price: p.price,
    stock: p.stock,
    image: p.images[0] ?? null,
    image2: p.images[1] ?? null,
    badge: badgeFor(p.slug),
  };
}

export const cardsFor = (slugs: string[]) =>
  slugs.map((s) => bySlug.get(s)).filter((p): p is Product => !!p).map(toCard);

export function newArrivals(n = 6) {
  return [...products].filter((p) => p.stock !== "out" && p.price > 0).sort((a, b) => b.id - a.id).slice(0, n).map(toCard);
}

export function inCategory(slug: CategorySlug) {
  return products.filter((p) => p.categories.includes(slug));
}

export function categoryCounts() {
  return CATEGORIES.map((c) => {
    const items = inCategory(c.slug);
    const cover = sortProducts(items.filter((p) => p.images.length), "rec", rank)[0];
    return { ...c, count: items.length, image: cover?.images[0] ?? null };
  });
}

export function goalCounts() {
  return GOALS.map((g) => {
    const items = products.filter((p) => p.goals.includes(g.slug));
    const cover = sortProducts(items.filter((p) => p.images.length), "rec", rank)[0];
    return { ...g, count: items.length, image: cover?.images[0] ?? null };
  });
}

export function recommended(list: Product[], n: number) {
  return sortProducts(list.filter((p) => p.price > 0), "rec", rank).slice(0, n);
}

// ---------- shop listing ----------

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export function listProducts(base: Product[], f: Filters) {
  const results = sortProducts(
    base.filter((p) => matches(p, f)),
    f.sort,
    rank,
  );
  // Facet counts respect every other active filter, so numbers stay honest.
  const facet = (key: FilterKey, values: (p: Product) => (string | null)[], label: (v: string) => string = (v) => v): FacetOption[] => {
    const pool = base.filter((p) => matches(p, f, key));
    const counts = new Map<string, number>();
    for (const p of pool) for (const v of values(p)) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    // keep selected values visible even at zero
    for (const v of f[key]) if (!counts.has(v)) counts.set(v, 0);
    return [...counts.entries()].map(([value, count]) => ({ value, label: label(value), count }));
  };
  const byCount = (a: FacetOption, b: FacetOption) => b.count - a.count || a.label.localeCompare(b.label);
  const brandName = new Map(catalog.brands.map((b) => [b.slug, b.name]));
  const facets: Record<FilterKey, FacetOption[]> = {
    goal: facet("goal", (p) => p.goals, (v) => GOAL_BY_SLUG[v as GoalSlug]?.name ?? v).sort(byCount),
    brand: facet("brand", (p) => [p.brandSlug], (v) => brandName.get(v) ?? v).sort(byCount),
    form: facet("form", (p) => [p.form]).sort(byCount),
    diet: facet("diet", (p) => p.dietary).sort(byCount),
    format: facet("format", (p) => [p.format]).sort(byCount),
  };
  const priceRange = base.length ? { min: Math.min(...base.map((p) => p.price).filter((x) => x > 0)), max: Math.max(...base.map((p) => p.price)) } : { min: 0, max: 0 };
  return { results, facets, priceRange };
}

export const filterLabel = (key: FilterKey, value: string) => {
  if (key === "goal") return GOAL_BY_SLUG[value as GoalSlug]?.name ?? value;
  if (key === "brand") return getBrand(value)?.name ?? value;
  return value;
};

export { FILTER_KEYS };

// ---------- search ----------

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "");

const index = products.map((p) => ({
  p,
  name: norm(p.name),
  brand: norm(p.brand ?? ""),
  ingredients: norm(p.ingredients.join(" ")),
  meta: norm(
    [
      p.form,
      p.format,
      ...p.dietary,
      ...p.goals.map((g) => GOAL_BY_SLUG[g].name),
      ...p.categories.map((c) => CATEGORY_BY_SLUG[c].name),
      ...p.sourceCategories,
    ]
      .filter(Boolean)
      .join(" "),
  ),
  text: norm(`${p.purpose ?? ""} ${p.shortDescription ?? ""} ${p.description ?? ""}`),
}));

export function searchProducts(q: string): Product[] {
  const tokens = norm(q).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const scored: { p: Product; s: number }[] = [];
  for (const row of index) {
    let total = 0;
    let ok = true;
    for (const t of tokens) {
      const re = new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      let s = 0;
      if (re.test(row.name)) s = row.name.startsWith(t) ? 12 : 10;
      else if (re.test(row.brand)) s = 8;
      else if (re.test(row.ingredients)) s = 7;
      else if (re.test(row.meta)) s = 5;
      else if (re.test(row.text)) s = 2;
      if (!s) {
        ok = false;
        break;
      }
      total += s;
    }
    if (ok) scored.push({ p: row.p, s: total + (row.p.stock === "out" ? 0 : 3) + rank(row.p) / 10 });
  }
  return scored.sort((a, b) => b.s - a.s).map((x) => x.p);
}

/** Predictive search payload for the header dropdown and /api/search. */
export function predictive(q: string) {
  const nq = norm(q.trim());
  const results = searchProducts(q);
  const terms = new Map<string, number>();
  const addTerm = (t: string) => {
    const k = norm(t).replace(/\s+/g, " ").trim();
    if (k.startsWith(nq) && k !== nq && k.length < 40) terms.set(k, (terms.get(k) ?? 0) + 1);
  };
  for (const p of products) {
    addTerm(p.name.replace(/,.*$/, ""));
    p.ingredients.forEach(addTerm);
    if (p.form && p.ingredients[0]) addTerm(`${p.ingredients[0]} ${p.form}`);
  }
  GOALS.forEach((g) => addTerm(g.name));
  const suggestions = [...terms.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).slice(0, 4).map(([t]) => t);

  const catCounts = new Map<CategorySlug, number>();
  const goalSet = new Map<GoalSlug, number>();
  const brandSet = new Map<string, { name: string; slug: string; n: number }>();
  for (const p of results) {
    p.categories.forEach((c) => catCounts.set(c, (catCounts.get(c) ?? 0) + 1));
    p.goals.forEach((g) => goalSet.set(g, (goalSet.get(g) ?? 0) + 1));
    if (p.brand && p.brandSlug) {
      const b = brandSet.get(p.brandSlug) ?? { name: p.brand, slug: p.brandSlug, n: 0 };
      b.n++;
      brandSet.set(p.brandSlug, b);
    }
  }
  return {
    query: q,
    total: results.length,
    suggestions,
    categories: [...catCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([slug, count]) => ({ slug, name: CATEGORY_BY_SLUG[slug].name, count })),
    brands: [...brandSet.values()].sort((a, b) => b.n - a.n).slice(0, 4).map(({ name, slug }) => ({ name, slug })),
    goals: [...goalSet.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([slug]) => ({ slug, name: GOAL_BY_SLUG[slug].name })),
    products: results.slice(0, 4).map(toCard),
  };
}

export type Predictive = ReturnType<typeof predictive>;

// ---------- product page helpers ----------

export function relatedProducts(p: Product, n = 4) {
  const pool = products.filter((x) => x.slug !== p.slug && x.price > 0 && x.stock !== "out");
  const score = (x: Product) =>
    x.goals.filter((g) => p.goals.includes(g)).length * 3 +
    (x.category === p.category ? 2 : 0) -
    (x.ingredients.some((i) => p.ingredients.includes(i)) ? 4 : 0) +
    rank(x) / 20;
  return [...pool].sort((a, b) => score(b) - score(a)).slice(0, n);
}

/** Other products built on the same main ingredient — the "Compare forms" table. */
export function compareSet(p: Product, n = 4) {
  const main = p.ingredients[0];
  if (!main) return [];
  const others = products.filter((x) => x.slug !== p.slug && x.ingredients[0] === main);
  if (others.length < 2) return [];
  return [p, ...sortProducts(others, "rec", rank).slice(0, n - 1)];
}

export const mainIngredient = (p: Product) => p.ingredients[0] ?? null;

export const totalCounts = () => ({ products: products.length, brands: catalog.brands.length, inStock: products.filter((p) => p.stock !== "out").length });

export { FILTER_KEYS as filterKeys };
export type { Filters };
