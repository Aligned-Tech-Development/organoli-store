import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopPage } from "@/components/shop/ShopPage";
import { GOAL_COPY, goalHref } from "@/content/seo";
import { JsonLd, breadcrumbLd } from "@/lib/structuredData";
import { GOALS, GOAL_BY_SLUG } from "@/lib/taxonomy";
import type { GoalSlug } from "@/lib/types";

type Params = Promise<{ goal: string }>;

export function generateStaticParams() {
  return GOALS.map((g) => ({ goal: g.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = (await params).goal as GoalSlug;
  const copy = GOAL_COPY[slug];
  if (!copy) return {};
  return { title: copy.title, description: copy.description, alternates: { canonical: goalHref(slug) }, openGraph: { title: copy.title } };
}

export default async function GoalPage({ params, searchParams }: { params: Params; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const slug = (await params).goal as GoalSlug;
  const goal = GOAL_BY_SLUG[slug];
  if (!goal) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([["Shop", "/shop"], [goal.name, goalHref(slug)]])} />
      <ShopPage goal={slug} searchParams={await searchParams} />
    </>
  );
}
