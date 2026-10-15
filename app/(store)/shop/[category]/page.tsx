import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/ShopPage";
import { JsonLd, breadcrumbLd } from "@/lib/structuredData";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/taxonomy";
import type { CategorySlug } from "@/lib/types";

type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const meta = CATEGORY_BY_SLUG[(await params).category as CategorySlug];
  // Canonical drops ?goal / ?sort / filters, so filtered views don't compete with the category page.
  return meta ? { title: meta.name, description: meta.intro, alternates: { canonical: `/shop/${meta.slug}` } } : {};
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { category } = await params;
  if (!(category in CATEGORY_BY_SLUG)) notFound();
  const meta = CATEGORY_BY_SLUG[category as CategorySlug];
  return (
    <>
      <JsonLd data={breadcrumbLd([["Shop", "/shop"], [meta.name, `/shop/${meta.slug}`]])} />
      <ShopPage category={category as CategorySlug} searchParams={await searchParams} />
    </>
  );
}
