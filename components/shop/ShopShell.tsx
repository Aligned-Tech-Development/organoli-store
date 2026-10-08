"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useState, useTransition } from "react";
import { quickFilters } from "@/content/merchandising";
import { useScrollLock } from "@/components/header/MobileOverlays";
import { ProductCard } from "@/components/ProductCard";
import { FILTER_KEYS, activeCount, emptyFilters, filtersToSearch, toggleValue, type FilterKey, type Filters, type Sort } from "@/lib/filters";
import { FORM_USE } from "@/lib/taxonomy";
import { pad2, plural } from "@/lib/format";
import type { CardProduct } from "@/lib/types";

export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface ShopShellProps {
  filters: Filters;
  facets: Record<FilterKey, Facet[]>;
  results: CardProduct[];
  total: number;
  labels: Record<string, string>;
  learn: { title: string; dek: string; href: string; minutes: number };
  showForms: boolean;
  extraParams?: Record<string, string>;
}

const GROUPS: [FilterKey, string][] = [
  ["goal", "Health goal"],
  ["brand", "Brand"],
  ["form", "Ingredient form"],
  ["diet", "Dietary"],
  ["format", "Format"],
];

const PAGE = 24;

export function ShopShell({ filters, facets, results, total, labels, learn, showForms, extraParams = {} }: ShopShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [sideOpen, setSideOpen] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [openG, setOpenG] = useState<Record<string, boolean>>({ goal: true, brand: false, form: false, diet: true, format: false });
  const [shown, setShown] = useState(PAGE);
  useScrollLock(sheet);

  // Reset pagination whenever the result set changes
  const key = JSON.stringify(filters);
  const [lastKey, setLastKey] = useState(key);
  if (key !== lastKey) {
    setLastKey(key);
    setShown(PAGE);
  }

  const go = (f: Filters) => start(() => router.replace(`${pathname}${filtersToSearch(f, extraParams)}`, { scroll: false }));
  const tog = (k: FilterKey, v: string) => go(toggleValue(filters, k, v));
  const has = (k: FilterKey, v: string) => filters[k].includes(v);
  const clearAll = () => go(emptyFilters(filters.sort));
  const nActive = activeCount(filters);

  const active: { label: string; remove: () => void }[] = [];
  for (const k of FILTER_KEYS) for (const v of filters[k]) active.push({ label: labels[`${k}:${v}`] ?? v, remove: () => tog(k, v) });
  if (filters.stock) active.push({ label: "In stock", remove: () => go({ ...filters, stock: false }) });
  if (filters.min != null) active.push({ label: `From $${filters.min}`, remove: () => go({ ...filters, min: null }) });
  if (filters.max != null) active.push({ label: `Up to $${filters.max}`, remove: () => go({ ...filters, max: null }) });

  const visible = results.slice(0, shown);
  const cells: (CardProduct | "learn")[] = [...visible];
  if (cells.length > 3) cells.splice(3, 0, "learn");

  const forms = facets.form.slice(0, 5);

  const chip = (on: boolean) => `flex h-10 flex-none items-center gap-1.5 rounded-pill border px-4 text-sm font-medium leading-none transition-colors duration-200 ${on ? "border-ink bg-ink text-paper" : "border-hairline bg-transparent text-ink hover:border-ink"}`;

  return (
    <>
      {showForms && forms.length >= 2 && (
        <div className="px-4 lg:px-12">
          <div role="group" aria-label="Choose by form" className="no-scrollbar -mx-4 flex overflow-x-auto px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:border lg:border-ink lg:px-0" style={{ gridTemplateColumns: `repeat(${Math.max(forms.length, 1)},minmax(0,1fr))` }}>
            {forms.map((f, i) => {
              const on = has("form", f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => tog("form", f.value)}
                  className={`flex w-[200px] flex-none flex-col items-start gap-2.5 border border-hairline px-[22px] py-5 text-left transition-colors duration-[250ms] lg:w-auto lg:border-0 lg:border-r ${on ? "bg-ink text-paper" : "bg-transparent text-ink hover:bg-paper-shade"}`}
                >
                  <span className="flex w-full justify-between text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] opacity-80">
                    <span>Form {pad2(i + 1)}</span>
                    <span>{f.count}</span>
                  </span>
                  <span className="font-display text-[34px] font-medium leading-none">{f.label}</span>
                  <span className="text-xs font-medium uppercase leading-[1.3] tracking-[.08em]">{FORM_USE[f.value] ?? ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sticky toolbar */}
      <div className="sticky top-[125px] z-20 mt-6 border-y border-hairline bg-paper/95 backdrop-blur-[8px] lg:top-0 lg:mt-8">
        <div className="flex items-center gap-4 px-4 py-3 lg:px-12">
          <button
            type="button"
            onClick={() => setSideOpen((o) => !o)}
            aria-expanded={sideOpen}
            aria-controls="filters"
            className="hidden h-11 flex-none items-center gap-2.5 rounded-sm border border-ink bg-transparent px-4 text-xs font-semibold uppercase leading-none tracking-[.14em] hover:bg-paper-shade lg:flex"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            {sideOpen ? "Hide filters" : "Show filters"}
          </button>
          <button type="button" onClick={() => setSheet(true)} className="flex h-10 flex-none items-center gap-1.5 rounded-pill border border-ink bg-ink px-3.5 text-sm font-medium text-paper lg:hidden">
            <SlidersHorizontal size={14} aria-hidden="true" />
            Filter · {nActive}
          </button>
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto lg:flex-wrap">
            {quickFilters.map((q) => {
              const on = has(q.key, q.value);
              return (
                <button key={q.label} type="button" aria-pressed={on} onClick={() => tog(q.key, q.value)} className={chip(on)}>
                  {q.label}
                  {on && <span aria-hidden="true">×</span>}
                </button>
              );
            })}
            <button type="button" aria-pressed={filters.stock} onClick={() => go({ ...filters, stock: !filters.stock })} className={chip(filters.stock)}>
              In stock{filters.stock && <span aria-hidden="true">×</span>}
            </button>
          </div>
          <span className="hidden flex-none text-sm font-medium leading-none tabular-nums text-slate-text sm:block" aria-live="polite">
            {plural(total, "product")}
          </span>
          <label className="hidden h-11 flex-none items-center gap-2 rounded-sm border border-hairline px-3 lg:flex">
            <span className="text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">Sort</span>
            <select value={filters.sort} onChange={(e) => go({ ...filters, sort: e.target.value as Sort })} className="cursor-pointer border-0 bg-transparent text-sm font-medium text-ink">
              <option value="rec">Recommended</option>
              <option value="new">Newest</option>
              <option value="lo">Price: low to high</option>
              <option value="hi">Price: high to low</option>
            </select>
          </label>
        </div>
        {active.length > 0 && (
          <div className="hidden flex-wrap items-center gap-2 px-12 pb-3 lg:flex">
            {active.map((a) => (
              <button key={a.label} type="button" onClick={a.remove} aria-label={`Remove filter: ${a.label}`} className="flex h-8 items-center gap-2 rounded-pill bg-ink pl-3 pr-2.5 text-[13px] font-medium text-paper">
                {a.label}
                <span className="text-sm opacity-80" aria-hidden="true">
                  ×
                </span>
              </button>
            ))}
            <button type="button" onClick={clearAll} className="h-8 text-[13px] font-medium text-ink underline underline-offset-[3px]">
              Clear all
            </button>
          </div>
        )}
      </div>

      <section className="flex px-4 pb-16 pt-5 lg:px-12 lg:pb-[100px] lg:pt-8">
        <aside
          id="filters"
          aria-label="Filters"
          inert={!sideOpen}
          className="hidden flex-none overflow-hidden transition-[width,opacity,margin] duration-drawer ease-out lg:block"
          style={{ width: sideOpen ? 272 : 0, opacity: sideOpen ? 1 : 0, marginRight: sideOpen ? 40 : 0 }}
        >
          <div className="flex w-[272px] flex-col">
            {GROUPS.map(([k, title]) =>
              facets[k].length ? (
                <div key={k} className="border-t border-hairline">
                  <button
                    type="button"
                    onClick={() => setOpenG((g) => ({ ...g, [k]: !g[k] }))}
                    aria-expanded={!!openG[k]}
                    className="flex h-[54px] w-full items-center justify-between bg-transparent p-0 text-ink"
                  >
                    <span className="text-xs font-semibold uppercase leading-none tracking-[.14em]">
                      {title}
                      {filters[k].length > 0 && <span className="pl-1.5 text-slate-700">· {filters[k].length}</span>}
                    </span>
                    <span aria-hidden="true" className="text-xl font-normal leading-none transition-transform duration-300" style={{ transform: openG[k] ? "rotate(45deg)" : "none" }}>
                      +
                    </span>
                  </button>
                  <div className="grid transition-[grid-template-rows] duration-[350ms] ease-out" style={{ gridTemplateRows: openG[k] ? "1fr" : "0fr" }}>
                    <div className="flex flex-col overflow-hidden" inert={!openG[k]}>
                      <div className={k === "brand" ? "max-h-[340px] overflow-y-auto pr-2" : ""}>
                        {facets[k].map((o) => {
                          const on = has(k, o.value);
                          return (
                            <label key={o.value} className={`flex min-h-[38px] cursor-pointer items-center gap-3 text-[15px] leading-[1.2] ${!o.count && !on ? "opacity-45" : ""}`}>
                              <input type="checkbox" checked={on} onChange={() => tog(k, o.value)} className="peer sr-only" />
                              <span
                                aria-hidden="true"
                                className={`flex h-[18px] w-[18px] flex-none items-center justify-center rounded-sm border border-ink text-xs font-semibold leading-none text-paper transition-colors duration-150 peer-focus-visible:shadow-[0_0_0_2px_#F2F1ED,0_0_0_4px_#24343A] ${on ? "bg-ink" : "bg-transparent"}`}
                              >
                                {on ? "✓" : ""}
                              </span>
                              <span className="flex-1">{o.label}</span>
                              <span className="text-[13px] tabular-nums text-slate-text">{o.count}</span>
                            </label>
                          );
                        })}
                      </div>
                      <div className="h-3.5" />
                    </div>
                  </div>
                </div>
              ) : null,
            )}
            <PriceFields key={`${filters.min}-${filters.max}`} filters={filters} onApply={go} />
            <div className="flex h-[60px] items-center justify-between border-y border-hairline">
              <span id="stock-switch" className="text-xs font-semibold uppercase leading-none tracking-[.14em]">
                In stock only
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={filters.stock}
                aria-labelledby="stock-switch"
                onClick={() => go({ ...filters, stock: !filters.stock })}
                className="h-[26px] w-[46px] rounded-pill border-0 p-[3px] transition-colors duration-200"
                style={{ background: filters.stock ? "#4A656D" : "#CFCCC4" }}
              >
                <span className="block h-5 w-5 rounded-full bg-paper transition-transform duration-[250ms] ease-out" style={{ transform: filters.stock ? "translateX(20px)" : "none" }} />
              </button>
            </div>
          </div>
        </aside>

        <div className={`min-w-0 flex-1 transition-opacity duration-200 ${pending ? "opacity-60" : ""}`}>
          <div className={`grid grid-flow-row-dense content-start gap-x-3 gap-y-8 lg:gap-x-6 lg:gap-y-12 ${sideOpen ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`} style={{ transition: "grid-template-columns .4s" }}>
            {cells.map((c) =>
              c === "learn" ? (
                <Link key="learn" href={learn.href} className="on-dark col-span-2 flex min-h-[260px] flex-col justify-between bg-ink p-7 text-paper lg:col-span-1 lg:min-h-[420px]">
                  <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-mint">Learn · {learn.minutes} min</span>
                  <span className="flex flex-col gap-4">
                    <span className="font-display text-[38px] font-medium leading-[.95] lg:text-[46px]">{learn.title}</span>
                    <span className="text-[15px] leading-normal text-mist">{learn.dek}</span>
                    <span className="text-xs font-semibold uppercase leading-none tracking-[.14em]">Read the guide →</span>
                  </span>
                </Link>
              ) : (
                <ProductCard key={c.slug} p={c} sizes={sideOpen ? "(min-width:1024px) 25vw, 50vw" : "(min-width:1024px) 20vw, 50vw"} />
              ),
            )}
            {total === 0 && (
              <div className="col-span-full flex flex-col items-start gap-3.5 py-[60px]">
                <span className="font-display text-[36px] font-medium leading-none lg:text-[44px]">Nothing on the shelf matches all of that.</span>
                <span className="text-base leading-normal text-slate-text">Remove a filter, or ask our pharmacist — we can often source it within a week.</span>
                <button type="button" onClick={clearAll} className="h-12 rounded-sm border border-ink bg-transparent px-5 text-xs font-semibold uppercase leading-none tracking-[.14em] hover:bg-paper-shade">
                  Clear filters
                </button>
              </div>
            )}
          </div>
          {shown < results.length && (
            <div className="mt-14 flex flex-col items-center gap-3">
              <span className="text-sm text-slate-text">
                Showing {shown} of {results.length}
              </span>
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="h-14 rounded-sm border border-ink px-8 text-[13px] font-semibold uppercase leading-none tracking-[.16em] hover:bg-ink hover:text-paper">
                Show more
              </button>
            </div>
          )}
        </div>
      </section>

      <MobileSheet
        open={sheet}
        onClose={() => setSheet(false)}
        facets={facets}
        filters={filters}
        total={total}
        tog={tog}
        go={go}
        clearAll={clearAll}
      />
    </>
  );
}

function PriceFields({ filters, onApply }: { filters: Filters; onApply: (f: Filters) => void }) {
  const [min, setMin] = useState(filters.min?.toString() ?? "");
  const [max, setMax] = useState(filters.max?.toString() ?? "");
  const apply = () => {
    const n = (s: string) => {
      const v = Number(s.replace(/[^\d.]/g, ""));
      return s.trim() && v > 0 ? v : null;
    };
    const next = { ...filters, min: n(min), max: n(max) };
    if (next.min !== filters.min || next.max !== filters.max) onApply(next);
  };
  const field = "h-11 w-full rounded-sm border border-hairline bg-field px-3 text-[15px] font-normal normal-case tracking-normal text-ink focus:border-ink focus:shadow-halo focus:outline-none";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="flex flex-col gap-3.5 border-t border-hairline py-[18px]"
    >
      <span className="text-xs font-semibold uppercase leading-none tracking-[.14em]">Price</span>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase leading-none tracking-[.12em] text-slate-text">
          Min
          <input inputMode="decimal" value={min} placeholder="$" onChange={(e) => setMin(e.target.value)} onBlur={apply} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-[11px] font-medium uppercase leading-none tracking-[.12em] text-slate-text">
          Max
          <input inputMode="decimal" value={max} placeholder="$" onChange={(e) => setMax(e.target.value)} onBlur={apply} className={field} />
        </label>
      </div>
      <button type="submit" className="sr-only">
        Apply price
      </button>
    </form>
  );
}

function MobileSheet({
  open,
  onClose,
  facets,
  filters,
  total,
  tog,
  go,
  clearAll,
}: {
  open: boolean;
  onClose: () => void;
  facets: Record<FilterKey, Facet[]>;
  filters: Filters;
  total: number;
  tog: (k: FilterKey, v: string) => void;
  go: (f: Filters) => void;
  clearAll: () => void;
}) {
  const pill = (on: boolean) => `h-11 rounded-pill border px-4 text-[15px] font-medium leading-none transition-colors duration-200 ${on ? "border-ink bg-ink text-paper" : "border-hairline bg-transparent text-ink"}`;
  return (
    <div className="lg:hidden">
      <div onClick={onClose} aria-hidden="true" className={`fixed inset-0 z-[80] bg-ink/45 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        inert={!open}
        className={`fixed inset-x-0 bottom-0 z-[90] flex h-[80%] flex-col rounded-t-[18px] bg-paper transition-transform duration-drawer ease-out ${open ? "translate-y-0" : "translate-y-[105%]"}`}
      >
        <span aria-hidden="true" className="mb-1 mt-2.5 h-1 w-10 self-center rounded-sm bg-hairline" />
        <div className="flex items-center justify-between border-b border-hairline px-4 pb-3 pt-1.5">
          <span className="font-display text-[30px] font-medium leading-none">Filter</span>
          <div className="flex items-center gap-1">
            <button type="button" onClick={clearAll} className="h-11 px-2 text-sm font-medium underline underline-offset-[3px]">
              Clear all
            </button>
            <button type="button" onClick={onClose} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
          {GROUPS.map(([k, title]) =>
            facets[k].length ? (
              <div key={k} className="flex flex-col gap-2.5 border-b border-hairline-soft py-4">
                <span className="text-[11px] font-semibold uppercase leading-none tracking-[.14em]">{title}</span>
                <div className="flex flex-wrap gap-2">
                  {facets[k].slice(0, k === "brand" ? 12 : 20).map((o) => {
                    const on = filters[k].includes(o.value);
                    return (
                      <button key={o.value} type="button" aria-pressed={on} onClick={() => tog(k, o.value)} className={pill(on)}>
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null,
          )}
          <div className="flex flex-col gap-2.5 py-4">
            <span className="text-[11px] font-semibold uppercase leading-none tracking-[.14em]">Availability</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" aria-pressed={filters.stock} onClick={() => go({ ...filters, stock: !filters.stock })} className={pill(filters.stock)}>
                In stock
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-hairline px-4 pb-[30px] pt-3">
          <button type="button" onClick={onClose} className="h-[54px] w-full rounded-sm bg-slate-700 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper">
            Show {plural(total, "product")}
          </button>
        </div>
      </div>
    </div>
  );
}
