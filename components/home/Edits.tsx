"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/motion";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store";
import type { CardProduct } from "@/lib/types";
import { Photo } from "@/components/ProductImage";

export interface EditView {
  tab: string;
  title: string;
  dek: string;
  meta: string;
  caption: string;
  image: string;
  tone: "paper" | "slate" | "mint";
  foot: string;
  steps: { time: string; label: string; p: CardProduct }[];
}

const TONE = { paper: "ph-paper text-slate-text", slate: "ph-slate text-paper", mint: "ph-mint text-ink" };

export function Edits({ edits }: { edits: EditView[] }) {
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const add = useCart((s) => s.add);
  const e = edits[active];
  const total = e.steps.reduce((a, s) => a + s.p.price, 0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (box.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      box.current.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" });
  }, [active]);

  const addOne = (p: CardProduct) => add({ ...p, image: p.image?.src });

  return (
    <section id="the-edits" className="px-4 py-10 lg:px-12 lg:py-[120px]" aria-labelledby="edits-title">
      <Reveal className="mb-6 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-3.5 lg:gap-5">
          <span className="eyebrow">The edits</span>
          <h2 id="edits-title" className="m-0 max-w-[760px] font-display text-[40px] font-medium leading-[.95] lg:text-[76px] lg:leading-[.92]">
            Curated like a shelf. Told like a routine.
          </h2>
        </div>
        <div role="tablist" aria-label="Edits" className="no-scrollbar flex gap-7 overflow-x-auto border-b border-hairline">
          {edits.map((x, i) => (
            <button
              key={x.tab}
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className="relative h-12 flex-none border-0 bg-transparent p-0 text-[17px] font-medium leading-none"
              style={{ color: i === active ? "#24343A" : "#4E6870" }}
            >
              {x.tab}
              <span className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-[350ms] ease-out" style={{ transform: i === active ? "scaleX(1)" : "scaleX(0)" }} />
            </button>
          ))}
        </div>
      </Reveal>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[7fr_5fr] lg:items-stretch lg:gap-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm lg:aspect-auto lg:min-h-[680px]">
          {edits.map((x, i) => (
            <div
              key={x.tab}
              aria-hidden="true"
              className={`absolute inset-0 flex items-end p-6 transition-[opacity,transform] duration-[700ms,1400ms] ease-[ease,cubic-bezier(.2,.7,.2,1)] ${TONE[x.tone]}`}
              style={{ opacity: i === active ? 1 : 0, transform: i === active ? "scale(1)" : "scale(1.05)" }}
            >
              <Photo src={x.image} alt={x.caption} sizes="(min-width:1024px) 55vw, 100vw" duotone={x.tone === "slate"} />
            </div>
          ))}
          <span className="absolute left-4 top-4 bg-paper px-3 py-2 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] lg:left-6 lg:top-6">{e.meta}</span>
        </div>
        <div ref={box} role="tabpanel" className="flex flex-col gap-[22px] pt-2">
          <h3 className="m-0 font-display text-[40px] font-medium leading-[.95] lg:text-[56px]">{e.title}</h3>
          <p className="m-0 max-w-[460px] text-base leading-[1.55] lg:text-[17px]">{e.dek}</p>
          <div className="mt-1.5 flex flex-col border-t border-ink">
            {e.steps.map((s) => (
              <div key={s.time + s.p.slug} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-hairline py-3 lg:grid-cols-[64px_minmax(0,1fr)_auto] lg:gap-4 lg:py-4">
                <span className="font-display text-xl font-medium leading-none tabular-nums lg:text-[26px]">{s.time}</span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{s.label}</span>
                  <Link href={`/products/${s.p.slug}`} className="text-[15px] font-medium leading-[1.25] hover:text-slate-700 lg:text-base">
                    {s.p.brand ? `${s.p.brand} ` : ""}
                    {s.p.name}
                  </Link>
                  {s.p.specLine && <span className="text-[11px] font-medium uppercase leading-[1.2] tracking-[.08em]">{s.p.specLine}</span>}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[15px] font-semibold leading-none">{money(s.p.price)}</span>
                  <button
                    type="button"
                    onClick={() => addOne(s.p)}
                    aria-label={`Add to bag: ${s.p.name}`}
                    className="h-11 w-11 rounded-sm border border-ink bg-transparent text-lg font-medium leading-none text-ink transition-colors hover:bg-ink hover:text-paper lg:h-10 lg:w-10"
                  >
                    +
                  </button>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <span className="text-sm leading-[1.4] text-slate-text">{e.foot}</span>
            <button
              type="button"
              onClick={() => e.steps.forEach((s) => addOne(s.p))}
              className="h-[52px] whitespace-nowrap rounded-sm border border-ink bg-transparent px-[22px] text-xs font-semibold uppercase leading-none tracking-[.14em] text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              Add the edit · {money(total)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
