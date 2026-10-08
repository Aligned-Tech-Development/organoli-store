import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
