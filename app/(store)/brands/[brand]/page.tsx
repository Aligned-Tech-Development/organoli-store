import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/ShopPage";
import { BRAND_PAGE_MIN, brandHref } from "@/content/seo";
import { getCatalog } from "@/lib/catalog";
import { JsonLd, breadcrumbLd } from "@/lib/structuredData";

type Params = Promise<{ brand: string }>;

export async function generateStaticParams() {
  return (await getCatalog()).getBrands().map((b) => ({ brand: b.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = (await getCatalog()).getBrand((await params).brand);
  if (!b) return {};
  const title = `${b.name} supplements in Lebanon`;
  return {
    title,
    description: `Shop ${b.productCount} ${b.name} product${b.productCount === 1 ? "" : "s"} on Organoli, chosen by a pharmacist. Delivered next day in Beirut, cash on delivery across Lebanon.`,
    alternates: { canonical: brandHref(b.slug) },
    openGraph: { title },
    // A brand with only a few products is too thin a page to put in front of search engines.
    ...(b.productCount < BRAND_PAGE_MIN ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function BrandPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const brand = (await getCatalog()).getBrand((await params).brand);
  if (!brand) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([["Brands", "/brands"], [brand.name, brandHref(brand.slug)]])} />
      <ShopPage brand={brand} searchParams={await searchParams} />
    </>
  );
}
