import { edits } from "@/content/editorial";
import { bestSellers } from "@/content/merchandising";
import { getCatalog } from "@/lib/catalog";
import { GOALS } from "@/lib/taxonomy";
import { HeaderClient } from "./HeaderClient";
import type { HeaderData } from "./types";

export async function headerData(): Promise<HeaderData> {
  const catalog = await getCatalog();
  const sleep = edits.find((e) => e.tab === "The Sleep Edit") ?? edits[0];
  return {
    categories: catalog.categoryCounts().map(({ slug, name, count }) => ({ slug, name, count })),
    goals: GOALS.map(({ slug, name }) => ({ slug, name })),
    totals: catalog.totalCounts(),
    trending: catalog.cardsFor(bestSellers).slice(0, 3),
    newProduct: catalog.newArrivals(1)[0] ?? null,
    sleepEdit: { title: sleep.title, count: sleep.steps.length, caption: "evening still life · magnesium, lamp, linen", image: sleep.image },
  };
}

export async function SiteHeader() {
  return <HeaderClient data={await headerData()} />;
}
