import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/taxonomy";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${siteUrl}${path}`, changeFrequency: "daily", priority });
  return [
    page("/", 1),
    page("/shop", 0.9),
    page("/brands", 0.6),
    page("/routine", 0.6),
    page("/contact", 0.5),
    ...CATEGORIES.map((c) => page(`/shop/${c.slug}`, 0.8)),
    ...catalog.getProducts().map((p) => page(`/products/${p.slug}`, p.stock === "out" ? 0.4 : 0.7)),
  ];
}
