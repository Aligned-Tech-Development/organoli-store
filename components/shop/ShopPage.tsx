import Link from "next/link";
import { categoryNotes } from "@/content/editorial";
import { site } from "@/content/site";
import { FILTER_KEYS, filterLabel, getProducts, inCategory, listProducts, toCard } from "@/lib/catalog";
import { parseFilters } from "@/lib/filters";
import { CATEGORY_BY_SLUG, GOAL_BY_SLUG } from "@/lib/taxonomy";
import type { CategorySlug, GoalSlug } from "@/lib/types";
import { ShopShell } from "./ShopShell";

type SP = Record<string, string | string[] | undefined>;

export function ShopPage({ category, searchParams }: { category: CategorySlug | null; searchParams: SP }) {
  const filters = parseFilters(searchParams);
  const meta = category ? CATEGORY_BY_SLUG[category] : null;
  const base = category ? inCategory(category) : getProducts();
  const { results, facets } = listProducts(base, filters);
  const note = categoryNotes[category ?? "all"];

  // A single goal (from "Shop by goal") becomes the page title on /shop
  const singleGoal = !category && filters.goal.length === 1 ? GOAL_BY_SLUG[filters.goal[0] as GoalSlug] : null;
  const title = meta?.name ?? singleGoal?.name ?? "All products";
  const intro = meta?.intro ?? (singleGoal ? `${singleGoal.ingredients}. The short list we’d choose ourselves — filter by form, diet or format.` : `Everything on the shelf — ${base.length} products, each chosen by a pharmacist and listed with its full specification.`);

  const labels: Record<string, string> = {};
  for (const k of FILTER_KEYS) for (const v of filters[k]) labels[`${k}:${v}`] = filterLabel(k, v);

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
          {meta ? (
            <>
              <Link href="/shop" className="hover:text-ink">
                <span className="lg:hidden">← </span>Shop
              </Link>
              <span aria-hidden="true" className="hidden lg:inline">
                /
              </span>
              <span aria-current="page" className="hidden text-ink lg:inline">
                {meta.name}
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
            <span aria-hidden="true" className="ph-avatar h-12 w-12 flex-none rounded-full" />
            <div className="flex flex-col gap-2">
              <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">Pharmacist’s note · {site.pharmacist.name}</span>
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
        results={results.map(toCard)}
        total={results.length}
        labels={labels}
        learn={note.learn}
        showForms={!!category}
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
