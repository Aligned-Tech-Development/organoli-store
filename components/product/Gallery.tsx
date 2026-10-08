"use client";

import Image from "@/components/Img";
import { useRef, useState } from "react";
import { pad2 } from "@/lib/format";
import type { Badge, ProductImage } from "@/lib/types";

export function Gallery({ images, badge, name }: { images: ProductImage[]; badge: Badge | null; name: string }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  const main = (
    <div
      className="relative aspect-square overflow-hidden bg-paper-shade lg:rounded-sm lg:border lg:border-hairline"
      onMouseEnter={() => setZoom(true)}
      onMouseLeave={() => setZoom(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null || n < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) setI((x) => (x + (dx < 0 ? 1 : -1) + n) % n);
        touchX.current = null;
      }}
    >
      {n ? (
        images.map((img, k) => (
          <div
            key={img.src}
            className="absolute inset-0 bg-paper-shade p-[8%] transition-[opacity,transform] duration-[450ms,800ms] ease-[ease,cubic-bezier(.2,.7,.2,1)]"
            style={{ opacity: k === i ? 1 : 0, transform: zoom ? "scale(1.06)" : "scale(1)" }}
            aria-hidden={k !== i}
          >
            <div className="relative h-full w-full">
              <Image src={img.src} alt={k === i ? img.alt || name : ""} fill priority={k === 0} sizes="(min-width:1024px) 50vw, 100vw" className="object-contain mix-blend-multiply" />
            </div>
          </div>
        ))
      ) : (
        <div className="ph-paper absolute inset-0 flex items-start p-4">
          <span className="caption text-slate-text">Pack shot · front</span>
        </div>
      )}
      {["left-3 top-2.5", "right-3 top-2.5", "bottom-2.5 left-3"].map((pos) => (
        <span key={pos} aria-hidden="true" className={`absolute hidden text-xl font-light leading-none text-[#7F959A] lg:block ${pos}`}>
          +
        </span>
      ))}
      {badge && <span className="absolute left-4 top-4 border border-hairline bg-paper px-2.5 py-1.5 text-[10.5px] font-semibold uppercase leading-none tracking-[.14em] lg:left-10 lg:top-5">{badge}</span>}
      {n > 1 && (
        <>
          <span className="absolute bottom-5 right-5 hidden bg-ink px-2.5 py-1.5 text-[11px] font-semibold leading-none tracking-[.1em] text-paper tabular-nums lg:block">
            {pad2(i + 1)} / {pad2(n)}
          </span>
          <div className="absolute inset-x-0 bottom-3.5 flex justify-center gap-1.5 lg:hidden">
            {images.map((img, k) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Image ${k + 1} of ${n}`}
                aria-current={k === i}
                onClick={() => setI(k)}
                className="relative h-6 border-0 bg-transparent p-0 transition-[width] duration-300"
                style={{ width: k === i ? 22 : 10 }}
              >
                <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-[3px] bg-ink transition-opacity" style={{ opacity: k === i ? 1 : 0.3 }} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  if (n < 2) return <div className="lg:sticky lg:top-[calc(var(--hdr,0px)+24px)] lg:transition-[top] lg:duration-300">{main}</div>;

  return (
    <div className="lg:sticky lg:top-[calc(var(--hdr,0px)+24px)] lg:grid lg:transition-[top] lg:duration-300 lg:grid-cols-[84px_minmax(0,1fr)] lg:gap-4">
      <div className="hidden max-h-[calc(100vh-48px)] flex-col gap-2.5 overflow-y-auto lg:flex">
        {images.map((img, k) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Show image ${k + 1}`}
            aria-current={k === i}
            className="relative h-[84px] w-[84px] flex-none rounded-sm border bg-paper-shade p-0 transition-colors duration-200"
            style={{ borderColor: k === i ? "#24343A" : "#CFCCC4" }}
          >
            <Image src={img.src} alt="" fill sizes="84px" className="object-contain p-1.5 mix-blend-multiply" />
          </button>
        ))}
      </div>
      {main}
    </div>
  );
}
