import type { NextConfig } from "next";
import { legacyRedirects } from "./lib/legacyRedirects";

const nextConfig: NextConfig = {
  // Old WooCommerce URLs → new pages (see lib/legacyRedirects.ts). Next's own trailing-slash redirect
  // runs before custom ones, which would make every old "/product/x/" link two hops; it's switched off
  // and replaced by the last rule in legacyRedirects, so old links redirect once.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return legacyRedirects;
  },
  images: {
    remotePatterns: [
      // Product photos from hader: permanent links that redirect to signed storage URLs. Going through the
      // optimiser means Vercel fetches them server-side (hader's link isn't embeddable cross-site) and caches
      // a resized copy; the redirect is followed without re-checking these patterns.
      new URL("https://api.hader.ai/api/v1/public/product-images/**"),
      // Old WooCommerce media library — only the built-in fallback catalogue still points here.
      new URL("https://organoli.com/wp-content/uploads/**"),
    ],
    qualities: [75, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
