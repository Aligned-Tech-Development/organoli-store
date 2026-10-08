"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CardProduct, CartLine } from "./types";

export type CartInput = Pick<CardProduct, "slug" | "name" | "brand" | "specLine" | "price"> & { image?: string | null };

interface CartState {
  lines: CartLine[];
  add: (item: CartInput, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (item, qty = 1) => {
        set((s) => {
          const ex = s.lines.find((l) => l.slug === item.slug);
          const lines = ex
            ? s.lines.map((l) => (l.slug === item.slug ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { slug: item.slug, name: item.name, brand: item.brand, specLine: item.specLine, price: item.price, image: item.image ?? null, qty }];
          return { lines };
        });
        useUI.getState().openCart(true);
      },
      setQty: (slug, qty) => set((s) => ({ lines: s.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.max(1, qty) } : l)) })),
      remove: (slug) => set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "organoli-cart", version: 1, storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((a, l) => a + l.qty * l.price, 0);

interface WishState {
  slugs: string[];
  toggle: (slug: string) => void;
}

export const useWishlist = create<WishState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) => set((s) => ({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug] })),
    }),
    { name: "organoli-wishlist", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

type Overlay = "none" | "cart" | "search" | "mega" | "menu";

interface UIState {
  overlay: Overlay;
  bump: number;
  open: (o: Overlay) => void;
  close: () => void;
  openCart: (bump?: boolean) => void;
}

export const useUI = create<UIState>()((set) => ({
  overlay: "none",
  bump: 0,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: "none" }),
  openCart: (bump) => set((s) => ({ overlay: "cart", bump: bump ? s.bump + 1 : s.bump })),
}));
