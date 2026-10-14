// Contact form messages: saved to Neon first, then emailed to the shop. Server-only.
//
// Email goes through Resend (https://resend.com) when RESEND_API_KEY is set:
//   RESEND_API_KEY      — API key
//   CONTACT_TO_EMAIL    — where messages go (default: site.email)
//   CONTACT_FROM_EMAIL  — sender on a domain verified in Resend, e.g. "Organoli website <website@organoli.com>"
// Without a key the message is still saved, so nothing is lost.
import { neon } from "@neondatabase/serverless";
import { site } from "@/content/site";
import { recipients, sendEmail } from "./email";

export { CONTACT_TOPICS } from "./contactMeta";

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
}

const db = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

let tableReady: Promise<unknown> | null = null;
const ensureTable = () =>
  (tableReady ??= db()`
    create table if not exists contact_messages (
      id bigint generated always as identity primary key,
      name text not null, email text, phone text, topic text not null, message text not null,
      emailed boolean not null default false, created_at timestamptz not null default now()
    )`.catch((e) => {
    tableReady = null;
    throw e;
  }));

export async function saveMessage(m: ContactMessage): Promise<number> {
  await ensureTable();
  const rows = await db()`
    insert into contact_messages (name, email, phone, topic, message)
    values (${m.name}, ${m.email || null}, ${m.phone || null}, ${m.topic}, ${m.message})
    returning id`;
  return Number(rows[0].id);
}

export async function markEmailed(id: number) {
  await db()`update contact_messages set emailed = true where id = ${id}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Returns true when the email was accepted by Resend, false when email isn't configured or failed. */
export async function emailMessage(id: number, m: ContactMessage): Promise<boolean> {
  const to = recipients(process.env.CONTACT_TO_EMAIL ?? site.email);
  const rows: [string, string][] = [
    ["Name", m.name],
    ["Email", m.email || "—"],
    ["Phone / WhatsApp", m.phone || "—"],
    ["Topic", m.topic],
  ];
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${m.message}\n\n— Message #${id} from the contact form on the Organoli website`;
  const html = `<table style="font:14px/1.5 sans-serif;border-collapse:collapse">${rows
    .map(([k, v]) => `<tr><td style="padding:2px 16px 2px 0;color:#4E6870">${k}</td><td>${esc(v)}</td></tr>`)
    .join("")}</table><p style="font:15px/1.6 sans-serif;white-space:pre-wrap;margin:20px 0">${esc(m.message)}</p><p style="font:12px sans-serif;color:#4E6870">Message #${id} from the contact form on the Organoli website.${m.email ? " Reply to this email to answer the customer." : ""}</p>`;
  return sendEmail({ to, subject: `Website message: ${m.topic} — ${m.name}`, text, html, replyTo: m.email || undefined });
}
