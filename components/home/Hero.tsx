"use client";

import Image from "@/components/Img";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { money } from "@/lib/format";
import { Photo } from "@/components/ProductImage";
import type { ProductImage } from "@/lib/types";

export interface HeroProduct {
  slug: string;
  name: string;
  brand: string | null;
  spec: string;
  price: number;
  image: ProductImage | null;
}

const ROTATE_MS = 4500;

export function Hero({ headline, products }: { headline: string; products: HeroProduct[] }) {
  const img = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (img.current) img.current.style.transform = `translateY(${Math.min(window.scrollY, 900) * 0.06}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Shuffle through the best sellers; hover/focus pauses, reduced motion stops it entirely.
  useEffect(() => {
    if (paused || products.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setActive((i) => (i + 1) % products.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused, products.length]);

  const lines = [headline, "One shelf you", "can trust."];
  const p = products[active];
  const counter = `${String(active + 1).padStart(2, "0")} / ${String(products.length).padStart(2, "0")}`;
  const pause = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  };

  return (
    <section className="border-b border-hairline lg:grid lg:min-h-[560px] lg:grid-cols-[minmax(520px,5fr)_7fr]">
      <div className="flex flex-col justify-center px-4 pt-7 lg:py-14 lg:pl-12 lg:pr-14">
        <div className="flex flex-col gap-[18px] lg:gap-8">
          <span className="flex items-center gap-2.5 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text lg:text-[11px] lg:tracking-[.18em]">
            <span aria-hidden="true" className="hidden h-3.5 w-3.5 items-center justify-center bg-mint text-xs text-ink lg:flex">
              +
            </span>
            Pharmacist-curated · {site.city}
          </span>
          <h1 className="m-0 font-display text-[64px] font-medium leading-[.88] tracking-[-.01em] text-ink lg:text-[88px] lg:tracking-[-.015em]">
            {lines.map((l, i) => (
              <span key={l} className="block overflow-hidden pb-1">
                <span className={`block motion-safe:animate-mask-up ${i === 2 ? "text-slate-700" : ""}`} style={{ animationDelay: `${150 + i * 110}ms` }}>
                  {l}
                </span>
              </span>
            ))}
          </h1>
          <Link
            href="/shop"
            className="hidden h-14 items-center gap-3 self-start rounded-sm bg-slate-700 px-7 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-[background,transform] duration-200 hover:bg-ink active:scale-[.97] lg:inline-flex"
          >
            Shop the shelf →
          </Link>
        </div>
      </div>

      <div className="relative mt-[22px] aspect-[4/5] overflow-hidden bg-slate lg:mt-0 lg:aspect-auto">
        <div ref={img} className="absolute inset-x-0 -inset-y-10 will-change-transform" aria-hidden="true">
          <Photo src="/images/hero-dropper.jpg" sizes="(min-width:1024px) 58vw, 100vw" duotone priority />
        </div>
        {(["left-5 top-[18px]", "right-5 top-[18px]", "bottom-[18px] right-5"] as const).map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute hidden text-[22px] font-light leading-none text-paper/80 lg:block ${pos}`}>
            +
          </span>
        ))}

        {p && (
          <div aria-roledescription="carousel" aria-label="Best sellers" {...pause}>
            {/* Desktop best-seller card */}
            <div className="absolute bottom-8 left-8 hidden w-60 flex-col border border-hairline bg-paper text-ink shadow-card lg:flex">
              <span className="flex items-center justify-between px-4 pt-3.5 text-[9.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mint" />
                  Best seller
                </span>
                <span className="tabular-nums" aria-live="polite">
                  {counter}
                </span>
              </span>
              <Link key={p.slug} href={`/products/${p.slug}`} className="flex flex-col gap-2.5 px-4 pb-3 pt-3 motion-safe:animate-rise">
                <span className="relative aspect-[16/9] overflow-hidden bg-paper-shade">
                  {p.image && (
                    <span className="absolute inset-[8%]">
                      <Image src={p.image.src} alt={p.image.alt || p.name} fill sizes="208px" className="object-contain mix-blend-multiply" />
                    </span>
                  )}
                </span>
                <span className="flex flex-col gap-1">
                  {p.brand && <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{p.brand}</span>}
                  <span className="line-clamp-2 font-display text-[19px] font-medium leading-[1.05]">{p.name}</span>
                </span>
                <span className="flex items-center justify-between border-t border-dashed border-spec-rule pt-2.5">
                  <span className="text-[15px] font-semibold leading-none">{money(p.price)}</span>
                  <span className="text-[10px] font-semibold uppercase leading-none tracking-[.16em]">Shop →</span>
                </span>
              </Link>
              <Dots count={products.length} active={active} onPick={setActive} className="px-4 pb-2.5" />
            </div>

            {/* Mobile best-seller card */}
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2.5 bg-paper px-4 pb-3 pt-3.5 text-ink lg:hidden">
              <Link key={p.slug} href={`/products/${p.slug}`} className="flex items-center gap-3.5 motion-safe:animate-rise">
                <span className="relative h-14 w-14 flex-none overflow-hidden bg-paper-shade">
                  {p.image && (
                    <span className="absolute inset-[8%]">
                      <Image src={p.image.src} alt="" fill sizes="56px" className="object-contain mix-blend-multiply" />
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">Best seller · {counter}</span>
                  <span className="truncate font-display text-[20px] font-medium leading-none">{p.name}</span>
                  {p.brand && <span className="truncate text-[10.5px] font-medium uppercase leading-none tracking-[.08em]">{p.brand}</span>}
                </span>
                <span className="text-[17px] font-semibold leading-none">{money(p.price)}</span>
              </Link>
              <Dots count={products.length} active={active} onPick={setActive} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:hidden">
        <Link href="/shop" className="flex h-[54px] items-center justify-center rounded-sm bg-slate-700 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper">
          Shop the shelf
        </Link>
      </div>
    </section>
  );
}

function Dots({ count, active, onPick, className = "" }: { count: number; active: number; onPick: (i: number) => void; className?: string }) {
  if (count < 2) return null;
  return (
    <span className={`flex gap-1.5 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(i)}
          aria-label={`Show best seller ${i + 1}`}
          aria-current={i === active ? "true" : undefined}
          className="flex h-6 flex-1 items-center"
        >
          <span className={`h-0.5 w-full transition-colors duration-300 ${i === active ? "bg-ink" : "bg-hairline"}`} />
        </button>
      ))}
    </span>
  );
}
