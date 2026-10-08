import type { Metadata } from "next";
import { ShopPage } from "@/components/shop/ShopPage";

export const metadata: Metadata = {
  title: "Shop all products",
  description: "Every supplement on the Organoli shelf, filterable by goal, brand, ingredient form, diet and format.",
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ShopPage category={null} searchParams={await searchParams} />;
}
