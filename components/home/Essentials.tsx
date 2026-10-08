"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { CardProduct } from "@/lib/types";

export function Essentials({ tabs, total }: { tabs: { label: string; items: CardProduct[] }[]; total: number }) {
  const [active, setActive] = useState(0);
  return (
    <section className="border-t border-hairline px-4 py-10 lg:px-12 lg:pb-[110px] lg:pt-[100px]" aria-labelledby="essentials-title">
      <div className="mb-6 flex flex-col gap-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
        <div className="flex flex-col gap-4">
          <span className="eyebrow">The shelf</span>
          <h2 id="essentials-title" className="m-0 font-display text-[40px] font-medium leading-[.95] lg:text-[64px] lg:leading-[.92]">
            Shop everyday essentials
          </h2>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:justify-end lg:px-0">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              type="button"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`h-10 flex-none rounded-pill border px-4 text-sm font-medium leading-none transition-colors duration-200 ${i === active ? "border-ink bg-ink text-paper" : "border-hairline bg-transparent text-ink hover:border-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
        {tabs[active].items.map((p) => (
          <ProductCard key={p.slug} p={p} sizes="(min-width:1024px) 25vw, 50vw" />
        ))}
      </div>
      <div className="mt-10 flex justify-center lg:mt-14">
        <Link href="/shop" className="inline-flex h-14 items-center rounded-sm border border-ink px-8 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-ink transition-colors hover:bg-ink hover:text-paper">
          View all {total} products
        </Link>
      </div>
    </section>
  );
}
