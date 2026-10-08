import Link from "next/link";

/** Type logo with the mint "+" square (placeholder until the official logo files are supplied). */
export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const sq = size === "sm" ? "h-5 w-5 text-base" : "h-[26px] w-[26px] text-[22px]";
  const word = size === "sm" ? "text-2xl" : "text-[30px]";
  return (
    <Link href="/" aria-label="Organoli home" className="flex items-center gap-2.5 text-ink">
      <span aria-hidden="true" className={`flex items-center justify-center bg-mint font-semibold leading-none text-ink ${sq}`}>
        +
      </span>
      <span className={`font-display font-semibold uppercase leading-none tracking-[.08em] ${word}`}>Organoli</span>
    </Link>
  );
}
