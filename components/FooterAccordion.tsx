"use client";

import Link from "next/link";
import { useState } from "react";

export function FooterAccordion({ cols }: { cols: { h: string; l: [string, string][] }[] }) {
  const [open, setOpen] = useState(-1);
  return (
    <>
      {cols.map((c, i) => (
        <div key={c.h}>
          <button
            type="button"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex h-14 w-full items-center justify-between border-b border-paper/20 bg-transparent p-0 text-xs font-semibold uppercase leading-none tracking-[.14em] text-paper"
          >
            {c.h}
            <span className="text-xl font-normal leading-none" aria-hidden="true">
              {open === i ? "−" : "+"}
            </span>
          </button>
          <div className="grid transition-[grid-template-rows] duration-[350ms] ease-out" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
            <div className="flex flex-col overflow-hidden" inert={open !== i}>
              <div className="flex flex-col gap-1 pb-[18px] pt-3.5">
                {c.l.map(([label, href]) =>
                  href.startsWith("/") ? (
                    <Link key={label} href={href} className="flex min-h-11 items-center text-[15px]">
                      {label}
                    </Link>
                  ) : (
                    <a key={label} href={href} className="flex min-h-11 items-center text-[15px]" target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
