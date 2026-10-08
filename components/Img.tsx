import NextImage, { type ImageProps } from "next/image";

// Hosts listed in next.config.ts → images.remotePatterns, which Next can optimise.
// Anything else (e.g. photos uploaded in hader.ai, served from its storage) is shown
// as-is, so a new product photo never breaks because its host wasn't configured.
const OPTIMISED_HOSTS = ["organoli.com"];

function optimisable(src: ImageProps["src"]) {
  if (typeof src !== "string") return true;
  // hader photo redirects (/api/hader/img/…) — the browser follows them directly.
  if (src.startsWith("/api/")) return false;
  if (!/^https?:\/\//.test(src)) return true;
  try {
    const host = new URL(src).hostname;
    return OPTIMISED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** Drop-in replacement for next/image that tolerates unknown remote hosts. */
export default function Img(props: ImageProps) {
  return <NextImage {...props} unoptimized={props.unoptimized ?? !optimisable(props.src)} />;
}
