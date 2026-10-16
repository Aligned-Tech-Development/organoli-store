import Link from "next/link";
import { categoryNotes } from "@/content/editorial";
import { getCatalog, FILTER_KEYS } from "@/lib/catalog";
import { parseFilters } from "@/lib/filters";
import { CATEGORY_BY_SLUG, GOAL_BY_SLUG } from "@/lib/taxonomy";
import type { Brand, CategorySlug, GoalSlug, Product } from "@/lib/types";
import { GOAL_COPY } from "@/content/seo";
import { ShopShell } from "./ShopShell";
import { PharmacistMark } from "@/components/PharmacistMark";

type SP = Record<string, string | string[] | undefined>;

/** "Thorne on the Organoli shelf: 8 products, from magnesium, zinc and B complex. …" — built from what we stock. */
export function brandIntro(brand: Brand, products: Product[]) {
  const counts = new Map<string, number>();
  for (const p of products) for (const i of p.ingredients.slice(0, 1)) counts.set(i, (counts.get(i) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([i]) => i.replace(/^([A-Z])([a-z]+)\b/, (_, a: string, b: string) => a.toLowerCase() + b)); // "Magnesium" → "magnesium", "CoQ10" stays
  const range = top.length ? `, from ${top.length > 1 ? `${top.slice(0, -1).join(", ")} and ${top.at(-1)}` : top[0]}` : "";
  return `${brand.name} on the Organoli shelf: ${products.length} product${products.length === 1 ? "" : "s"}${range}. Each one chosen by a pharmacist, checked on arrival in Beirut and delivered across Lebanon.`;
}

/**
 * The shop listing. `category`, `goal` or `brand` narrows it to a landing page
 * (/shop/<category>, /goals/<goal>, /brands/<brand>); none of them = all products.
 */
export async function ShopPage({ category = null, goal = null, brand = null, searchParams }: { category?: CategorySlug | null; goal?: GoalSlug | null; brand?: Brand | null; searchParams: SP }) {
  const catalog = await getCatalog();
  const filters = parseFilters(searchParams);
  const meta = category ? CATEGORY_BY_SLUG[category] : null;
  const goalMeta = goal ? GOAL_BY_SLUG[goal] : null;
  const base = category
    ? catalog.inCategory(category)
    : goal
      ? catalog.getProducts().filter((p) => p.goals.includes(goal))
      : brand
        ? catalog.getProducts().filter((p) => p.brandSlug === brand.slug)
        : catalog.getProducts();
  const { results, facets } = catalog.listProducts(base, filters);
  const note = categoryNotes[category ?? "all"];

  // A single goal filter on /shop still gets the goal's name as its title
  const singleGoal = goalMeta ?? (!category && !brand && filters.goal.length === 1 ? GOAL_BY_SLUG[filters.goal[0] as GoalSlug] : null);
  const title = meta?.name ?? brand?.name ?? singleGoal?.name ?? "All products";
  const intro =
    meta?.intro ??
    (goal ? GOAL_COPY[goal].intro : null) ??
    (brand ? brandIntro(brand, base) : null) ??
    (singleGoal ? `${singleGoal.ingredients}. The short list we’d choose ourselves — filter by form, diet or format.` : `Everything on the shelf — ${base.length} products, each chosen by a pharmacist and listed with its full specification.`);
  // Where the breadcrumb's middle step goes (Shop › <parent> › <this page>)
  const parent: [string, string] | null = meta ? ["Shop", "/shop"] : goal ? ["Shop by goal", "/#shop-by-goal"] : brand ? ["Brands", "/brands"] : null;

  const labels: Record<string, string> = {};
  for (const k of FILTER_KEYS) for (const v of filters[k]) labels[`${k}:${v}`] = catalog.filterLabel(k, v);

  return (
    <>
      <section className="px-4 pt-4 lg:px-12 lg:pt-7">
        <nav aria-label="Breadcrumb" className="flex gap-2.5 text-[11px] font-medium uppercase leading-none tracking-[.12em] text-slate-text lg:text-xs">
          <Link href="/" className="hidden hover:text-ink lg:inline">
            Home
          </Link>
          <span aria-hidden="true" className="hidden lg:inline">
            /
          </span>
          {parent ? (
            <>
              <Link href={parent[1]} className="hover:text-ink">
                <span className="lg:hidden">← </span>
                {parent[0]}
              </Link>
              <span aria-hidden="true" className="hidden lg:inline">
                /
              </span>
              <span aria-current="page" className="hidden text-ink lg:inline">
                {title}
              </span>
            </>
          ) : (
            <span aria-current="page" className="text-ink">
              Shop
            </span>
          )}
        </nav>
        <div className="grid items-end gap-6 pb-5 pt-3 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14 lg:pb-10 lg:pt-9">
          <div className="flex flex-col gap-[18px]">
            <h1 className="m-0 font-display text-[60px] font-medium leading-[.85] lg:text-[clamp(88px,9vw,148px)] lg:leading-[.82] lg:tracking-[-.02em]">{title}</h1>
            <p className="m-0 hidden max-w-[560px] text-[19px] leading-normal lg:block">{intro}</p>
          </div>
          <div className="hidden items-start gap-4 border border-hairline p-[18px] lg:flex">
            <PharmacistMark className="h-12 w-12 text-[28px]" />
            <div className="flex flex-col gap-2">
              <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">Pharmacist’s note</span>
              <span className="text-[15px] leading-[1.45]">“{note.note}”</span>
              <Link href={note.link.href} className="text-[11.5px] font-semibold uppercase leading-none tracking-[.14em] text-ink">
                {note.link.label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ShopShell
        filters={filters}
        facets={facets}
        results={results.map(catalog.toCard)}
        total={results.length}
        labels={labels}
        learn={note.learn}
        showForms={!!category || !!goal}
      />

      <section className="mx-4 mb-16 grid items-center gap-6 bg-paper-shade p-6 lg:mx-12 lg:mb-[100px] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:p-10">
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[34px] font-medium leading-none lg:text-[44px]">Still deciding? Answer four questions.</span>
          <span className="text-base leading-normal">We’ll suggest a short list that fits your routine and diet. Not a diagnosis — a shopping guide.</span>
        </div>
        <Link href="/routine" className="inline-flex h-14 items-center justify-center rounded-sm bg-slate-700 px-[26px] text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-colors hover:bg-ink">
          Find what fits your routine →
        </Link>
      </section>
    </>
  );
}
