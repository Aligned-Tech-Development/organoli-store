import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { staffOrders } from "@/app/actions/orders";
import { StatusTracker } from "@/components/orders/StatusTracker";
import { money } from "@/lib/format";
import { ORDER_STATUSES, STATUS_LABEL, itemTitle } from "@/lib/orderMeta";
import { StatusSelect } from "./StatusSelect";

export const metadata: Metadata = { title: "Orders · Staff", robots: { index: false } };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Beirut" });

export default async function StaffOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const orders = await staffOrders(status);
  if (!orders) notFound();

  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Staff</span>
      <h1 className="m-0 mt-4 font-display text-[60px] font-medium leading-[.85] lg:text-[112px]">Orders</h1>

      <nav aria-label="Filter by status" className="mt-8 flex flex-wrap gap-2 border-b border-hairline pb-4">
        {[["", "All"], ...ORDER_STATUSES.map((s) => [s, STATUS_LABEL[s]])].map(([s, l]) => {
          const on = (status ?? "") === s;
          return (
            <Link key={l} href={s ? `/admin/orders?status=${s}` : "/admin/orders"} aria-current={on ? "page" : undefined} className={`flex h-10 items-center rounded-pill border px-4 text-sm font-medium ${on ? "border-ink bg-ink text-paper" : "border-hairline hover:border-ink"}`}>
              {l}
            </Link>
          );
        })}
      </nav>

      {!orders.length && <p className="mt-10 text-lg text-slate-text">No orders{status ? ` with status “${STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}”` : ""} yet.</p>}

      <div className="mt-6 flex flex-col gap-4">
        {orders.map((o) => (
          <article key={o.id} className="grid gap-5 border border-hairline p-5 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
            <div className="flex flex-col gap-1.5">
              <span className="font-display text-[28px] font-medium leading-none">{o.number}</span>
              <span className="text-sm text-slate-text">{dateFmt.format(new Date(o.createdAt))}</span>
              <span className="mt-2 text-[15px] font-medium">{o.name}</span>
              <a href={`tel:${o.phone.replace(/[^\d+]/g, "")}`} className="text-[15px] underline underline-offset-[3px]">
                {o.phone}
              </a>
              {o.email && <span className="text-sm text-slate-text">{o.email}</span>}
              {!o.userId && <span className="mt-1 text-[11px] font-semibold uppercase tracking-[.14em] text-slate-text">Guest</span>}
            </div>
            <div className="flex flex-col gap-3">
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-[15px]">
                {o.items.map((i) => (
                  <li key={i.slug} className="flex justify-between gap-4">
                    <span>
                      {i.qty} × {itemTitle(i)}
                    </span>
                    <span className="tabular-nums">{money(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between border-t border-dashed border-spec-rule pt-2 text-[15px]">
                <span className="text-slate-text">
                  {o.zone} · {o.payment}
                </span>
                <span className="font-semibold tabular-nums">{money(o.subtotal)}</span>
              </div>
              {o.address && <span className="text-sm">{o.address}</span>}
              {o.notes && <span className="text-sm text-slate-text">Note: {o.notes}</span>}
            </div>
            <div className="flex flex-col gap-3">
              <StatusTracker status={o.status} compact />
              <StatusSelect id={o.id} status={o.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
