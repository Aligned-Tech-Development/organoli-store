import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography is served from the existing WooCommerce media library.
    remotePatterns: [new URL("https://organoli.com/wp-content/uploads/**")],
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
