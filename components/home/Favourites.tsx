"use client";

import { useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion";
import type { CardProduct } from "@/lib/types";

export function Favourites({ tabs }: { tabs: { label: string; short: string; items: CardProduct[] }[] }) {
  const [tab, setTab] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const items = tabs[tab].items;

  return (
    <section id="best-sellers" className="mt-7 scroll-mt-20 bg-paper-shade pb-8 pt-8 lg:mt-0 lg:pb-[88px] lg:pt-[72px]" aria-labelledby="fav-title">
      <Reveal className="mb-4 flex flex-col gap-4 px-4 lg:mb-11 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-12">
        <div className="flex flex-col gap-5">
          <span className="eyebrow hidden lg:block">On the shelf</span>
          <h2 id="fav-title" className="m-0 font-display text-[38px] font-medium leading-[.95] lg:text-[64px] lg:leading-[.92]">
            Organoli favourites
          </h2>
        </div>
        <div role="tablist" aria-label="Favourites" className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:gap-1 lg:rounded-pill lg:border lg:border-hairline lg:bg-paper lg:p-1">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              role="tab"
              aria-selected={i === tab}
              onClick={() => {
                setTab(i);
                rail.current?.scrollTo({ left: 0 });
              }}
              className={`h-9 flex-none rounded-pill px-3.5 text-sm font-medium leading-none transition-colors duration-[250ms] lg:h-10 lg:border-0 lg:px-[18px] ${
                i === tab ? "border border-ink bg-ink text-paper" : "border border-hairline bg-transparent text-ink lg:hover:bg-paper-shade"
              }`}
            >
              <span className="lg:hidden">{t.short}</span>
              <span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </Reveal>
      {/* Swipe rail on mobile; every product visible in a grid on desktop */}
      <div
        ref={rail}
        role="tabpanel"
        className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-12 2xl:grid-cols-6"
      >
        {items.map((p) => (
          <div key={p.slug} className="flex w-[200px] flex-none snap-start lg:w-auto">
            <ProductCard p={p} sizes="(min-width:1536px) 16vw, (min-width:1024px) 31vw, 200px" />
          </div>
        ))}
      </div>
    </section>
  );
}
