import type { MetadataRoute } from "next";
import { isDemoHost, siteUrl } from "@/content/site";

// The demo on *.vercel.app stays out of search engines; the real domain is open.
// Google's testing tools (Rich Results Test, URL Inspection) may still read the demo: they
// never add pages to search, and every demo page also carries noindex.
export default function robots(): MetadataRoute.Robots {
  if (isDemoHost) return { rules: [{ userAgent: "Google-InspectionTool", allow: "/" }, { userAgent: "*", disallow: "/" }] };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/account", "/admin", "/checkout", "/wishlist", "/sign-in", "/sign-up"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
