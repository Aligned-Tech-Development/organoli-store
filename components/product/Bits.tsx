"use client";

import { Info } from "lucide-react";
import { useState } from "react";

export function Warnings({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-ink">
      <button
        id="warnings"
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="warnings-body"
        className="flex w-full scroll-mt-24 items-center justify-between bg-transparent px-5 py-[18px] text-ink"
      >
        <span className="flex items-center gap-3 text-[13px] font-semibold uppercase leading-none tracking-[.14em]">
          <Info size={18} strokeWidth={1.75} aria-hidden="true" />
          Warnings &amp; important information
        </span>
        <span aria-hidden="true" className="text-[22px] font-normal leading-none transition-transform duration-300" style={{ transform: open ? "rotate(45deg)" : "none" }}>
          +
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-[350ms] ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div id="warnings-body" className="overflow-hidden" inert={!open}>
          <ul className="m-0 flex flex-col gap-2 pb-5 pl-[50px] pr-5 text-[15px] leading-normal">
            {items.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MobileTabs({ tabs }: { tabs: { label: string; rows: [string, string][]; text?: string | null }[] }) {
  const [i, setI] = useState(0);
  const t = tabs[i];
  return (
    <div className="mt-2 lg:hidden">
      <div role="tablist" className="grid border-b border-hairline" style={{ gridTemplateColumns: `repeat(${tabs.length},1fr)` }}>
        {tabs.map((x, k) => (
          <button
            key={x.label}
            role="tab"
            aria-selected={k === i}
            onClick={() => setI(k)}
            className="-mb-px h-12 border-0 border-b-2 bg-transparent text-[15px] font-medium leading-none"
            style={{ borderBottomColor: k === i ? "#24343A" : "transparent" }}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="flex flex-col gap-2.5 pt-1 text-[15.5px] leading-[1.55]">
        {t.rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-hairline-soft py-2.5">
            <span className="text-slate-text">{k}</span>
            <span className="text-right font-medium">{v}</span>
          </div>
        ))}
        {t.text && <p className="m-0 whitespace-pre-line pt-1 text-[15px] leading-[1.55]">{t.text}</p>}
      </div>
    </div>
  );
}
