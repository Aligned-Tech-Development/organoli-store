"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { site } from "@/content/site";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Section reveal: opacity + 28px rise over 850ms, once, at 12% visibility. */
export function Reveal({ children, as: Tag = "div", className = "", ...rest }: { children: ReactNode; as?: ElementType; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    el.classList.add("reveal-pending");
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("reveal-in");
        el.classList.remove("reveal-pending");
        io.disconnect();
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}

/** Number that counts up over 1300ms (ease-out cubic) when it scrolls into view. */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const step = (t: number) => {
          const k = Math.min(1, (t - t0) / 1300);
          setVal(Math.round(to * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf = requestAnimationFrame(step);
        };
        setVal(0);
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <span ref={ref}>
      {val.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/** Progress rule that draws in from the left. */
export function DrawRule() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced() || !("IntersectionObserver" in window)) return;
    setOn(false);
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="relative h-0.5 overflow-hidden bg-hairline">
      <div className="absolute inset-0 origin-left bg-ink transition-transform delay-200 duration-[1400ms] ease-out" style={{ transform: on ? "scaleX(1)" : "scaleX(0)" }} />
    </div>
  );
}

/** Minutes until today's dispatch cut-off in Beirut. Null until mounted (avoids hydration mismatch). */
export function useDispatchCountdown() {
  const [mins, setMins] = useState<number | null>(null);
  useEffect(() => {
    const calc = () => {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: site.timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23", weekday: "short" }).formatToParts(new Date());
      const h = Number(parts.find((p) => p.type === "hour")?.value);
      const m = Number(parts.find((p) => p.type === "minute")?.value);
      const day = parts.find((p) => p.type === "weekday")?.value;
      const left = site.dispatchCutoffHour * 60 - (h * 60 + m);
      setMins(day === "Sun" ? -1 : left);
    };
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, []);
  return mins;
}

export function DispatchMessage({ compact = false }: { compact?: boolean }) {
  const mins = useDispatchCountdown();
  if (mins == null) return <span>Next-day delivery in Beirut on orders before {site.dispatchCutoffHour > 12 ? site.dispatchCutoffHour - 12 : site.dispatchCutoffHour} PM</span>;
  if (mins <= 0) return <span>Order now — dispatched {compact ? "next working day" : "on the next working day from Beirut"}</span>;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (
    <span>
      Order in the next{" "}
      <strong className="font-semibold">
        {h ? `${h} h ` : ""}
        {m} min
      </strong>{" "}
      — delivered tomorrow in Beirut
    </span>
  );
}
