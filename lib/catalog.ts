// Server-side catalogue access.
//
// `getCatalog()` returns the live catalogue: products from the Organoli tenant
// in hader.ai when HADER_API_URL / HADER_API_KEY are set (refreshed every few
// minutes and instantly on hader's product webhooks), otherwise the built-in
// data/catalog.json. Everything else on the site goes through this object.
import { cache } from "react";
import catalogJson from "@/data/catalog.json";
import { bestSellers, newArrivalCount, pharmacistPicks } from "@/content/merchandising";
import { CATEGORIES, CATEGORY_BY_SLUG, GOALS, GOAL_BY_SLUG } from "./taxonomy";
import { FILTER_KEYS, matches, sortProducts, type FilterKey, type Filters } from "./filters";
import { loadHaderCatalog } from "./hader";
import type { Badge, Brand, CardProduct, CategorySlug, GoalSlug, Product } from "./types";

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, "");

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

export class Catalog {
  readonly products: Product[];
  readonly brands: Brand[];
  readonly source: "hader" | "built-in";
  private bySlug: Map<string, Product>;
  private newSlugs: Set<string>;
  private searchIndex: { p: Product; name: string; brand: string; ingredients: string; meta: string; text: string }[];

  constructor(products: Product[], brands: Brand[], source: "hader" | "built-in") {
    this.products = products;
    this.brands = brands;
    this.source = source;
    this.bySlug = new Map(products.map((p) => [p.slug, p]));
    this.newSlugs = new Set(
      [...products]
        .filter((p) => p.stock !== "out")
        .sort((a, b) => b.id - a.id)
        .slice(0, newArrivalCount)
        .map((p) => p.slug),
    );
    this.searchIndex = products.map((p) => ({
      p,
      name: norm(p.name),
      brand: norm(p.brand ?? ""),
      ingredients: norm(p.ingredients.join(" ")),
      meta: norm(
        [p.form, p.format, ...p.dietary, ...p.goals.map((g) => GOAL_BY_SLUG[g].name), ...p.categories.map((c) => CATEGORY_BY_SLUG[c].name), ...p.sourceCategories]
          .filter(Boolean)
          .join(" "),
      ),
      text: norm(`${p.purpose ?? ""} ${p.shortDescription ?? ""} ${p.description ?? ""}`),
    }));
  }

  // ---------- lookups ----------
  getProducts = () => this.products;
  getProduct = (slug: string) => this.bySlug.get(slug) ?? null;
  getBrands = () => this.brands;
  getBrand = (slug: string) => this.brands.find((b) => b.slug === slug) ?? null;
  inCategory = (slug: CategorySlug) => this.products.filter((p) => p.categories.includes(slug));
  totalCounts = () => ({ products: this.products.length, brands: this.brands.length, inStock: this.products.filter((p) => p.stock !== "out").length });

  badgeFor = (slug: string): Badge | null => {
    if (pharmacistPicks.includes(slug)) return "Pharmacist pick";
    if (bestSellers.includes(slug)) return "Best seller";
    if (this.newSlugs.has(slug)) return "New";
    return null;
  };

