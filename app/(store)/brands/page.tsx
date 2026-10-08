import type { Metadata } from "next";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Brands A–Z", description: "Every brand on the Organoli shelf." };

export default async function BrandsPage() {
  const catalog = await getCatalog();
  const brands = [...catalog.getBrands()].sort((a, b) => a.name.localeCompare(b.name));
  const groups = new Map<string, typeof brands>();
  for (const b of brands) {
    const k = /[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : "#";
    groups.set(k, [...(groups.get(k) ?? []), b]);
  }
  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Brands</span>
      <h1 className="m-0 mt-4 font-display text-[60px] font-medium leading-[.85] lg:text-[148px] lg:leading-[.82] lg:tracking-[-.02em]">{brands.length} brands</h1>
      <p className="mt-5 max-w-[560px] text-lg leading-normal">Each one on the shelf for a reason. Choose a brand to see everything we stock from it.</p>
      <nav aria-label="Jump to letter" className="mt-8 flex flex-wrap gap-1 border-y border-hairline py-3">
        {[...groups.keys()].map((k) => (
          <a key={k} href={`#letter-${k}`} className="flex h-11 w-11 items-center justify-center rounded-sm text-sm font-semibold hover:bg-paper-shade">
            {k}
          </a>
        ))}
      </nav>
      <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {[...groups.entries()].map(([k, list]) => (
          <section key={k} id={`letter-${k}`} className="scroll-mt-24">
            <h2 className="m-0 border-b border-ink pb-2 font-display text-4xl font-medium leading-none">{k}</h2>
            <ul className="m-0 list-none p-0">
              {list.map((b) => (
                <li key={b.slug}>
                  <Link href={`/shop?brand=${b.slug}`} className="flex min-h-11 items-center justify-between border-b border-hairline-soft text-base hover:text-slate-700">
                    <span>{b.name}</span>
                    <span className="text-[13px] tabular-nums text-slate-text">{b.productCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
