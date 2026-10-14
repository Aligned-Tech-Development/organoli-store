// Sends email through Resend (https://resend.com). Server-only.
//   RESEND_API_KEY      — API key (send-only is enough)
//   CONTACT_FROM_EMAIL  — sender on a domain verified in Resend; defaults to Resend's test sender,
//                         which can only deliver to the Resend account owner.
const DEFAULT_FROM = "Organoli website <onboarding@resend.dev>";

/** Returns true when Resend accepted the email; false when email isn't configured or it failed (logged). */
export async function sendEmail(msg: { to: string[]; subject: string; text: string; html?: string; replyTo?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !msg.to.length) {
    console.info(`[email] not sent (${!key ? "RESEND_API_KEY not set" : "no recipient"}): ${msg.subject}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? DEFAULT_FROM,
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        ...(msg.html ? { html: msg.html } : {}),
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend rejected "${msg.subject}": ${res.status} ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[email] sending "${msg.subject}" failed`, e);
    return false;
  }
}

/** Comma-separated env list → addresses. */
export const recipients = (v: string | undefined) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
