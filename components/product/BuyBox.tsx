"use client";

import Image from "next/image";
import { Heart, MapPin, MessageCircle, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatchCountdown } from "@/components/motion";
import { site, whatsappLink } from "@/content/site";
import { canBuy, money, stockDot } from "@/lib/format";
import { cartCount, useCart, useUI, useWishlist } from "@/lib/store";
import type { CardProduct } from "@/lib/types";

const ctaBase = "rounded-sm border-0 font-semibold uppercase leading-none tracking-[.16em] transition-[background,transform] duration-[250ms] active:scale-[.985]";

/** Quantity stepper + Add to bag + wishlist, the delivery panel, and both sticky add bars. */
export function BuyBox({ p, stickySpec }: { p: CardProduct; stickySpec: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sticky, setSticky] = useState(false);
  const atc = useRef<HTMLDivElement>(null);
  const t = useRef<ReturnType<typeof setTimeout>>(undefined);
  const add = useCart((s) => s.add);
  const wished = useWishlist((s) => s.slugs.includes(p.slug));
  const toggleWish = useWishlist((s) => s.toggle);
  const buyable = canBuy(p);
  const mins = useDispatchCountdown();

  useEffect(() => {
    const el = atc.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => () => clearTimeout(t.current), []);

  const onAdd = () => {
    add({ ...p, image: p.image?.src }, qty);
    setAdded(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setAdded(false), 1500);
  };

  const ask = whatsappLink(p.stock === "out" ? `Hello, please let me know when ${p.brand ?? ""} ${p.name} is back in stock.` : `Hello, I have a question about ${p.brand ?? ""} ${p.name}.`);
  const label = added ? "Added to bag ✓" : "Add to bag";
  const bg = added ? "bg-mint text-ink" : "bg-slate-700 text-paper hover:bg-ink";

  const stepper = (h: string) => (
    <div className="flex flex-none items-center rounded-sm border border-ink">
      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className={`w-11 bg-transparent text-xl font-medium leading-none disabled:opacity-40 lg:w-12 ${h}`}>
        −
      </button>
      <span className="min-w-6 text-center text-base font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity" className={`w-11 bg-transparent text-xl font-medium leading-none lg:w-12 ${h}`}>
        +
      </button>
    </div>
  );

  return (
    <>
      <div ref={atc} className="flex gap-2">
        {buyable ? (
          <>
            {stepper("h-[58px]")}
            <button type="button" onClick={onAdd} className={`h-[60px] flex-1 text-sm ${ctaBase} ${bg}`}>
              {label}
            </button>
          </>
        ) : (
          <a href={ask} target="_blank" rel="noopener noreferrer" className={`flex h-[60px] flex-1 items-center justify-center text-sm ${ctaBase} bg-slate-700 text-paper hover:bg-ink`}>
            {p.stock === "out" ? "Notify me on WhatsApp" : "Ask for the price"}
          </a>
        )}
        <button
          type="button"
          onClick={() => toggleWish(p.slug)}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className={`flex h-[60px] w-[60px] flex-none items-center justify-center rounded-sm border border-ink ${wished ? "bg-mint" : "bg-transparent hover:bg-paper-shade"}`}
        >
          <Heart size={20} strokeWidth={1.75} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-col bg-paper-shade">
        {[
          { icon: Truck, h: mins != null && mins > 0 ? `Order within ${Math.floor(mins / 60) ? `${Math.floor(mins / 60)} h ` : ""}${mins % 60} min —` : "Order today —", t: `delivered tomorrow in ${site.city}. Free over $${site.freeDeliveryThreshold}.` },
          { icon: MapPin, h: "Rest of Lebanon:", t: "Mount Lebanon 1–2 days · North, South & Bekaa 2–3 days." },
          { icon: Wallet, h: "Pay your way:", t: "cash on delivery or Whish." },
          { icon: MessageCircle, h: "Not sure it’s right for you?", t: "Ask our pharmacist on WhatsApp.", href: ask },
        ].map((d) => {
          const body = (
            <>
              <d.icon size={18} strokeWidth={1.75} className="mt-px" aria-hidden="true" />
              <span className="text-[14.5px] leading-[1.4]">
                <strong className="font-semibold">{d.h}</strong> {d.t}
              </span>
            </>
          );
          const cls = "grid grid-cols-[22px_minmax(0,1fr)] items-start gap-3.5 border-b border-[#D3D0C8] px-[18px] py-3.5 last:border-b-0";
          return d.href ? (
            <a key={d.h} href={d.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:bg-[#DCD9D2]`}>
              {body}
            </a>
          ) : (
            <div key={d.h} className={cls}>
              {body}
            </div>
          );
        })}
      </div>

      {/* Desktop sticky bar — slides up once the main button scrolls away */}
      <div
        aria-hidden={!sticky}
        inert={!sticky}
        className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-ink bg-paper shadow-[0_-20px_40px_-20px_rgba(36,52,58,.3)] transition-transform duration-[400ms] ease-out lg:block"
        style={{ transform: sticky ? "translateY(0)" : "translateY(110%)" }}
      >
        <div className="flex items-center gap-5 px-12 py-3">
          <span className="relative h-[52px] w-[52px] flex-none border border-hairline bg-paper-shade">{p.image && <Image src={p.image.src} alt="" fill sizes="52px" className="object-contain p-1 mix-blend-multiply" />}</span>
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-[17px] font-medium leading-[1.2]">
              {p.brand ? `${p.brand} ` : ""}
              {p.name}
            </span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.1em] text-slate-text">{stickySpec}</span>
          </span>
          <span className="flex items-center gap-2 text-[13px] font-medium leading-none text-slate-text">
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: stockDot(p.stock) }} />
            {p.stock === "out" ? "Back in ~2 weeks" : <DispatchShort />}
          </span>
          {p.price > 0 && <span className="px-2 text-[22px] font-semibold leading-none tabular-nums">{money(p.price)}</span>}
          {buyable ? (
            <button type="button" onClick={onAdd} className={`h-[52px] px-8 text-[13px] ${ctaBase} ${bg}`}>
              {label}
            </button>
          ) : (
            <a href={ask} target="_blank" rel="noopener noreferrer" className={`flex h-[52px] items-center px-8 text-[13px] ${ctaBase} bg-slate-700 text-paper`}>
              {p.stock === "out" ? "Notify me" : "Ask for price"}
            </a>
          )}
        </div>
      </div>

      {/* Mobile sticky add bar — always visible */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-ink bg-paper px-4 pb-[max(30px,env(safe-area-inset-bottom))] pt-2.5 lg:hidden">
        {buyable ? (
          <>
            {stepper("h-[52px]")}
            <button type="button" onClick={onAdd} className={`h-[54px] flex-1 text-[13px] tracking-[.14em] ${ctaBase} ${bg}`}>
              {added ? "Added ✓" : `Add to bag · ${money(p.price * qty)}`}
            </button>
          </>
        ) : (
          <a href={ask} target="_blank" rel="noopener noreferrer" className={`flex h-[54px] flex-1 items-center justify-center text-[13px] ${ctaBase} bg-slate-700 text-paper`}>
            {p.stock === "out" ? "Notify me on WhatsApp" : "Ask for the price"}
          </a>
        )}
        <button type="button" onClick={openCart} aria-label="Open bag" className="flex h-[54px] w-12 flex-none items-center justify-center rounded-sm border border-hairline">
          <BagCount />
        </button>
      </div>
    </>
  );
}

function DispatchShort() {
  const mins = useDispatchCountdown();
  return <>{mins != null && mins > 0 ? `Delivered tomorrow, ${site.city}` : "Dispatched next working day"}</>;
}

const openCart = () => useUI.getState().openCart();
function BagCount() {
  const n = useCart((s) => cartCount(s.lines));
  return (
    <span className="relative">
      <ShoppingBag size={20} strokeWidth={1.75} />
      {n > 0 && <span className="absolute -right-2.5 -top-2 h-[17px] min-w-[17px] rounded-pill bg-mint px-1 text-center text-[10px] font-semibold leading-[17px]">{n}</span>}
    </span>
  );
}
