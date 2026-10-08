import { STATUS_LABEL, type OrderStatus } from "@/lib/orderMeta";

const STEPS: OrderStatus[] = ["placed", "confirmed", "out_for_delivery", "delivered"];

/** Placed → Confirmed → Out for delivery → Delivered, or a cancelled notice. */
export function StatusTracker({ status, compact = false }: { status: OrderStatus; compact?: boolean }) {
  if (status === "cancelled")
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-out-of-stock" />
        Cancelled
      </span>
    );
  const at = STEPS.indexOf(status);
  return (
    <ol className={`m-0 grid list-none grid-cols-4 p-0 ${compact ? "gap-1" : "gap-2"}`} aria-label={`Order status: ${STATUS_LABEL[status]}`}>
      {STEPS.map((s, i) => {
        const done = i <= at;
        return (
          <li key={s} className="flex flex-col gap-2" aria-current={i === at ? "step" : undefined}>
            <span className={`h-1 ${done ? "bg-mint" : "bg-hairline"}`} />
            {!compact && (
              <span className={`text-[10px] font-semibold uppercase leading-[1.2] tracking-[.12em] ${i === at ? "text-ink" : done ? "text-slate-text" : "text-slate-text/60"}`}>{STATUS_LABEL[s]}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
