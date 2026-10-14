"use server";

import { emailMessage, markEmailed, saveMessage } from "@/lib/contact";
import { CONTACT_TOPICS } from "@/lib/contactMeta";

export type ContactResult = { ok: true } | { ok: false; error: string; field?: string };

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function sendContact(form: { name: string; email: string; phone: string; topic: string; message: string; website: string; startedAt: number }): Promise<ContactResult> {
  // Bots fill the hidden "website" field or submit instantly; pretend it worked and drop it.
  if (clip(form.website, 200) || Date.now() - Number(form.startedAt) < 2500) return { ok: true };

  const name = clip(form.name, 120);
  const email = clip(form.email, 200).toLowerCase();
  const phone = clip(form.phone, 40);
  const topic = (CONTACT_TOPICS as readonly string[]).includes(form.topic) ? form.topic : CONTACT_TOPICS[CONTACT_TOPICS.length - 1];
  const message = clip(form.message, 4000);

  if (name.length < 2) return { ok: false, field: "name", error: "Enter your name." };
  if (!email && phone.replace(/\D/g, "").length < 7) return { ok: false, field: "email", error: "Leave an email or a phone number so we can reply." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, field: "email", error: "That email address doesn’t look right." };
  if (phone && phone.replace(/\D/g, "").length < 7) return { ok: false, field: "phone", error: "Enter a phone number with at least 7 digits." };
  if (message.length < 10) return { ok: false, field: "message", error: "Tell us a little more — at least a sentence." };

  const m = { name, email, phone, topic, message };
  let id: number;
  try {
    id = await saveMessage(m);
  } catch (e) {
    console.error("[sendContact] save failed", e);
    return { ok: false, error: "We couldn’t send your message. Try again, or message us on WhatsApp." };
  }
  if (await emailMessage(id, m)) await markEmailed(id).catch(() => {});
  return { ok: true };
}
