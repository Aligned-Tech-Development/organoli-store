import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { WishlistGrid } from "./WishlistGrid";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const catalog = await getCatalog();
  // Slim lookup so the client can render whichever slugs are saved in localStorage.
  const cards = Object.fromEntries(catalog.getProducts().map((p) => [p.slug, catalog.toCard(p)]));
  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Saved</span>
      <h1 className="m-0 mt-4 font-display text-[60px] font-medium leading-[.85] lg:text-[112px]">Your wishlist</h1>
      <WishlistGrid cards={cards} />
    </div>
  );
}
