import NextImage, { type ImageProps } from "next/image";

// URL prefixes allowed by next.config.ts → images.remotePatterns, which Next can optimise.
// Anything else is shown as-is, so a photo never breaks because its host wasn't configured.
// hader's product photos must go through the optimiser: their links can't be embedded
// cross-site directly (Cross-Origin-Resource-Policy: same-site).
const OPTIMISED_PREFIXES = ["https://organoli.com/wp-content/uploads/", "https://api.hader.ai/api/v1/public/product-images/"];

function optimisable(src: ImageProps["src"]) {
  if (typeof src !== "string") return true;
  // Local API routes that redirect elsewhere — the browser follows them directly.
  if (src.startsWith("/api/")) return false;
  if (!/^https?:\/\//.test(src)) return true;
  return OPTIMISED_PREFIXES.some((p) => src.startsWith(p));
}

/** Drop-in replacement for next/image that tolerates unknown remote hosts. */
export default function Img(props: ImageProps) {
  return <NextImage {...props} unoptimized={props.unoptimized ?? !optimisable(props.src)} />;
}
