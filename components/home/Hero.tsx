"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { site, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { Photo } from "@/components/ProductImage";

export interface HeroProduct {
  slug: string;
  no: string;
  lines: [string, string];
  rows: [string, string][];
  price: number;
  short: string;
  spec: string;
}

export function Hero({ headline, product }: { headline: string; product: HeroProduct | null }) {
  const img = useRef<HTMLDivElement>(null);

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

  const lines = [headline, "One shelf you", "can trust."];

  return (
    <section className="border-b border-hairline lg:grid lg:min-h-[600px] lg:grid-cols-[minmax(560px,5fr)_7fr]">
      <div className="flex flex-col justify-between px-4 pt-7 lg:py-14 lg:pb-10 lg:pl-12 lg:pr-14">
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
          <p className="m-0 max-w-[440px] text-base leading-normal [text-wrap:pretty] lg:text-[19px] lg:leading-[1.55]">
            <span className="lg:hidden">Chosen by a pharmacist, checked on arrival in Beirut, listed with the full specification.</span>
            <span className="hidden lg:inline">Every product is chosen by a pharmacist, checked on arrival in Beirut and listed with its full specification — dose, form, and what it is for.</span>
          </p>
          <div className="hidden flex-wrap gap-3 lg:flex">
            <Link href="/shop" className="inline-flex h-14 items-center gap-3 rounded-sm bg-slate-700 px-7 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-[background,transform] duration-200 hover:bg-ink active:scale-[.97]">
              Shop the shelf →
            </Link>
            <Link href="/routine" className="inline-flex h-14 items-center rounded-sm border border-ink px-[26px] text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-ink transition-colors duration-200 hover:bg-paper-shade">
              Find your supplements
            </Link>
          </div>
        </div>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-10 hidden max-w-[440px] items-center gap-3.5 border-t border-hairline pt-5 text-ink lg:flex">
          <Photo src={site.pharmacist.avatar} sizes="48px" className="h-11 w-11 flex-none rounded-full" />
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-medium leading-[1.3]">Not sure what you need? Ask {site.pharmacist.firstName}, our pharmacist.</span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.14em] text-slate-text">WhatsApp · replies within the hour</span>
          </span>
        </a>
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

        {product && (
          <>
            {/* Desktop spec card */}
            <Link
              href={`/products/${product.slug}`}
              className="absolute bottom-12 left-12 hidden w-80 flex-col gap-3.5 border border-hairline bg-paper px-[22px] pb-[18px] pt-[22px] text-ink shadow-card transition-transform duration-300 ease-out hover:-translate-y-1 lg:flex"
            >
              <span className="flex justify-between text-[10px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">
                <span>On the shelf</span>
                <span>No. {product.no}</span>
              </span>
              <span className="font-display text-[34px] font-medium leading-[.95]">
                {product.lines[0]}
                {product.lines[1] && (
                  <>
                    <br />
                    {product.lines[1]}
                  </>
                )}
              </span>
              <span className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 border-t border-hairline pt-3 text-[11px] font-medium uppercase leading-[1.2] tracking-[.1em]">
                {product.rows.map(([k, v]) => (
                  <span key={k} className="contents">
                    <span className="text-slate-text">{k}</span>
                    <span>{v}</span>
                  </span>
                ))}
              </span>
              <span className="flex items-center justify-between border-t border-dashed border-spec-rule pt-3">
                <span className="text-lg font-semibold leading-none">{money(product.price)}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase leading-none tracking-[.16em]">
                  <span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-mint text-xs">
                    +
                  </span>
                  Checked · {site.pharmacist.initials}
                </span>
              </span>
            </Link>
            {/* Mobile spec card */}
            <Link href={`/products/${product.slug}`} className="absolute inset-x-4 bottom-4 flex items-center justify-between bg-paper px-4 py-3.5 text-ink lg:hidden">
              <span className="flex flex-col gap-1">
                <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">On the shelf</span>
                <span className="font-display text-[22px] font-medium leading-none">{product.short}</span>
                <span className="text-[10.5px] font-medium uppercase leading-none tracking-[.08em]">{product.spec}</span>
              </span>
              <span className="text-[17px] font-semibold leading-none">{money(product.price)}</span>
            </Link>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 lg:hidden">
        <Link href="/shop" className="flex h-[54px] items-center justify-center rounded-sm bg-slate-700 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper">
          Shop the shelf
        </Link>
        <Link href="/routine" className="flex h-[54px] items-center justify-center rounded-sm border border-ink text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-ink">
          Find your supplements
        </Link>
      </div>
    </section>
  );
}
