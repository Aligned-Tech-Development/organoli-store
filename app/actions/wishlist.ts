"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getCatalog } from "@/lib/catalog";

const MAX_ITEMS = 200;

/** The signed-in user's saved products (stored in Clerk private metadata). */
export async function getWishlist(): Promise<string[] | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await (await clerkClient()).users.getUser(userId);
  const list = (user.privateMetadata as { wishlist?: unknown }).wishlist;
  return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string") : [];
}

export async function saveWishlist(slugs: string[]): Promise<{ ok: boolean }> {
  const { userId } = await auth();
  if (!userId) return { ok: false };
  const catalog = await getCatalog();
  const clean = [...new Set(slugs)].filter((s) => typeof s === "string" && catalog.getProduct(s)).slice(0, MAX_ITEMS);
  await (await clerkClient()).users.updateUserMetadata(userId, { privateMetadata: { wishlist: clean } });
  return { ok: true };
}
