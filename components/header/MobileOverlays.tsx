"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { articleMeta } from "@/content/editorial";
import { popularSearches, site, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { Logo } from "../Logo";
import { Label, Thumb } from "./SearchPanels";
import type { HeaderData } from "./types";
import { articlesFor, splitHit, usePredictive } from "./usePredictive";

/** Locks page scroll while an overlay is open. */
export function useScrollLock(locked: boolean, mobileOnly = false) {
  useEffect(() => {
    if (!locked) return;
    if (mobileOnly && !window.matchMedia("(max-width: 1023px)").matches) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked, mobileOnly]);
}

export function MobileMenu({ data, open, onClose }: { data: HeaderData; open: boolean; onClose: () => void }) {
  useScrollLock(open);
  return (
    <div className="lg:hidden">
      <div onClick={onClose} aria-hidden="true" className={`fixed inset-0 z-[80] bg-ink/45 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        className={`fixed inset-y-0 left-0 z-[90] flex w-[min(360px,88vw)] flex-col bg-paper transition-transform duration-drawer ease-out ${open ? "translate-x-0" : "-translate-x-[105%]"}`}
      >
        <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
          <Logo size="sm" />
          <button type="button" onClick={onClose} aria-label="Close menu" className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline">
            <X size={18} />
          </button>
        </div>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 pb-28">
          <div className="flex flex-col py-4">
            <Label>Categories</Label>
            {data.categories.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} onClick={onClose} className="flex min-h-11 items-center justify-between border-b border-hairline-soft text-base">
                <span>{c.name}</span>
                <span className="text-[13px] tabular-nums text-slate-text">{c.count}</span>
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 py-4">
            <Label>By goal</Label>
            <div className="flex flex-wrap gap-2">
              {data.goals.map((g) => (
                <Link key={g.slug} href={`/shop?goal=${g.slug}`} onClick={onClose} className="flex h-10 items-center rounded-pill border border-hairline px-3.5 text-sm font-medium">
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col py-4">
            {[
              ["All products", "/shop"],
              ["Brands A–Z", "/brands"],
              ["New on the shelf", "/shop?sort=new"],
              ["Find your routine", "/routine"],
              ["Wishlist", "/wishlist"],
            ].map(([l, h]) => (
              <Link key={h} href={h} onClick={onClose} className="flex min-h-12 items-center border-b border-hairline-soft text-xs font-semibold uppercase tracking-[.14em]">
                {l} →
              </Link>
            ))}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center text-xs font-semibold uppercase tracking-[.14em]">
              Pharmacist on WhatsApp →
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function MobileSearch({ data, open, onClose }: { data: HeaderData; open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: res } = usePredictive(q);
  useScrollLock(open, true);

  useEffect(() => {
    if (open && window.matchMedia("(max-width: 1023px)").matches) inputRef.current?.focus();
  }, [open]);

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  const chips = res ? [...res.categories.map((c) => ({ l: `${c.name} · ${c.count}`, h: `/shop/${c.slug}` })), ...res.goals.map((g) => ({ l: g.name, h: `/shop?goal=${g.slug}` })), ...res.brands.map((b) => ({ l: b.name, h: `/shop?brand=${b.slug}` }))] : [];
  const sugg = res?.suggestions.length ? res.suggestions : q.trim() ? [q.trim().toLowerCase()] : [];
  const art = q.trim() ? articlesFor(q, 1)[0] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      inert={!open}
      className={`fixed inset-0 z-[95] flex flex-col bg-paper transition-[opacity,transform] duration-menu ease-out lg:hidden ${open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        className="flex items-center gap-2 border-b border-hairline px-4 pb-3 pt-3"
      >
        <label className="flex h-12 flex-1 items-center gap-2.5 rounded-sm border border-ink bg-field px-3 shadow-halo">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
            placeholder="Ingredient, brand or goal"
            enterKeyHint="search"
            className="min-w-0 flex-1 border-0 bg-transparent text-[17px] leading-none text-ink outline-none [&:focus-visible]:shadow-none [&:focus-visible]:outline-none"
          />
        </label>
        <button type="button" onClick={onClose} className="h-12 px-1 text-[15px] font-medium">
          Cancel
        </button>
      </form>
      <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-24">
        {!q.trim() ? (
          <div className="flex flex-col gap-3.5 py-4">
            <Label>People search for</Label>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((p) => (
                <button key={p} type="button" onClick={() => setQ(p)} className="flex h-10 items-center rounded-pill border border-hairline px-3.5 text-sm font-medium">
                  {p}
                </button>
              ))}
            </div>
            <Label>Moving fast this week</Label>
            {data.trending.map((r) => (
              <Link key={r.slug} href={`/products/${r.slug}`} onClick={onClose} className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline-soft py-2.5">
                <Thumb p={r} size={60} />
                <span className="flex flex-col gap-[3px]">
                  {r.brand && <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{r.brand}</span>}
                  <span className="text-[15px] font-medium leading-[1.2]">{r.name}</span>
                </span>
                <span className="text-[15px] font-semibold">{r.price > 0 ? money(r.price) : ""}</span>
              </Link>
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col border-b border-hairline-soft pb-3.5 pt-1.5">
              {sugg.map((s) => {
                const { hit, rest } = splitHit(s, q);
                return (
                  <button key={s} type="button" onClick={() => go(`/search?q=${encodeURIComponent(s)}`)} className="flex min-h-11 items-center gap-2.5 text-left text-[17px] leading-[1.2]">
                    <Search size={14} className="opacity-50" aria-hidden="true" />
                    <span>
                      <strong className="font-semibold">{hit}</strong>
                      {rest}
                    </span>
                  </button>
                );
              })}
            </div>
            {!!chips.length && (
              <div className="flex flex-col gap-2.5 border-b border-hairline-soft py-4">
                <Label>Categories &amp; goals</Label>
                <div className="flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <Link key={c.h} href={c.h} onClick={onClose} className="flex h-10 items-center rounded-pill border border-hairline px-3.5 text-sm font-medium">
                      {c.l}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col pb-1.5 pt-4">
              <span className="pb-1">
                <Label>Products · {res?.total ?? 0}</Label>
              </span>
              {res?.products.map((r) => (
                <Link key={r.slug} href={`/products/${r.slug}`} onClick={onClose} className="grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline-soft py-2.5">
                  <Thumb p={r} size={60} />
                  <span className="flex min-w-0 flex-col gap-[3px]">
                    {r.brand && <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{r.brand}</span>}
                    <span className="text-[15px] font-medium leading-[1.2]">{r.name}</span>
                    {r.specLine && <span className="text-[10px] font-medium uppercase leading-none tracking-[.06em]">{r.specLine}</span>}
                  </span>
                  <span className="text-[15px] font-semibold">{r.price > 0 ? money(r.price) : ""}</span>
                </Link>
              ))}
              {res && !res.total && (
                <p className="py-2 text-[15px] leading-normal text-slate-text">
                  No exact match. Our pharmacist can source an equivalent —{" "}
                  <a href={whatsappLink(`Hello, I'm looking for: ${q}`)} className="text-ink underline" target="_blank" rel="noopener noreferrer">
                    ask on WhatsApp
                  </a>
                  .
                </p>
              )}
              {!!res?.total && (
                <Link href={`/search?q=${encodeURIComponent(q.trim())}`} onClick={onClose} className="link-rule mt-4 self-start">
                  See all {res.total} results →
                </Link>
              )}
            </div>
            {art && (
              <div className="flex flex-col gap-2.5 py-4">
                <Label>From Learn</Label>
                <Link href={art.href} onClick={onClose} className="flex flex-col gap-1.5 bg-paper-shade p-3.5">
                  <span className="font-display text-[22px] font-medium leading-[1.05]">{art.title}</span>
                  <span className="text-[10.5px] font-medium uppercase leading-none tracking-[.12em] text-slate-text">{articleMeta(art)}</span>
                </Link>
              </div>
            )}
          </>
        )}
        <p className="pt-6 text-xs text-slate-text">Free delivery in {site.city} over ${site.freeDeliveryThreshold}.</p>
      </div>
    </div>
  );
}
