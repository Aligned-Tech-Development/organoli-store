"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, LayoutGrid, ListChecks, Search, ShoppingBag } from "lucide-react";
import { cartCount, useCart, useUI } from "@/lib/store";

export function MobileTabBar() {
  const pathname = usePathname();
  const count = useCart((s) => cartCount(s.lines));
  const { overlay, open } = useUI();
  // The product page has its own sticky add bar; the routine finder is full-screen.
  if (pathname.startsWith("/products/") || pathname.startsWith("/routine")) return null;

  const item = "relative flex flex-col items-center justify-center gap-[5px] text-[10.5px] font-medium leading-none tracking-[.06em]";
  const tone = (on: boolean) => (on ? "text-ink" : "text-slate-text");
  const icon = (on: boolean) => ({ size: 22, strokeWidth: 1.75, className: on ? "" : "opacity-60", "aria-hidden": true as const });

  const home = pathname === "/" && overlay === "none";
  const shop = pathname.startsWith("/shop") && overlay === "none";

  return (
    <nav aria-label="Tab bar" className="fixed inset-x-0 bottom-0 z-[70] grid h-[84px] grid-cols-5 border-t border-hairline bg-paper/95 px-1.5 pb-[22px] backdrop-blur-[10px] lg:hidden">
      <Link href="/" className={`${item} ${tone(home)}`} aria-current={home ? "page" : undefined}>
        <House {...icon(home)} />
        Home
      </Link>
      <Link href="/shop" className={`${item} ${tone(shop)}`} aria-current={shop ? "page" : undefined}>
        <LayoutGrid {...icon(shop)} />
        Shop
      </Link>
      <button type="button" onClick={() => open("search")} className={`${item} ${tone(overlay === "search")}`}>
        <Search {...icon(overlay === "search")} />
        Search
      </button>
      <Link href="/routine" className={`${item} ${tone(false)}`}>
        <ListChecks {...icon(false)} />
        Routine
      </Link>
      <button type="button" onClick={() => open("cart")} className={`${item} ${tone(overlay === "cart")}`} aria-label={`Bag, ${count} items`}>
        <ShoppingBag {...icon(overlay === "cart")} />
        Bag
        {count > 0 && <span className="absolute right-[18px] top-2 h-[17px] min-w-[17px] rounded-pill bg-mint px-1 text-center text-[10px] font-semibold leading-[17px] text-ink">{count}</span>}
      </button>
    </nav>
  );
}
