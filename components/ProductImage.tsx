import Image from "@/components/Img";
import type { ProductImage as Img } from "@/lib/types";

/**
 * Product pack shot. Source images are white-background PNGs, so they are
 * multiplied onto the paper tone to sit naturally in the frame.
 */
export function ProductImage({
  image,
  sizes,
  className = "",
  pad = "8%",
  priority = false,
  label = "Pack shot · 1:1",
}: {
  image: Img | null;
  sizes: string;
  className?: string;
  pad?: string;
  priority?: boolean;
  label?: string;
}) {
  if (!image) {
    return (
      <div className={`ph-paper absolute inset-0 flex items-end p-3.5 ${className}`}>
        <span className="caption text-slate-text">{label}</span>
      </div>
    );
  }
  return (
    <div className={`absolute inset-0 ${className}`} style={{ padding: pad }}>
      <div className="relative h-full w-full">
        <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-contain mix-blend-multiply" />
      </div>
    </div>
  );
}

/**
 * Editorial photograph (public/images). `duotone` renders it in the brand's slate
 * duotone (used for the hero and edits). Fills its positioned parent unless a
 * className gives it its own size.
 */
export function Photo({
  src,
  alt = "",
  sizes,
  className = "absolute inset-0",
  duotone = false,
  priority = false,
}: {
  src: string;
  alt?: string;
  sizes: string;
  className?: string;
  duotone?: boolean;
  priority?: boolean;
}) {
  return (
    <span className={`block overflow-hidden ${/\b(absolute|fixed)\b/.test(className) ? "" : "relative"} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover ${duotone ? "grayscale contrast-[1.08] brightness-[1.04]" : ""}`} />
      {duotone && <span aria-hidden="true" className="absolute inset-0 bg-slate mix-blend-multiply" />}
    </span>
  );
}

/** Striped placeholder with a caption describing the photograph to commission. */
export function Placeholder({
  caption,
  tone = "paper",
  className = "",
  align = "end",
}: {
  caption?: string;
  tone?: "paper" | "slate" | "mint";
  className?: string;
  align?: "start" | "end";
}) {
  const bg = tone === "slate" ? "ph-slate text-paper" : tone === "mint" ? "ph-mint text-ink" : "ph-paper text-slate-text";
  return (
    <div className={`${bg} flex ${align === "end" ? "items-end" : "items-start"} p-[14px] ${className}`} aria-hidden="true">
      {caption && <span className="caption">{caption}</span>}
    </div>
  );
}
