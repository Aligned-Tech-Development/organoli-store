"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { ORDER_STATUSES, STATUS_LABEL, type OrderStatus } from "@/lib/orderMeta";

export function StatusSelect({ id, status }: { id: number; status: OrderStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-text">Status</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OrderStatus;
          const prev = value;
          setValue(next);
          setFailed(false);
          start(async () => {
            const res = await updateOrderStatus(id, next);
            if (!res.ok) {
              setValue(prev);
              setFailed(true);
            } else router.refresh();
          });
        }}
        className="h-11 rounded-sm border border-ink bg-field px-3 text-[15px] font-medium disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <span aria-live="polite" className="min-h-4 text-xs text-slate-text">
        {pending ? "Saving…" : failed ? "Couldn’t save — try again." : ""}
      </span>
    </label>
  );
}
