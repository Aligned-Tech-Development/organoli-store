import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { popularSearches } from "@/content/site";

export const metadata: Metadata = { title: "Page not found" };

// Renders for unmatched URLs and notFound() calls. It sits above the (store)
// layout, so it brings its own header and footer.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <div className="px-4 pb-20 pt-10 lg:px-12 lg:pb-[100px] lg:pt-16">
          <span className="eyebrow">404 · Not on the shelf</span>
          <h1 className="m-0 mt-4 max-w-[900px] font-display text-5xl font-medium leading-[.95] lg:text-[76px]">We couldn’t find that page.</h1>
          <p className="mt-5 max-w-[560px] text-base leading-normal text-slate-text lg:text-lg">
            The link may be old, or the product may have moved. Everything we stock is on the shelf.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="flex h-12 items-center rounded-sm bg-slate-700 px-6 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
              Shop all products
            </Link>
            <Link href="/" className="flex h-12 items-center rounded-sm border border-ink px-6 text-xs font-semibold uppercase tracking-[.14em] hover:bg-paper-shade">
              Back to home
            </Link>
          </div>
          <form action="/search" role="search" className="mt-12 flex max-w-[720px] gap-2">
            <label className="flex h-14 flex-1 items-center rounded-sm border border-ink bg-field px-4 focus-within:shadow-halo">
              <span className="sr-only">Search products, ingredients and brands</span>
              <input name="q" placeholder="Search an ingredient, brand or goal" className="min-w-0 flex-1 border-0 bg-transparent text-lg outline-none [&:focus-visible]:shadow-none [&:focus-visible]:outline-none" />
            </label>
            <button type="submit" className="h-14 rounded-sm border border-ink px-6 text-xs font-semibold uppercase tracking-[.16em] hover:bg-ink hover:text-paper">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularSearches.map((p) => (
              <Link key={p} href={`/search?q=${encodeURIComponent(p)}`} className="flex h-10 items-center rounded-pill border border-hairline px-4 text-sm font-medium hover:border-ink">
                {p}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
