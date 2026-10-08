"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { myOrders } from "@/app/actions/orders";
import { whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { STATUS_LABEL, type Order, itemTitle } from "@/lib/orderMeta";
import { StatusTracker } from "./StatusTracker";

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Beirut" });

/** "Orders" page inside the Clerk account panel. */
export function OrdersPanel() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    myOrders()
      .then((o) => setOrders(o ?? []))
      .catch(() => setFailed(true));
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans text-ink">
      <div className="flex flex-col gap-1.5 border-b border-hairline pb-4">
        <h2 className="m-0 font-display text-[30px] font-medium leading-none">Orders</h2>
        <span className="text-[15px] text-slate-text">Everything you’ve ordered while signed in, newest first.</span>
      </div>

      {failed && <p className="m-0 text-[15px]">Your orders couldn’t be loaded. Refresh the page to try again.</p>}
      {!orders && !failed && <p className="m-0 text-[15px] text-slate-text">Loading your orders…</p>}

      {orders && !orders.length && (
        <div className="flex flex-col items-start gap-3 py-6">
          <span className="text-[17px] font-medium">No orders yet.</span>
          <span className="text-[15px] text-slate-text">Orders you place while signed in will appear here with their delivery status.</span>
          <Link href="/shop" className="mt-1 flex h-12 items-center rounded-sm bg-slate-700 px-5 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
            Shop the shelf
          </Link>
        </div>
      )}

      {orders?.map((o) => (
        <article key={o.id} className="flex flex-col gap-4 border border-hairline p-5">
          <header className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="flex items-baseline gap-3">
              <span className="font-display text-[26px] font-medium leading-none">{o.number}</span>
              <span className="text-sm text-slate-text">{dateFmt.format(new Date(o.createdAt))}</span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-slate-text">{STATUS_LABEL[o.status]}</span>
          </header>
          <StatusTracker status={o.status} />
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0 text-[15px]">
            {o.items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-4">
                <Link href={`/products/${i.slug}`} className="hover:text-slate-700">
                  {i.qty} × {itemTitle(i)}
                </Link>
                <span className="tabular-nums">{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-spec-rule pt-3 text-[15px]">
            <span className="text-slate-text">
              {o.zone} · {o.payment}
            </span>
            <span className="flex items-center gap-4">
              <a href={whatsappLink(`Hello Organoli, I have a question about order ${o.number}.`)} target="_blank" rel="noopener noreferrer" className="text-sm underline underline-offset-[3px]">
                Ask about this order
              </a>
              <span className="font-semibold tabular-nums">{money(o.subtotal)}</span>
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}
