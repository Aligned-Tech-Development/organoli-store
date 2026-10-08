import { edits } from "@/content/editorial";
import { bestSellers } from "@/content/merchandising";
import { cardsFor, categoryCounts, newArrivals, totalCounts } from "@/lib/catalog";
import { GOALS } from "@/lib/taxonomy";
import { HeaderClient } from "./HeaderClient";
import type { HeaderData } from "./types";

export function headerData(): HeaderData {
  const sleep = edits.find((e) => e.tab === "The Sleep Edit") ?? edits[0];
  return {
    categories: categoryCounts().map(({ slug, name, count }) => ({ slug, name, count })),
    goals: GOALS.map(({ slug, name }) => ({ slug, name })),
    totals: totalCounts(),
    trending: cardsFor(bestSellers).slice(0, 3),
    newProduct: newArrivals(1)[0] ?? null,
    sleepEdit: { title: sleep.title, count: sleep.steps.length, caption: "evening still life · magnesium, lamp, linen" },
  };
}

export function SiteHeader() {
  return <HeaderClient data={headerData()} />;
}
