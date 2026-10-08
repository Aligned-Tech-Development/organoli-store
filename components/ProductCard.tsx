"use client";

import Image from "@/components/Img";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { whatsappLink } from "@/content/site";
import { canBuy, money, stockDot, stockLabel } from "@/lib/format";
import { useCart, useWishlist } from "@/lib/store";
import type { CardProduct } from "@/lib/types";

export function ProductCard({ p, sizes = "(min-width:1024px) 25vw, 50vw", compact = false }: { p: CardProduct; sizes?: string; compact?: boolean }) {
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.slugs.includes(p.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const href = `/products/${p.slug}`;
  const buyable = canBuy(p);
  const priceKnown = p.price > 0;

  useEffect(() => () => clearTimeout(timer.current), []);

  const onAdd = () => {
    add({ ...p, image: p.image?.src });
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="group/card flex w-full min-w-0 flex-col gap-3.5 font-sans text-ink">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-hairline bg-paper-hover">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          <div className={`absolute inset-0 bg-paper-hover transition-[transform,opacity] duration-700 ease-out motion-safe:group-hover/card:scale-[1.035] ${p.image2 ? "group-hover/card:opacity-0" : ""}`}>
            {p.image ? (
              <div className="absolute inset-[8%]">
                <Image src={p.image.src} alt="" fill sizes={sizes} className="object-contain mix-blend-multiply" />
              </div>
            ) : (
              <div className="ph-paper absolute inset-0 flex items-end p-3.5">
                <span className="caption text-slate-text">Pack shot · bottle front</span>
              </div>
            )}
          </div>
          {p.image2 && (
            <div className="absolute inset-0 bg-paper-hover p-[8%] opacity-0 transition-opacity duration-[450ms] ease-[ease] group-hover/card:opacity-100">
              <div className="relative h-full w-full">
                <Image src={p.image2.src} alt="" fill sizes={sizes} className="object-contain mix-blend-multiply" />
              </div>
            </div>
          )}
        </Link>
        <span aria-hidden="true" className="pointer-events-none absolute left-2 top-1.5 text-[13px] leading-none text-[#9AABAF]">+</span>
        <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-2 text-[13px] leading-none text-[#9AABAF]">+</span>
        {p.badge && (
          <span className="pointer-events-none absolute left-[26px] top-3 border border-hairline bg-paper px-2 py-[5px] text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-ink">
            {p.badge}
          </span>
        )}
        <button
          type="button"
          aria-label={wished ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
          aria-pressed={wished}
          onClick={() => toggleWish(p.slug)}
          className={`absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-sm transition-colors duration-200 ${wished ? "bg-mint" : "bg-paper/85 hover:bg-paper"}`}
        >
          <Heart size={18} strokeWidth={1.75} className="opacity-80" fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        {p.brand && <span className="text-[11px] font-semibold uppercase leading-[1.2] tracking-[.16em] text-slate-text">{p.brand}</span>}
        <Link href={href} className={`${compact ? "text-base" : "text-[19px]"} font-medium leading-[1.2] text-ink [text-wrap:pretty] hover:text-slate-700`}>
          {p.name}
        </Link>
        {p.purpose && !compact && <span className="line-clamp-2 text-sm leading-[1.4] text-slate-text">{p.purpose}</span>}
        {p.specLine && <span className="spec mt-1 border-t border-dashed border-spec-rule pt-[9px] text-ink">{p.specLine}</span>}
      </div>

      <div className="mt-auto flex items-center justify-between gap-2.5">
        <div className="flex flex-col gap-1">
          <span className={`${priceKnown ? "text-lg" : "text-sm"} font-semibold leading-none tabular-nums`}>{priceKnown ? money(p.price) : "Price on request"}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium leading-none text-slate-text">
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: stockDot(p.stock) }} />
            {stockLabel(p.stock)}
          </span>
        </div>
        {buyable ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add to bag: ${p.name}`}
            className={`flex h-11 min-w-11 items-center gap-2 rounded-sm border border-ink px-3.5 text-xs font-semibold uppercase leading-none tracking-[.12em] transition-[background,color,transform] duration-200 active:scale-[.97] ${
              added ? "bg-mint text-ink" : "bg-transparent text-ink group-hover/card:bg-ink group-hover/card:text-paper"
            }`}
          >
            <span aria-live="polite">{added ? "Added" : compact ? "+" : "Add +"}</span>
          </button>
        ) : (
          <a
            href={whatsappLink(p.stock === "out" ? `Hello, please let me know when ${p.brand ?? ""} ${p.name} is back in stock.` : `Hello, could you tell me the price of ${p.brand ?? ""} ${p.name}?`)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={p.stock === "out" ? `Notify me when ${p.name} is back` : `Ask about ${p.name}`}
            className="flex h-11 items-center rounded-sm border border-ink px-3.5 text-xs font-semibold uppercase leading-none tracking-[.12em] text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            {p.stock === "out" ? "Notify me" : "Ask us"}
          </a>
        )}
      </div>
    </article>
  );
}
