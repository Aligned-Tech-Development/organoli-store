"use client";

import { useEffect } from "react";
import { useCart, useWishlist } from "@/lib/store";

/** Rehydrates persisted client stores after mount so SSR and first render match. */
export function StoreHydrator() {
  useEffect(() => {
    useCart.persist.rehydrate();
    useWishlist.persist.rehydrate();
  }, []);
  return null;
}
