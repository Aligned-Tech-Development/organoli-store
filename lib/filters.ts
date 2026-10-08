// Shop filters live in the URL: ?goal=sleep,stress&diet=Vegan&format=Capsule&stock=1&sort=lo
// This module is shared by server pages (to filter) and client controls (to build URLs).

export const FILTER_KEYS = ["goal", "brand", "form", "diet", "format"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Sort = "rec" | "lo" | "hi" | "new";

export interface Filters {
  goal: string[];
  brand: string[];
  form: string[];
  diet: string[];
  format: string[];
  stock: boolean;
  sort: Sort;
  min: number | null;
  max: number | null;
}

type RawParams = Record<string, string | string[] | undefined>;

const list = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v.join(",") : v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export function parseFilters(sp: RawParams): Filters {
  const sort = (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) as Sort | undefined;
  return {
    goal: list(sp.goal),
    brand: list(sp.brand),
    form: list(sp.form),
    diet: list(sp.diet),
    format: list(sp.format),
    stock: sp.stock === "1",
    sort: sort && ["rec", "lo", "hi", "new"].includes(sort) ? sort : "rec",
    min: num(sp.min),
    max: num(sp.max),
  };
}

export function filtersToSearch(f: Filters, extra: Record<string, string> = {}): string {
  const p = new URLSearchParams();
  for (const k of FILTER_KEYS) if (f[k].length) p.set(k, f[k].join(","));
  if (f.stock) p.set("stock", "1");
  if (f.min != null) p.set("min", String(f.min));
  if (f.max != null) p.set("max", String(f.max));
  if (f.sort !== "rec") p.set("sort", f.sort);
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function toggleValue(f: Filters, key: FilterKey, value: string): Filters {
  const cur = f[key];
  return { ...f, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
}

export const emptyFilters = (sort: Sort = "rec"): Filters => ({ goal: [], brand: [], form: [], diet: [], format: [], stock: false, sort, min: null, max: null });

export const activeCount = (f: Filters) => FILTER_KEYS.reduce((a, k) => a + f[k].length, 0) + (f.stock ? 1 : 0) + (f.min != null ? 1 : 0) + (f.max != null ? 1 : 0);

/** The subset of product fields filtering needs — works for full products and slim client records. */
export interface Filterable {
  goals: string[];
  brandSlug: string | null;
  form: string | null;
  dietary: string[];
  format: string | null;
  stock: string;
  price: number;
  id: number;
}

export function matches(p: Filterable, f: Filters, ignore?: FilterKey): boolean {
  if (ignore !== "goal" && f.goal.length && !p.goals.some((g) => f.goal.includes(g))) return false;
  if (ignore !== "brand" && f.brand.length && !(p.brandSlug && f.brand.includes(p.brandSlug))) return false;
  if (ignore !== "form" && f.form.length && !(p.form && f.form.includes(p.form))) return false;
  if (ignore !== "diet" && f.diet.length && !f.diet.every((d) => p.dietary.includes(d))) return false;
  if (ignore !== "format" && f.format.length && !(p.format && f.format.includes(p.format))) return false;
  if (f.stock && p.stock === "out") return false;
  if (f.min != null && p.price < f.min) return false;
  if (f.max != null && p.price > f.max) return false;
  return true;
}

export function sortProducts<T extends Filterable>(items: T[], sort: Sort, rank?: (p: T) => number): T[] {
  const arr = [...items];
  const stockFirst = (a: T, b: T) => Number(a.stock === "out") - Number(b.stock === "out");
  if (sort === "lo") return arr.sort((a, b) => stockFirst(a, b) || a.price - b.price);
  if (sort === "hi") return arr.sort((a, b) => stockFirst(a, b) || b.price - a.price);
  if (sort === "new") return arr.sort((a, b) => stockFirst(a, b) || b.id - a.id);
  return arr.sort((a, b) => stockFirst(a, b) || (rank ? rank(b) - rank(a) : 0) || b.id - a.id);
}
