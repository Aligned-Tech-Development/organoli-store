"use client";

import Image from "next/image";
import Link from "next/link";
import { Truck, X } from "lucide-react";
import { site, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { cartCount, cartSubtotal, useCart, useUI } from "@/lib/store";
import type { CardProduct } from "@/lib/types";
import { useScrollLock } from "./header/MobileOverlays";
import { DispatchMessage } from "./motion";

export function CartDrawer({ pairs }: { pairs: CardProduct[] }) {
  const open = useUI((s) => s.overlay === "cart");
  const close = useUI((s) => s.close);
  const { lines, setQty, remove, add } = useCart();
  const count = cartCount(lines);
  const subtotal = cartSubtotal(lines);
  const left = site.freeDeliveryThreshold - subtotal;
  const pair = pairs.find((p) => !lines.some((l) => l.slug === p.slug));
  useScrollLock(open);

  const orderText = [
    "Hello Organoli, I'd like to order:",
    ...lines.map((l) => `• ${l.qty} × ${l.brand ? `${l.brand} ` : ""}${l.name}${l.specLine ? ` (${l.specLine})` : ""} — ${money(l.price * l.qty)}`),
    `Subtotal: ${money(subtotal)}`,
    "Delivery area: ",
  ].join("\n");

  return (
    <>
      <div onClick={close} aria-hidden="true" className={`fixed inset-0 z-[80] bg-ink/40 transition-opacity duration-300 ease-[ease] ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        inert={!open}
        className={`fixed z-[90] flex flex-col bg-paper font-sans text-ink shadow-cart transition-transform duration-drawer ease-out max-lg:inset-x-0 max-lg:bottom-0 max-lg:h-[88%] max-lg:rounded-t-[18px] lg:inset-y-0 lg:right-0 lg:w-[460px] lg:max-w-full ${
          open ? "translate-x-0 translate-y-0" : "max-lg:translate-y-[105%] lg:translate-x-[105%]"
        }`}
      >
        <span aria-hidden="true" className="mb-1 mt-2.5 h-1 w-10 self-center rounded-sm bg-hairline lg:hidden" />
        <div className="flex items-center justify-between px-4 pb-3 pt-1.5 lg:border-b lg:border-hairline lg:px-7 lg:py-[22px]">
          <span className="font-display text-[32px] font-medium leading-none">
            Your bag <span className="text-slate-text">({count})</span>
          </span>
          <button type="button" onClick={close} aria-label="Close bag" className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline hover:border-ink">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-2.5 border-b border-hairline px-4 pb-3.5 lg:px-7 lg:py-[18px]">
          <span className="text-sm font-medium leading-[1.3]" aria-live="polite">
            {left <= 0 ? `Free delivery in ${site.city} unlocked.` : `You are ${money(left)} away from free delivery in ${site.city}.`}
          </span>
          <div className="h-1 overflow-hidden bg-paper-shade">
            <div className="h-full bg-mint transition-[width] duration-500 ease-out" style={{ width: `${Math.min(100, (subtotal / site.freeDeliveryThreshold) * 100)}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 lg:px-7">
          {!lines.length && (
            <div className="flex flex-col items-start gap-4 py-10">
              <span className="font-display text-[30px] font-medium leading-none">Your bag is empty.</span>
              <span className="text-[15px] text-slate-text">Start with the shelf, or answer four questions and we’ll suggest a short list.</span>
              <div className="flex flex-wrap gap-2">
                <Link href="/shop" onClick={close} className="flex h-12 items-center rounded-sm bg-slate-700 px-5 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
                  Shop the shelf
                </Link>
                <Link href="/routine" onClick={close} className="flex h-12 items-center rounded-sm border border-ink px-5 text-xs font-semibold uppercase tracking-[.14em] hover:bg-paper-shade">
                  Find your routine
                </Link>
              </div>
            </div>
          )}
          {lines.map((l) => (
            <div key={l.slug} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-b border-hairline-soft py-4 lg:grid-cols-[88px_minmax(0,1fr)] lg:gap-4 lg:py-5">
              <Link href={`/products/${l.slug}`} onClick={close} className="relative h-[76px] w-[76px] overflow-hidden border border-hairline bg-paper-hover lg:h-[88px] lg:w-[88px]">
                {l.image ? <Image src={l.image} alt="" fill sizes="88px" className="object-contain p-1.5 mix-blend-multiply" /> : <span className="ph-paper absolute inset-0" />}
              </Link>
              <div className="flex min-w-0 flex-col gap-[5px]">
                <div className="flex justify-between gap-3">
                  <span className="text-[10.5px] font-semibold uppercase leading-[1.2] tracking-[.14em] text-slate-text">{l.brand}</span>
                  <span className="text-base font-semibold leading-none tabular-nums">{money(l.price * l.qty)}</span>
                </div>
                <Link href={`/products/${l.slug}`} onClick={close} className="text-base font-medium leading-[1.2] hover:text-slate-700">
                  {l.name}
                </Link>
                {l.specLine && <span className="text-[11px] font-medium uppercase leading-[1.3] tracking-[.08em]">{l.specLine}</span>}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-sm border border-hairline">
                    <button type="button" onClick={() => setQty(l.slug, l.qty - 1)} disabled={l.qty <= 1} aria-label={`Decrease quantity of ${l.name}`} className="h-11 w-11 text-lg font-medium leading-none disabled:opacity-40 lg:h-9 lg:w-9">
                      −
                    </button>
                    <span className="min-w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">
                      {l.qty}
                    </span>
                    <button type="button" onClick={() => setQty(l.slug, l.qty + 1)} aria-label={`Increase quantity of ${l.name}`} className="h-11 w-11 text-lg font-medium leading-none lg:h-9 lg:w-9">
                      +
                    </button>
                  </div>
                  <button type="button" onClick={() => remove(l.slug)} className="min-h-11 text-[13px] font-medium text-slate-text underline underline-offset-[3px] lg:min-h-9">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pair && lines.length > 0 && (
            <div className="my-[22px] grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3.5 border border-hairline p-4">
              <span className="relative h-14 w-14 bg-paper-hover">{pair.image && <Image src={pair.image.src} alt="" fill sizes="56px" className="object-contain p-1 mix-blend-multiply" />}</span>
              <span className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">Pairs well{pair.brand ? ` · ${pair.brand}` : ""}</span>
                <span className="truncate text-[15px] font-medium leading-[1.2]">{pair.name}</span>
                <span className="text-xs font-medium leading-none text-slate-text">{money(pair.price)}</span>
              </span>
              <button
                type="button"
                onClick={() => add({ ...pair, image: pair.image?.src })}
                className="h-11 rounded-sm border border-ink px-3.5 text-[11px] font-semibold uppercase leading-none tracking-[.12em] hover:bg-ink hover:text-paper lg:h-10"
              >
                Add +
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-hairline bg-paper-shade px-4 pb-[30px] pt-3.5 lg:gap-3.5 lg:px-7 lg:pb-[26px] lg:pt-[22px]">
          <div className="flex items-center gap-2.5 text-[13px] font-medium leading-[1.35]">
            <Truck size={18} strokeWidth={1.75} className="hidden flex-none lg:block" aria-hidden="true" />
            <DispatchMessage />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] font-medium leading-none">Subtotal</span>
            <span className="text-[22px] font-semibold leading-none tabular-nums lg:text-2xl">{money(subtotal)}</span>
          </div>
          {lines.length ? (
            <a
              href={whatsappLink(orderText)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[54px] items-center justify-center rounded-sm bg-slate-700 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-[background,transform] duration-200 hover:bg-ink active:scale-[.985] lg:h-14"
            >
              Checkout
            </a>
          ) : (
            <button type="button" disabled className="h-[54px] rounded-sm bg-out-of-stock text-[13px] font-semibold uppercase tracking-[.16em] text-paper lg:h-14">
              Checkout
            </button>
          )}
          <span className="text-center text-xs leading-[1.4] text-slate-text lg:text-[12.5px]">Cash on delivery or card · Taxes included · Free returns on unopened items</span>
        </div>
      </aside>
    </>
  );
}
