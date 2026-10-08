"use client";

import Link from "next/link";
import { money, plural } from "@/lib/format";
import { cartCount, cartSubtotal, useCart, useUI, useWishlist } from "@/lib/store";

/** Perforated tear-off stub at the foot of the auth label: what's saved in this browser. */
export function DeviceStub() {
  const lines = useCart((s) => s.lines);
  const saved = useWishlist((s) => s.slugs.length);
  const items = cartCount(lines);
  const notch = "absolute top-0 h-4 w-4 -translate-y-1/2 rounded-full border border-ink bg-paper";

  return (
    <div className="relative border-t border-dashed border-spec-rule bg-paper-shade px-5 pb-5 pt-4 sm:px-8">
      <span aria-hidden="true" className={`${notch} -left-2 [clip-path:inset(0_0_0_50%)]`} />
      <span aria-hidden="true" className={`${notch} -right-2 [clip-path:inset(0_50%_0_0)]`} />
      <span className="text-[10px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">Saved on this device</span>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <button type="button" onClick={() => useUI.getState().openCart()} className="flex flex-col items-start gap-1 text-left">
          <span className="text-[11px] font-medium uppercase leading-none tracking-[.1em] text-slate-text">Bag</span>
          <span className="text-[15px] font-medium leading-[1.2] tabular-nums">{items ? `${plural(items, "item")} · ${money(cartSubtotal(lines))}` : "Empty"}</span>
        </button>
        <Link href="/wishlist" className="flex flex-col items-start gap-1">
          <span className="text-[11px] font-medium uppercase leading-none tracking-[.1em] text-slate-text">Wishlist</span>
          <span className="text-[15px] font-medium leading-[1.2] tabular-nums">{saved ? `${saved} saved` : "Nothing saved yet"}</span>
        </Link>
      </div>
    </div>
  );
}
