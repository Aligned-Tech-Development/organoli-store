"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/motion";
import type { CardProduct } from "@/lib/types";

export function Favourites({ tabs }: { tabs: { label: string; short: string; items: CardProduct[] }[] }) {
  const [tab, setTab] = useState(0);
  const [pos, setPos] = useState(0);
  const [vis, setVis] = useState(1);
  const rail = useRef<HTMLDivElement>(null);
  const items = tabs[tab].items;

  useEffect(() => {
    const r = rail.current;
    if (!r) return;
    const update = () => {
      setVis(Math.min(1, r.clientWidth / Math.max(1, r.scrollWidth)));
      setPos(r.scrollLeft / Math.max(1, r.scrollWidth - r.clientWidth));
    };
    update();
    r.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      r.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [tab]);

  const scroll = (dir: number) => rail.current?.scrollBy({ left: dir * 334 * 2, behavior: "smooth" });

  return (
    <section className="mt-7 bg-paper-shade pb-8 pt-8 lg:mt-0 lg:pb-[88px] lg:pt-[72px]" aria-labelledby="fav-title">
      <Reveal className="mb-4 flex flex-col gap-4 px-4 lg:mb-11 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:px-12">
        <div className="flex flex-col gap-5">
          <span className="eyebrow hidden lg:block">On the shelf</span>
          <h2 id="fav-title" className="m-0 font-display text-[38px] font-medium leading-[.95] lg:text-[64px] lg:leading-[.92]">
            Organoli favourites
          </h2>
        </div>
        <div className="flex items-center gap-7">
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
          <div className="hidden gap-2 lg:flex">
            {[
              ["Previous products", "←", -1],
              ["Next products", "→", 1],
            ].map(([label, glyph, dir]) => (
              <button key={label} type="button" onClick={() => scroll(dir as number)} aria-label={label as string} className="h-12 w-12 rounded-sm border border-ink bg-transparent text-lg font-medium leading-none text-ink transition-colors hover:bg-ink hover:text-paper">
                {glyph}
              </button>
            ))}
          </div>
        </div>
      </Reveal>
      <div ref={rail} role="tabpanel" className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 lg:scroll-px-12 lg:gap-6 lg:px-12">
        {items.map((p) => (
          <div key={p.slug} className="flex w-[200px] flex-none snap-start lg:w-[310px]">
            <ProductCard p={p} sizes="(min-width:1024px) 310px, 200px" />
          </div>
        ))}
      </div>
      <div className="relative mx-12 mt-9 hidden h-0.5 bg-hairline lg:block" aria-hidden="true">
        <div
          className="absolute inset-y-0 left-0 bg-ink transition-[transform,width] duration-[400ms] ease-out"
          style={{ width: `${vis * 100}%`, transform: `translateX(${pos * (1 / vis - 1) * 100}%)` }}
        />
      </div>
    </section>
  );
}
