import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileTabBar } from "@/components/MobileTabBar";
import { StoreHydrator } from "@/components/Providers";
import { site } from "@/content/site";
import { bestSellers, pharmacistPicks } from "@/content/merchandising";
import { cardsFor } from "@/lib/catalog";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/components/auth/appearance";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow", display: "swap" });
const barlowCondensed = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-barlow-condensed", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: { default: "Organoli — The shelf people trust", template: "%s · Organoli" },
  description: "Pharmacist-curated supplements in Beirut. Every product checked on arrival and listed with its full specification — dose, form and what it is for.",
  openGraph: { siteName: "Organoli", type: "website", locale: "en_LB" },
};

export const viewport: Viewport = { themeColor: "#F2F1ED" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body className="min-h-dvh bg-paper font-sans text-ink">
        <ClerkProvider appearance={clerkAppearance} signInUrl="/sign-in" signUpUrl="/sign-up">
        <a href="#main" className="sr-only z-[200] rounded-sm bg-ink px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        {children}
        <CartDrawer pairs={cardsFor([...pharmacistPicks, ...bestSellers])} />
        <MobileTabBar />
        <StoreHydrator />
        </ClerkProvider>
      </body>
    </html>
  );
}