  toCard = (p: Product): CardProduct => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    purpose: p.purpose,
    specLine: p.specLine,
    price: p.price,
    stock: p.stock,
    image: p.images[0] ?? null,
    image2: p.images[1] ?? null,
    badge: this.badgeFor(p.slug),
  });

  cardsFor = (slugs: string[]) =>
    slugs
      .map((s) => this.bySlug.get(s))
      .filter((p): p is Product => !!p)
      .map(this.toCard);

  newArrivals = (n = 6) =>
    [...this.products]
      .filter((p) => p.stock !== "out" && p.price > 0)
      .sort((a, b) => b.id - a.id)
      .slice(0, n)
      .map(this.toCard);

  recommended = (list: Product[], n: number) => sortProducts(list.filter((p) => p.price > 0), "rec", rank).slice(0, n);

  categoryCounts = () =>
    CATEGORIES.map((c) => {
      const items = this.inCategory(c.slug);
      const cover = sortProducts(items.filter((p) => p.images.length), "rec", rank)[0];
      return { ...c, count: items.length, image: cover?.images[0] ?? null };
    });

  goalCounts = () =>
    GOALS.map((g) => {
      const items = this.products.filter((p) => p.goals.includes(g.slug));
      const cover = sortProducts(items.filter((p) => p.images.length), "rec", rank)[0];
      return { ...g, count: items.length, cover: cover?.images[0] ?? null };
    });

  // ---------- shop listing ----------
  listProducts = (base: Product[], f: Filters) => {
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
    const brandName = new Map(this.brands.map((b) => [b.slug, b.name]));
    const facets: Record<FilterKey, FacetOption[]> = {
      goal: facet("goal", (p) => p.goals, (v) => GOAL_BY_SLUG[v as GoalSlug]?.name ?? v).sort(byCount),
      brand: facet("brand", (p) => [p.brandSlug], (v) => brandName.get(v) ?? v).sort(byCount),
      form: facet("form", (p) => [p.form]).sort(byCount),
      diet: facet("diet", (p) => p.dietary).sort(byCount),
      format: facet("format", (p) => [p.format]).sort(byCount),
    };
    return { results, facets };
  };

  filterLabel = (key: FilterKey, value: string) => {
    if (key === "goal") return GOAL_BY_SLUG[value as GoalSlug]?.name ?? value;
    if (key === "brand") return this.getBrand(value)?.name ?? value;
    return value;
  };

  // ---------- search ----------
  searchProducts = (q: string): Product[] => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return [];
    const scored: { p: Product; s: number }[] = [];
    for (const row of this.searchIndex) {
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
  };

  /** Predictive search payload for the header dropdown and /api/search. */
  predictive = (q: string) => {
    const nq = norm(q.trim());
    const results = this.searchProducts(q);
    const terms = new Map<string, number>();
    const addTerm = (t: string) => {
      const k = norm(t).replace(/\s+/g, " ").trim();
      if (k.startsWith(nq) && k !== nq && k.length < 40) terms.set(k, (terms.get(k) ?? 0) + 1);
    };
    for (const p of this.products) {
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
      products: results.slice(0, 4).map(this.toCard),
    };
  };

  // ---------- product page ----------
  relatedProducts = (p: Product, n = 4) => {
    const pool = this.products.filter((x) => x.slug !== p.slug && x.price > 0 && x.stock !== "out");
    const score = (x: Product) =>
      x.goals.filter((g) => p.goals.includes(g)).length * 3 +
      (x.category === p.category ? 2 : 0) -
      (x.ingredients.some((i) => p.ingredients.includes(i)) ? 4 : 0) +
      rank(x) / 20;
    return [...pool].sort((a, b) => score(b) - score(a)).slice(0, n);
  };

  /** Other products built on the same main ingredient — the "Compare" table. */
  compareSet = (p: Product, n = 4) => {
    const main = p.ingredients[0];
    if (!main) return [];
    const others = this.products.filter((x) => x.slug !== p.slug && x.ingredients[0] === main);
    if (others.length < 2) return [];
    return [p, ...sortProducts(others, "rec", rank).slice(0, n - 1)];
  };
}

export type Predictive = ReturnType<Catalog["predictive"]>;

const builtIn = catalogJson as unknown as { products: Product[]; brands: Brand[] };
const builtInCatalog = new Catalog(builtIn.products, builtIn.brands, "built-in");

/** The built-in catalogue, keyed by slug — used to enrich hader products with extra photos and dietary tags. */
export const builtInProducts = () => builtIn.products;

/** The live catalogue for this request. Never throws: falls back to the built-in data. */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const live = await loadHaderCatalog(builtIn.products);
  return live ? new Catalog(live.products, live.brands, "hader") : builtInCatalog;
});

export { FILTER_KEYS };
