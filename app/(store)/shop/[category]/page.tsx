import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/ShopPage";
import { CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/taxonomy";
import type { CategorySlug } from "@/lib/types";

type Params = Promise<{ category: string }>;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const meta = CATEGORY_BY_SLUG[(await params).category as CategorySlug];
  return meta ? { title: meta.name, description: meta.intro } : {};
}

export default async function Page({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { category } = await params;
  if (!(category in CATEGORY_BY_SLUG)) notFound();
  return <ShopPage category={category as CategorySlug} searchParams={await searchParams} />;
}
