import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

// notFound() from a store page (unknown product, brand, article…). The (store) layout
// already renders the header and footer, so this is just the body.
export default function StoreNotFound() {
  return <NotFoundContent />;
}
