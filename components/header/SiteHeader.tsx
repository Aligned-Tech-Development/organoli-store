import { bestSellers } from "@/content/merchandising";
import { getCatalog } from "@/lib/catalog";
import { GOALS } from "@/lib/taxonomy";
import { HeaderClient } from "./HeaderClient";
import type { HeaderData } from "./types";

export async function headerData(): Promise<HeaderData> {
  const catalog = await getCatalog();
  return {
    categories: catalog.categoryCounts().map(({ slug, name, short, count, image }) => ({ slug, name, short, count, image })),
    goals: GOALS.map(({ slug, name }) => ({ slug, name })),
    totals: catalog.totalCounts(),
    trending: catalog.cardsFor(bestSellers).slice(0, 3),
    newProduct: catalog.newArrivals(1)[0] ?? null,
  };
}

export async function SiteHeader() {
  return <HeaderClient data={await headerData()} />;
}
