"use client";

import Image from "@/components/Img";
import Link from "next/link";
import { Search } from "lucide-react";
import { articleMeta } from "@/content/editorial";
import { popularSearches, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import type { Predictive } from "@/lib/catalog";
import type { CardProduct } from "@/lib/types";
import { articlesFor, splitHit } from "./usePredictive";
import { Photo } from "../ProductImage";

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{children}</span>
);

const stockText = { in: "In stock", low: "Low stock", out: "Out of stock" } as const;

function Thumb({ p, size }: { p: CardProduct; size: number }) {
  return (
    <span className="relative flex-none overflow-hidden border border-hairline bg-paper-hover" style={{ width: size, height: size }}>
      {p.image ? <Image src={p.image.src} alt="" fill sizes={`${size}px`} className="object-contain p-1 mix-blend-multiply" /> : <span className="ph-paper absolute inset-0" />}
    </span>
  );
}

/** Desktop dropdown when a query is typed: suggestions · products · Learn. */
export function ResultsPanel({ q, data, onNavigate }: { q: string; data: Predictive | null; onNavigate: () => void }) {
  const sugg = data?.suggestions.length ? data.suggestions : [q.trim().toLowerCase()];
  const arts = articlesFor(q);
  const all = `/search?q=${encodeURIComponent(q.trim())}`;
  return (
    <div className="grid grid-cols-[230px_minmax(0,1fr)_270px]">
      <div className="flex flex-col gap-[22px] border-r border-hairline p-6">
        <div className="flex flex-col gap-2.5">
          <Label>Suggestions</Label>
          {sugg.map((s) => {
            const { hit, rest } = splitHit(s, q);
            return (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} onClick={onNavigate} className="flex items-center gap-2 text-[15px] leading-[1.3] text-ink hover:text-slate-700">
                <Search size={13} className="opacity-50" aria-hidden="true" />
                <span>
                  <strong className="font-semibold">{hit}</strong>
                  {rest}
                </span>
              </Link>
            );
          })}
        </div>
        {!!data?.categories.length && (
          <div className="flex flex-col gap-2.5">
            <Label>Categories</Label>
            {data.categories.map((c) => (
              <Link key={c.slug} href={`/shop/${c.slug}`} onClick={onNavigate} className="flex justify-between text-[15px] leading-[1.3] hover:text-slate-700">
                <span>{c.name}</span>
                <span className="tabular-nums text-slate-text">{c.count}</span>
              </Link>
            ))}
          </div>
        )}
        {!!data?.brands.length && (
          <div className="flex flex-col gap-2.5">
            <Label>Brands</Label>
            <div className="flex flex-wrap gap-1.5">
              {data.brands.map((b) => (
                <Link key={b.slug} href={`/shop?brand=${b.slug}`} onClick={onNavigate} className="rounded-pill border border-hairline px-[11px] py-[7px] text-[13px] font-medium leading-none hover:border-ink">
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        )}
        {!!data?.goals.length && (
          <div className="flex flex-col gap-2.5">
            <Label>Common goals</Label>
            <div className="flex flex-wrap gap-1.5">
              {data.goals.map((g) => (
                <Link key={g.slug} href={`/shop?goal=${g.slug}`} onClick={onNavigate} className="rounded-pill bg-paper-shade px-[11px] py-[7px] text-[13px] font-medium leading-none hover:bg-mint">
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-6">
        <div className="flex items-baseline justify-between pb-3">
          <Label>Products</Label>
          {!!data?.total && <span className="text-[13px] leading-none text-slate-text">{data.total} products</span>}
        </div>
        {data?.products.map((r) => (
          <Link
            key={r.slug}
            href={`/products/${r.slug}`}
            onClick={onNavigate}
            className="-mx-2 grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-sm border-t border-hairline-soft px-2 py-2.5 text-ink hover:bg-paper-hover"
          >
            <Thumb p={r} size={64} />
            <span className="flex min-w-0 flex-col gap-1">
              {r.brand && <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{r.brand}</span>}
              <span className="truncate text-base font-medium leading-[1.2]">{r.name}</span>
              {r.specLine && <span className="text-[11px] font-medium uppercase leading-[1.2] tracking-[.08em]">{r.specLine}</span>}
            </span>
            <span className="flex flex-col items-end gap-1.5">
              <span className="text-base font-semibold leading-none">{r.price > 0 ? money(r.price) : "—"}</span>
              <span className="text-[11.5px] font-medium leading-none text-slate-text">{stockText[r.stock]}</span>
            </span>
          </Link>
        ))}
        {data && !data.total && (
          <p className="my-2 text-[15px] leading-normal text-slate-text">
            No exact match on the shelf. Our pharmacist can source or suggest an equivalent —{" "}
            <a href={whatsappLink(`Hello, I'm looking for: ${q}`)} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
              ask on WhatsApp
            </a>
            .
          </p>
        )}
        <Link href={all} onClick={onNavigate} className="link-rule mt-3 self-start text-ink">
          See all results for “{q.trim()}” →
        </Link>
      </div>
      <div className="flex flex-col gap-4 bg-paper-shade p-6">
        <Label>From Learn</Label>
        {arts.map((a) => (
          <Link key={a.title} href={a.href} onClick={onNavigate} className="flex flex-col gap-2 text-ink">
            <Photo src={a.image} sizes="230px" className="aspect-video" />
            <span className="font-display text-[21px] font-medium leading-[1.05]">{a.title}</span>
            <span className="text-[11px] font-medium uppercase leading-none tracking-[.12em] text-slate-text">{articleMeta(a)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Desktop dropdown before typing: popular searches + trending products. */
export function EmptyPanel({ trending, onPick, onNavigate }: { trending: CardProduct[]; onPick: (q: string) => void; onNavigate: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div className="flex flex-col gap-3.5 border-r border-hairline p-6">
        <Label>People search for</Label>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((q) => (
            <button key={q} type="button" onClick={() => onPick(q)} className="rounded-pill border border-hairline bg-transparent px-3.5 py-[9px] text-sm font-medium leading-none hover:border-ink">
              {q}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm leading-normal text-slate-text">Search by ingredient, brand, goal or form — “vegan protein”, “pure encapsulations”, “sleep”.</p>
      </div>
      <div className="flex flex-col gap-3.5 p-6">
        <Label>Moving fast this week</Label>
        <div className="grid grid-cols-3 gap-3.5">
          {trending.map((r) => (
            <Link key={r.slug} href={`/products/${r.slug}`} onClick={onNavigate} className="flex flex-col gap-1.5 text-ink">
              <span className="relative aspect-square border border-hairline bg-paper-hover">
                {r.image && <Image src={r.image.src} alt="" fill sizes="200px" className="object-contain p-[8%] mix-blend-multiply" />}
              </span>
              {r.brand && <span className="text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{r.brand}</span>}
              <span className="text-[15px] font-medium leading-[1.2]">{r.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Thumb, Label };
