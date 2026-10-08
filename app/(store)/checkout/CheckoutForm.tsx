"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { placeOrder } from "@/app/actions/orders";
import { StatusTracker } from "@/components/orders/StatusTracker";
import { site, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { PAYMENT_METHODS, ZONES, type Order, itemTitle } from "@/lib/orderMeta";
import { cartSubtotal, useCart } from "@/lib/store";

const field =
  "h-12 w-full rounded-sm border border-hairline bg-field px-3.5 text-base text-ink placeholder:text-slate-text/70 focus:border-ink focus:shadow-halo focus:outline-none aria-[invalid=true]:border-[#A3473A]";
const labelCls = "text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text";

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 flex flex-col gap-5 border-0 border-t border-ink p-0 pt-5">
      <legend className="float-left mb-1 flex w-full items-baseline gap-3 p-0">
        <span className="text-[13px] font-medium tabular-nums text-slate-text">{n}</span>
        <span className="font-display text-[30px] font-medium leading-none">{title}</span>
      </legend>
      {children}
    </fieldset>
  );
}

export function CheckoutForm({ signedIn, defaults }: { signedIn: boolean; defaults: { name: string; email: string } }) {
  const { lines, clear } = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [form, setForm] = useState({ name: defaults.name, phone: "", zone: ZONES[0], address: "", notes: "", payment: PAYMENT_METHODS[0] as string });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const subtotal = cartSubtotal(lines);
  const freeDelivery = form.zone === "Beirut" && subtotal >= site.freeDeliveryThreshold;
  const collect = form.zone.startsWith("Click");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await placeOrder({ ...form, lines: lines.map((l) => ({ slug: l.slug, qty: l.qty })) });
      if (res.ok) {
        setPlaced(res.order);
        clear();
        window.scrollTo({ top: 0 });
      } else {
        setError({ msg: res.error, field: res.field });
        if (res.field) document.getElementById(`co-${res.field}`)?.focus();
      }
    });
  };

  if (placed) return <Placed order={placed} signedIn={signedIn} />;

  if (!lines.length)
    return (
      <div className="px-4 pb-24 pt-10 lg:px-12 lg:pb-[110px] lg:pt-16">
        <span className="eyebrow">Checkout</span>
        <h1 className="m-0 mt-4 font-display text-[60px] font-medium leading-[.86] lg:text-[112px]">Your bag is empty.</h1>
        <p className="mt-5 max-w-[460px] text-lg">Add something from the shelf first — or answer four questions and we’ll suggest a short list.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/shop" className="flex h-14 items-center rounded-sm bg-slate-700 px-7 text-[13px] font-semibold uppercase tracking-[.16em] text-paper hover:bg-ink">
            Shop the shelf
          </Link>
          <Link href="/routine" className="flex h-14 items-center rounded-sm border border-ink px-7 text-[13px] font-semibold uppercase tracking-[.16em] hover:bg-paper-shade">
            Find your routine
          </Link>
        </div>
      </div>
    );

  const err = (k: string) => error?.field === k;

  return (
    <form onSubmit={submit} noValidate className="px-4 pb-24 pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:items-start lg:gap-16 lg:px-12 lg:pb-[110px] lg:pt-12">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <span className="eyebrow">Checkout</span>
          <h1 className="m-0 font-display text-[56px] font-medium leading-[.86] lg:text-[96px]">Where should it go?</h1>
          <p className="m-0 max-w-[520px] text-base leading-[1.55] lg:text-lg">
            Nothing is charged online. Our pharmacist confirms your order by phone or WhatsApp, then it’s dispatched from {site.city}.
          </p>
          {!signedIn && (
            <p className="m-0 text-sm text-slate-text">
              <Link href="/sign-in?redirect_url=/checkout" className="font-semibold text-ink underline underline-offset-[3px]">
                Sign in
              </Link>{" "}
              to see this order in your account later — or continue as a guest.
            </p>
          )}
        </div>

        <Section n="1" title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Full name</span>
              <input id="co-name" value={form.name} onChange={set("name")} autoComplete="name" required aria-invalid={err("name")} className={field} />
            </label>
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Phone or WhatsApp</span>
              <input id="co-phone" value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="+961 …" required aria-invalid={err("phone")} className={field} />
            </label>
          </div>
          {defaults.email && <span className="text-sm text-slate-text">Order updates will appear in your account ({defaults.email}).</span>}
        </Section>

        <Section n="2" title="Delivery">
          <div role="radiogroup" aria-label="Delivery area" className="grid gap-2 sm:grid-cols-2">
            {site.deliveryZones.map((z) => {
              const on = form.zone === z.zone;
              return (
                <label key={z.zone} className={`flex cursor-pointer items-center justify-between gap-3 rounded-sm border px-4 py-3.5 transition-[border-color,box-shadow] ${on ? "border-ink shadow-[inset_0_0_0_1px_#24343A]" : "border-hairline hover:border-ink"}`}>
                  <input id={on ? "co-zone" : undefined} type="radio" name="zone" value={z.zone} checked={on} onChange={set("zone")} className="sr-only" />
                  <span className="text-[15px] font-medium leading-[1.2]">{z.zone}</span>
                  <span className="text-[13px] text-slate-text">{z.time}</span>
                </label>
              );
            })}
          </div>
          {!collect && (
            <label className="flex flex-col gap-2">
              <span className={labelCls}>Address</span>
              <textarea id="co-address" value={form.address} onChange={set("address")} rows={3} autoComplete="street-address" placeholder="Area, street, building, floor" aria-invalid={err("address")} className={`${field} h-auto py-3`} />
            </label>
          )}
          <label className="flex flex-col gap-2">
            <span className={labelCls}>Notes (optional)</span>
            <input value={form.notes} onChange={set("notes")} placeholder="Best time to call, landmarks…" className={field} />
          </label>
        </Section>

        <Section n="3" title="Payment">
          <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => {
              const on = form.payment === m;
              return (
                <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3.5 transition-[border-color,box-shadow] ${on ? "border-ink shadow-[inset_0_0_0_1px_#24343A]" : "border-hairline hover:border-ink"}`}>
                  <input type="radio" name="payment" value={m} checked={on} onChange={set("payment")} className="sr-only" />
                  <span aria-hidden="true" className={`h-4 w-4 flex-none rounded-full border border-ink ${on ? "bg-ink shadow-[inset_0_0_0_3px_#F2F1ED]" : ""}`} />
                  <span className="text-[15px] font-medium leading-[1.2]">{m}</span>
                </label>
              );
            })}
          </div>
          <span className="text-sm text-slate-text">
            {form.payment === "Whish" ? "We’ll send the Whish payment details when we confirm your order." : "Pay in cash when your order arrives."}
          </span>
        </Section>
      </div>

      {/* Summary */}
      <aside className="mt-12 lg:sticky lg:top-[calc(var(--hdr,0px)+24px)] lg:mt-0">
        <div className="border border-ink bg-paper">
          <div className="on-dark flex h-12 items-center justify-between bg-ink px-5 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-paper/80">
            <span>Your order</span>
            <span>
              {lines.reduce((a, l) => a + l.qty, 0)} item{lines.reduce((a, l) => a + l.qty, 0) === 1 ? "" : "s"}
            </span>
          </div>
          <ul className="m-0 max-h-[340px] list-none overflow-y-auto px-5 py-2">
            {lines.map((l) => (
              <li key={l.slug} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 border-b border-hairline-soft py-3 last:border-b-0">
                <span className="relative h-[52px] w-[52px] border border-hairline bg-paper-hover">{l.image && <Image src={l.image} alt="" fill sizes="52px" className="object-contain p-1 mix-blend-multiply" />}</span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  {l.brand && <span className="text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{l.brand}</span>}
                  <span className="truncate text-[15px] font-medium leading-[1.2]">{l.name}</span>
                  <span className="text-xs text-slate-text">Qty {l.qty}</span>
                </span>
                <span className="text-[15px] font-semibold tabular-nums">{money(l.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2.5 border-t border-dashed border-spec-rule bg-paper-shade px-5 py-4 text-[15px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold tabular-nums">{money(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Delivery</span>
              <span className="text-right text-slate-text">{collect ? "Free — collect in Hamra" : freeDelivery ? "Free" : "Confirmed by our pharmacist"}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-5 pb-5 pt-4">
            {error && (
              <p role="alert" className="m-0 border-l-2 border-[#A3473A] bg-[#A3473A]/5 px-3 py-2 text-sm leading-[1.45] text-ink">
                {error.msg}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-14 rounded-sm bg-slate-700 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-[background,transform] hover:bg-ink active:scale-[.985] disabled:bg-out-of-stock"
            >
              {pending ? "Placing order…" : `Place order · ${money(subtotal)}`}
            </button>
            <span className="text-center text-xs leading-[1.4] text-slate-text">Cash on delivery or Whish · Taxes included · Free returns on unopened items</span>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Placed({ order, signedIn }: { order: Order; signedIn: boolean }) {
  const text = [
    `Hello Organoli, I just placed order ${order.number}.`,
    ...order.items.map((i) => `• ${i.qty} × ${itemTitle(i)}`),
    `Subtotal: ${money(order.subtotal)} · ${order.payment}`,
    `Delivery: ${order.zone}${order.address ? ` — ${order.address}` : ""}`,
  ].join("\n");
  return (
    <div className="px-4 pb-24 pt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:px-12 lg:pb-[110px] lg:pt-16">
      <div className="flex flex-col gap-5">
        <span className="eyebrow">Order placed</span>
        <h1 className="m-0 font-display text-[56px] font-medium leading-[.86] lg:text-[112px]">
          {order.number}
          <span className="text-slate-700">.</span>
        </h1>
        <p className="m-0 max-w-[520px] text-lg leading-[1.55]">
          Thank you, {order.name.split(" ")[0]}. Our pharmacist will confirm your order by phone or WhatsApp — usually within the hour during opening times ({site.counter.hours}).
        </p>
        <div className="max-w-[520px]">
          <StatusTracker status={order.status} />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <a href={whatsappLink(text)} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center rounded-sm bg-slate-700 px-7 text-[13px] font-semibold uppercase tracking-[.16em] text-paper hover:bg-ink">
            Send to our pharmacist on WhatsApp
          </a>
          {signedIn ? (
            <Link href="/account/orders" className="flex h-14 items-center rounded-sm border border-ink px-7 text-[13px] font-semibold uppercase tracking-[.16em] hover:bg-paper-shade">
              Track in your account
            </Link>
          ) : (
            <Link href="/shop" className="flex h-14 items-center rounded-sm border border-ink px-7 text-[13px] font-semibold uppercase tracking-[.16em] hover:bg-paper-shade">
              Keep shopping
            </Link>
          )}
        </div>
        {!signedIn && <p className="m-0 text-sm text-slate-text">Keep your order number — {order.number} — in case you need to ask about it.</p>}
      </div>
      <aside className="mt-10 self-start border border-ink lg:mt-0">
        <div className="on-dark flex h-12 items-center justify-between bg-ink px-5 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-paper/80">
          <span>{order.number}</span>
          <span>{order.payment}</span>
        </div>
        <ul className="m-0 list-none px-5 py-2">
          {order.items.map((i) => (
            <li key={i.slug} className="flex justify-between gap-3 border-b border-hairline-soft py-3 text-[15px] last:border-b-0">
              <span>
                {i.qty} × {itemTitle(i)}
              </span>
              <span className="font-semibold tabular-nums">{money(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-dashed border-spec-rule bg-paper-shade px-5 py-4 text-[15px]">
          <span>Subtotal</span>
          <span className="font-semibold tabular-nums">{money(order.subtotal)}</span>
        </div>
      </aside>
    </div>
  );
}
