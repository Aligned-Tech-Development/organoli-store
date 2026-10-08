"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/motion";
import { pad2 } from "@/lib/format";
import { Photo } from "@/components/ProductImage";

const TONES = ["ph-slate text-paper", "ph-paper text-slate-text", "ph-mint text-ink"];

export interface GoalRow {
  slug: string;
  name: string;
  ingredients: string;
  caption: string;
  image: string;
  count: number;
}

export function GoalIndex({ goals }: { goals: GoalRow[] }) {
  const [active, setActive] = useState(0);
  const g = goals[active];
  return (
    <section id="shop-by-goal" className="pb-2 pt-9 lg:px-12 lg:py-[120px]" aria-labelledby="goal-title">
      {/* Mobile: snap rail */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-baseline justify-between px-4">
          <h2 className="m-0 font-display text-[38px] font-medium leading-[.95]">Shop by goal</h2>
          <Link href="/shop" className="text-[11px] font-semibold uppercase leading-none tracking-[.14em]">
            All →
          </Link>
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4">
          {goals.map((x, i) => (
            <Link key={x.slug} href={`/shop?goal=${x.slug}`} className="flex w-[132px] flex-none snap-start flex-col gap-2 text-ink">
              <span className={`relative flex aspect-[4/5] items-end overflow-hidden p-2 font-display text-2xl font-medium leading-none text-paper ${TONES[i % 3]}`}>
                <Photo src={x.image} sizes="132px" />
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <span className="relative">{x.name}</span>
              </span>
              <span className="text-[10.5px] font-medium uppercase leading-[1.3] tracking-[.08em] text-slate-text">{x.ingredients}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: typographic index */}
      <div className="hidden lg:block">
        <Reveal className="mb-14 grid grid-cols-[5fr_7fr] items-end gap-14">
          <div className="flex flex-col gap-5">
            <span className="eyebrow">Shop by goal</span>
            <h2 id="goal-title" className="m-0 font-display text-[76px] font-medium leading-[.92] tracking-[-.01em]">
              Start with what you need, not what it’s called.
            </h2>
          </div>
          <p className="m-0 max-w-[520px] justify-self-end text-lg leading-[1.55]">No terminology required. Pick a goal and we show the short list — the forms, doses and brands we’d choose ourselves.</p>
        </Reveal>
        <div className="grid grid-cols-[5fr_7fr] items-start gap-14">
          <div className="sticky top-[calc(var(--hdr,0px)+24px)] flex flex-col transition-[top] duration-300 gap-[18px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-paper-shade">
              {goals.map((x, i) => (
                <div
                  key={x.slug}
                  aria-hidden={i !== active}
                  className={`absolute inset-0 flex items-end p-[18px] transition-[opacity,transform] duration-[500ms,1200ms] ease-[ease,cubic-bezier(.2,.7,.2,1)] ${TONES[i % 3]}`}
                  style={{ opacity: i === active ? 1 : 0, transform: i === active ? "scale(1)" : "scale(1.06)" }}
                >
                  <Photo src={x.image} alt={x.caption} sizes="(min-width:1024px) 40vw, 1px" />
                </div>
              ))}
            </div>
            <div className="flex items-start justify-between gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-[30px] font-medium leading-none">{g.name}</span>
                <span className="text-[11.5px] font-medium uppercase leading-[1.4] tracking-[.1em] text-slate-text">{g.ingredients}</span>
              </div>
              <Link href={`/shop?goal=${g.slug}`} className="inline-flex h-11 flex-none items-center rounded-sm border border-ink px-[18px] text-xs font-semibold uppercase leading-none tracking-[.14em] text-ink transition-colors hover:bg-ink hover:text-paper">
                Shop {g.count} →
              </Link>
            </div>
          </div>
          <div className="flex flex-col border-t border-ink">
            {goals.map((x, i) => {
              const on = i === active;
              return (
                <Link
                  key={x.slug}
                  href={`/shop?goal=${x.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="grid grid-cols-[36px_minmax(0,1fr)_minmax(0,170px)_44px_32px] items-center gap-4 border-b border-hairline py-[18px] text-ink"
                >
                  <span className="text-[13px] font-medium leading-none tabular-nums text-slate-text">{pad2(i + 1)}</span>
                  <span
                    className="min-w-0 whitespace-nowrap font-display text-[clamp(30px,3vw,44px)] font-medium leading-none tracking-[-.01em] transition-[transform,color] duration-[350ms] ease-out"
                    style={{ transform: on ? "translateX(14px)" : "none", color: on ? "#24343A" : "#4E6870" }}
                  >
                    {x.name}
                  </span>
                  <span className="text-[11.5px] font-medium uppercase leading-[1.4] tracking-[.1em] text-slate-text">{x.ingredients}</span>
                  <span className="text-right text-sm font-medium leading-none tabular-nums text-slate-text">{x.count}</span>
                  <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full text-base font-medium leading-none transition-colors duration-300" style={{ background: on ? "#7FB9A1" : "transparent" }}>
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
