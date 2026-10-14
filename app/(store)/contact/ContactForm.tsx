"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { sendContact } from "@/app/actions/contact";
import { CONTACT_TOPICS } from "@/lib/contactMeta";

const field =
  "h-12 w-full rounded-sm border border-hairline bg-field px-3.5 text-base text-ink placeholder:text-slate-text/70 focus:border-ink focus:shadow-halo focus:outline-none aria-[invalid=true]:border-[#A3473A]";
const labelCls = "text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text";

export function ContactForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ msg: string; field?: string } | null>(null);
  const [sent, setSent] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [form, setForm] = useState({ name: "", email: "", phone: "", topic: CONTACT_TOPICS[0] as string, message: "", website: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (error?.field === k || (k === "phone" && error?.field === "email")) setError(null);
  };
  const err = (k: string) => error?.field === k;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await sendContact({ ...form, startedAt });
      if (res.ok) setSent(true);
      else {
        setError({ msg: res.error, field: res.field });
        if (res.field) document.getElementById(`ct-${res.field}`)?.focus();
      }
    });
  };

  if (sent)
    return (
      <div role="status" className="flex flex-col items-start gap-4 border-t border-ink pt-6">
        <span className="font-display text-[40px] font-medium leading-none lg:text-[54px]">Message sent.</span>
        <p className="m-0 max-w-[480px] text-base leading-[1.55] lg:text-lg">Thank you, {form.name.split(" ")[0]}. A pharmacist will reply {form.email ? "by email" : "by phone or WhatsApp"} — usually within a working day.</p>
        <Link href="/shop" className="link-rule">
          Back to the shelf →
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 border-t border-ink pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Name</span>
          <input id="ct-name" value={form.name} onChange={set("name")} autoComplete="name" required aria-invalid={err("name")} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Topic</span>
          <select value={form.topic} onChange={set("topic")} className={field}>
            {CONTACT_TOPICS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Email</span>
          <input id="ct-email" value={form.email} onChange={set("email")} type="email" autoComplete="email" inputMode="email" aria-invalid={err("email")} className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={labelCls}>Phone or WhatsApp (optional)</span>
          <input id="ct-phone" value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="+961 …" aria-invalid={err("phone")} className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className={labelCls}>Message</span>
        <textarea id="ct-message" value={form.message} onChange={set("message")} rows={6} required aria-invalid={err("message")} className={`${field} h-auto py-3`} />
      </label>
      {/* Honeypot: hidden from people, filled in by bots. */}
      <label aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        Website
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
      </label>
      {error && (
        <p role="alert" className="m-0 border-l-2 border-[#A3473A] bg-[#A3473A]/5 px-3 py-2 text-sm leading-[1.45] text-ink">
          {error.msg}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="h-14 rounded-sm bg-slate-700 px-8 text-[13px] font-semibold uppercase leading-none tracking-[.16em] text-paper transition-[background,transform] hover:bg-ink active:scale-[.985] disabled:bg-out-of-stock">
          {pending ? "Sending…" : "Send message"}
        </button>
        <span className="text-sm text-slate-text">We reply within a working day.</span>
      </div>
    </form>
  );
}
