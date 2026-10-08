import type { Metadata } from "next";
import { bestSellers, pharmacistPicks } from "@/content/merchandising";
import { getCatalog } from "@/lib/catalog";
import { RoutineFinder, type QuizProduct } from "./RoutineFinder";

export const metadata: Metadata = {
  title: "Find what fits your routine",
  description: "Four questions, a short list of supplements chosen from what we stock today in Beirut. A shopping guide, not a diagnosis.",
};

export default async function RoutinePage() {
  const catalog = await getCatalog();
  const products: QuizProduct[] = catalog.getProducts()
    .filter((p) => p.stock !== "out" && p.price > 0 && p.goals.length)
    .map((p) => ({
      ...catalog.toCard(p),
      goals: p.goals,
      dietary: p.dietary,
      format: p.format,
      ingredients: p.ingredients,
      rank: (pharmacistPicks.includes(p.slug) ? 30 : 0) + (bestSellers.includes(p.slug) ? 20 : 0) + (p.purpose ? 2 : 0),
    }));
  return <RoutineFinder products={products} />;
}
