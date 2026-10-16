import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/ShopPage";
import { brandHref, goalHref } from "@/content/seo";

type SP = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (typeof v === "string" && v && !v.includes(",") ? v : null);

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  // /shop?goal=sleep or /shop?brand=thorne (one value, nothing else that narrows it) is the same
  // list as its landing page, so it points search engines there; any other view points to /shop.
  const narrowing = Object.keys(sp).filter((k) => k !== "sort");
  const goal = narrowing.length === 1 ? one(sp.goal) : null;
  const brand = narrowing.length === 1 ? one(sp.brand) : null;
  return {
    title: "Shop all products",
    description: "Every supplement on the Organoli shelf, filterable by goal, brand, ingredient form, diet and format.",
    alternates: { canonical: goal ? goalHref(goal) : brand ? brandHref(brand) : "/shop" },
  };
}

export default async function Page({ searchParams }: { searchParams: SP }) {
  return <ShopPage searchParams={await searchParams} />;
}
