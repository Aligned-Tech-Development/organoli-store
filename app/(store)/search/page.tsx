import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { articleMeta } from "@/content/editorial";
import { popularSearches, whatsappLink } from "@/content/site";
import { articlesFor } from "@/lib/articles";
import { predictive, searchProducts, toCard } from "@/lib/catalog";
import { sortProducts, type Sort } from "@/lib/filters";
import { plural } from "@/lib/format";

type SP = Promise<{ q?: string; sort?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const q = (await searchParams).q?.trim();
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 80);
  const sort = (["lo", "hi", "new"].includes(sp.sort ?? "") ? sp.sort : "rec") as Sort;
  const found = q ? searchProducts(q) : [];
  const results = sort === "rec" ? found : sortProducts(found, sort);
  const meta = q ? predictive(q) : null;
  const arts = q ? articlesFor(q, 3) : [];
  const href = (s: Sort) => `/search?q=${encodeURIComponent(q)}${s === "rec" ? "" : `&sort=${s}`}`;

  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Search</span>
      <form action="/search" role="search" className="mt-4 flex max-w-[720px] gap-2">
        <label className="flex h-14 flex-1 items-center rounded-sm border border-ink bg-field px-4 focus-within:shadow-halo">
          <span className="sr-only">Search products, ingredients and brands</span>
          <input name="q" defaultValue={q} placeholder="Ingredient, brand or goal" className="min-w-0 flex-1 border-0 bg-transparent text-lg outline-none [&:focus-visible]:shadow-none [&:focus-visible]:outline-none" />
        </label>
        <button type="submit" className="h-14 rounded-sm bg-slate-700 px-6 text-xs font-semibold uppercase tracking-[.16em] text-paper hover:bg-ink">
          Search
        </button>
      </form>

      {!q ? (
        <div className="mt-10 flex flex-col gap-4">
          <h1 className="m-0 font-display text-5xl font-medium leading-none lg:text-[76px]">What are you looking for?</h1>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((p) => (
              <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="flex h-10 items-center rounded-pill border border-hairline px-4 text-sm font-medium hover:border-ink">
                {p}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 flex flex-col gap-5 border-b border-ink pb-6 lg:flex-row lg:items-end lg:justify-between">
            <h1 className="m-0 font-display text-5xl font-medium leading-[.95] lg:text-[76px]">“{q}”</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm font-medium tabular-nums text-slate-text" aria-live="polite">
                {plural(results.length, "product")}
              </span>
              {(
                [
                  ["rec", "Best match"],
                  ["lo", "Price ↑"],
                  ["hi", "Price ↓"],
                  ["new", "Newest"],
                ] as [Sort, string][]
              ).map(([s, l]) => (
                <Link key={s} href={href(s)} aria-current={s === sort ? "true" : undefined} className={`flex h-10 items-center rounded-pill border px-4 text-sm font-medium ${s === sort ? "border-ink bg-ink text-paper" : "border-hairline hover:border-ink"}`}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {meta && (meta.categories.length > 0 || meta.goals.length > 0 || meta.brands.length > 0) && (
            <div className="flex flex-wrap gap-2 py-5">
              {meta.categories.map((c) => (
                <Link key={c.slug} href={`/shop/${c.slug}`} className="flex h-10 items-center rounded-pill border border-hairline px-4 text-sm font-medium hover:border-ink">
                  {c.name} · {c.count}
                </Link>
              ))}
              {meta.goals.map((g) => (
                <Link key={g.slug} href={`/shop?goal=${g.slug}`} className="flex h-10 items-center rounded-pill bg-paper-shade px-4 text-sm font-medium hover:bg-mint">
                  {g.name}
                </Link>
              ))}
              {meta.brands.map((b) => (
                <Link key={b.slug} href={`/shop?brand=${b.slug}`} className="flex h-10 items-center rounded-pill border border-hairline px-4 text-sm font-medium hover:border-ink">
                  {b.name}
                </Link>
              ))}
            </div>
          )}

          {results.length ? (
            <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
              {results.map((p) => (
                <ProductCard key={p.slug} p={toCard(p)} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-start gap-3.5 py-14">
              <span className="font-display text-[40px] font-medium leading-none">No exact match on the shelf.</span>
              <span className="text-base text-slate-text">Our pharmacist can often source it, or suggest an equivalent we already stock.</span>
              <a href={whatsappLink(`Hello, I'm looking for: ${q}`)} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center rounded-sm bg-slate-700 px-5 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
                Ask on WhatsApp
              </a>
            </div>
          )}

          {arts.length > 0 && (
            <section className="mt-16 border-t border-hairline pt-8">
              <span className="eyebrow">From Learn</span>
              <div className="mt-5 grid gap-6 lg:grid-cols-3">
                {arts.map((a) => (
                  <Link key={a.title} href={a.href} className="flex flex-col gap-2 bg-paper-shade p-5">
                    <span className="font-display text-[26px] font-medium leading-[1.05]">{a.title}</span>
                    <span className="text-[15px] leading-[1.45] text-slate-text">{a.dek}</span>
                    <span className="text-[11px] font-medium uppercase tracking-[.12em] text-slate-text">{articleMeta(a)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
