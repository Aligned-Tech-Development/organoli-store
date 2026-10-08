"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/lib/store";
import type { CardProduct } from "@/lib/types";

export function WishlistGrid({ cards }: { cards: Record<string, CardProduct> }) {
  const slugs = useWishlist((s) => s.slugs);
  const items = slugs.map((s) => cards[s]).filter(Boolean);
  if (!items.length)
    return (
      <div className="mt-10 flex flex-col items-start gap-4">
        <p className="m-0 text-lg">Nothing saved yet. Tap the heart on any product to keep it here.</p>
        <Link href="/shop" className="flex h-12 items-center rounded-sm bg-slate-700 px-5 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
          Shop the shelf
        </Link>
      </div>
    );
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12">
      {items.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}
