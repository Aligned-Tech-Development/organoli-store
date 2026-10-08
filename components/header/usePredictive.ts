"use client";

import { useEffect, useState } from "react";
import type { Predictive } from "@/lib/catalog";

export function usePredictive(query: string) {
  const [data, setData] = useState<Predictive | null>(null);
  const [loading, setLoading] = useState(false);
  const q = query.trim();

  useEffect(() => {
    if (!q) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setData(await res.json());
      } catch {
        /* aborted */
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return { data: q ? data : null, loading };
}

export { articlesFor, splitHit } from "@/lib/articles";
