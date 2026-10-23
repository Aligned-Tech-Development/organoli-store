import type { Metadata } from "next";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NotFoundContent } from "@/components/NotFoundContent";

export const metadata: Metadata = { title: "Page not found" };

// Renders for unmatched URLs. It sits above the (store) layout, so it brings its own
// header and footer. notFound() inside the store uses app/(store)/not-found.tsx instead.
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
