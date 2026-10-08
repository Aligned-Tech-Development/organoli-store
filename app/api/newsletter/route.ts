import { NextResponse } from "next/server";

// Validates the address and forwards it to NEWSLETTER_WEBHOOK_URL when set
// (e.g. a Mailchimp/Brevo/Zapier endpoint). Without it, signups are only logged.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }
  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (hook) {
    const res = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "organoli-store" }) });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
  } else {
    console.info("[newsletter] signup (no NEWSLETTER_WEBHOOK_URL configured):", email);
  }
  return NextResponse.json({ ok: true });
}
