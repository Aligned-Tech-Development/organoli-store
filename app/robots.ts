import type { MetadataRoute } from "next";
import { isDemoHost, siteUrl } from "@/content/site";

// The demo on *.vercel.app stays out of search engines; the real domain is open.
export default function robots(): MetadataRoute.Robots {
  if (isDemoHost) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/admin", "/checkout", "/wishlist", "/sign-in", "/sign-up"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
