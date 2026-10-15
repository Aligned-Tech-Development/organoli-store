import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
