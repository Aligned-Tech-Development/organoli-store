"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { getWishlist, saveWishlist } from "@/app/actions/wishlist";
import { useWishlist } from "@/lib/store";

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/**
 * Keeps the wishlist tied to the signed-in account:
 * - on sign-in, anything saved as a guest is merged into the account's list;
 * - while signed in, every change is saved to the account;
 * - on sign-out, the list is cleared from this device.
 */
export function WishlistSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    let unsub: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const whenHydrated = (fn: () => void) => {
      if (useWishlist.persist.hasHydrated()) fn();
      else unsub = useWishlist.persist.onFinishHydration(fn);
    };

    if (!isSignedIn) {
      // Signed out after being signed in on this page: don't leave their list behind.
      if (syncedFor.current) whenHydrated(() => useWishlist.setState({ slugs: [] }));
      syncedFor.current = null;
      return () => unsub?.();
    }

    whenHydrated(async () => {
      const remote = (await getWishlist()) ?? [];
      if (cancelled) return;
      const local = useWishlist.getState().slugs;
      const merged = [...new Set([...remote, ...local])];
      useWishlist.setState({ slugs: merged });
      if (!sameSet(merged, remote)) await saveWishlist(merged);
      syncedFor.current = userId ?? null;
      // Save subsequent changes (debounced)
      unsub = useWishlist.subscribe((s, prev) => {
        if (sameSet(s.slugs, prev.slugs)) return;
        clearTimeout(timer);
        timer = setTimeout(() => void saveWishlist(s.slugs), 600);
      });
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      unsub?.();
    };
  }, [isLoaded, isSignedIn, userId]);

  return null;
}
