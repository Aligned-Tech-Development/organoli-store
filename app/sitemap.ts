import type { MetadataRoute } from "next";
import { BRAND_PAGE_MIN, brandHref, goalHref } from "@/content/seo";
import { siteUrl } from "@/content/site";
import { getCatalog } from "@/lib/catalog";
import { CATEGORIES, GOALS } from "@/lib/taxonomy";

// A sitemap is cached until the next deploy unless it is dynamic. Built per request from the
// (already cached) catalogue, so new and deleted products show up as quickly as on the site.
export const dynamic = "force-dynamic";

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
    ...GOALS.map((g) => page(goalHref(g.slug), 0.8)),
    // Only brand pages big enough to be indexed (the rest are noindex).
    ...catalog.getBrands().filter((b) => b.productCount >= BRAND_PAGE_MIN).map((b) => page(brandHref(b.slug), 0.6)),
    ...catalog.getProducts().map((p) => page(`/products/${p.slug}`, p.stock === "out" ? 0.4 : 0.7)),
  ];
}
