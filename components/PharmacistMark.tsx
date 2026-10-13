/** The Organoli "+" in a mint circle — stands in for the pharmacist wherever the design had a portrait. */
export function PharmacistMark({ className = "h-11 w-11 text-2xl" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`flex flex-none items-center justify-center rounded-full bg-mint font-medium leading-none text-ink ${className}`}>
      +
    </span>
  );
}
