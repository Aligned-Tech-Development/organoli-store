// Catalogue sync health. An uptime monitor (e.g. UptimeRobot) calls this every few
// minutes: it re-reads hader live, answers 200 when the sync is healthy and 503 when
// it isn't, and emails ALERT_EMAIL (default CONTACT_TO_EMAIL) when the sync breaks,
// every 6 hours while it stays broken, and once when it recovers.
import { NextResponse } from "next/server";
import { builtInProducts } from "@/lib/catalog";
import { readSnapshot, readStatus, recordCheck, writeSnapshot, type SyncStatus } from "@/lib/catalogSnapshot";
import { recipients, sendEmail } from "@/lib/email";
import { SyncError, checkShrink, fetchHaderRaws, hashRaws } from "@/lib/hader";

export const dynamic = "force-dynamic";

const MIN_INTERVAL_MS = 60_000; // answer from the last check if asked more often (each check is 16 hader requests)
const REMIND_MS = 6 * 60 * 60_000;
const SITE = "organoli-store";

const body = (s: SyncStatus, extra: Record<string, unknown> = {}) => ({
  ok: s.ok,
  products: s.products,
  lastOkAt: s.lastOkAt,
  lastCheckAt: s.lastCheckAt,
  ...(s.ok ? {} : { error: s.lastError, failingSince: s.lastFailAt }),
  ...extra,
});

export async function GET() {
  let prev: SyncStatus;
  try {
    prev = await readStatus();
  } catch (e) {
    console.error("[health] status table unavailable", e);
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 503 });
  }
  if (prev.lastCheckAt && Date.now() - Date.parse(prev.lastCheckAt) < MIN_INTERVAL_MS) {
    return NextResponse.json(body(prev, { cached: true }), { status: prev.ok ? 200 : 503 });
  }

  const to = recipients(process.env.ALERT_EMAIL ?? process.env.CONTACT_TO_EMAIL);
  try {
    const { raws, imageUrls } = await fetchHaderRaws(builtInProducts(), { fresh: true });
    const snap = await readSnapshot();
    await checkShrink(raws.length, snap?.count, { fresh: true });
    const hash = hashRaws(raws);
    if (snap?.hash !== hash) await writeSnapshot({ raws, imageUrls, count: raws.length, hash });

    let alerted = false;
    if (!prev.ok) {
      alerted = await sendEmail({
        to,
        subject: `[${SITE}] Product sync recovered`,
        text: `The Organoli website is reading products from hader again (${raws.length} products).\n\nIt had been failing since ${prev.lastFailAt ?? "an unknown time"} with: ${prev.lastError ?? "unknown error"}.\nDuring that time the site showed the last good catalogue.`,
      });
    }
    await recordCheck({ ok: true, products: raws.length }, alerted);
    return NextResponse.json(body(await readStatus()));
  } catch (e) {
    const error = e instanceof SyncError ? e.message : `Unexpected error: ${e instanceof Error ? e.message : String(e)}`;
    const due = prev.ok || !prev.lastAlertAt || Date.now() - Date.parse(prev.lastAlertAt) > REMIND_MS;
    let alerted = false;
    if (due) {
      const snap = await readSnapshot().catch(() => null);
      alerted = await sendEmail({
        to,
        subject: `[${SITE}] Product sync ${prev.ok ? "FAILED" : "still failing"}`,
        text: `The Organoli website can't read products from hader.\n\nReason: ${error}\n\n${
          snap ? `Customers still see the last good catalogue (${snap.count} products, saved ${snap.savedAt}). Changes made in hader since then are NOT on the site.` : "There is no saved catalogue, so the site is showing the old built-in product list."
        }\n\nWhat to check: hader API status (https://api.hader.ai/health) and the HADER_API_KEY in Vercel (it needs the read:storefront scope).\nYou'll get another email when it recovers.`,
      });
    }
    await recordCheck({ ok: false, error }, alerted).catch((e2) => console.error("[health] couldn't record the failure", e2));
    console.error("[health] catalogue sync failing:", error);
    return NextResponse.json(body({ ...prev, ok: false, lastError: error, lastFailAt: prev.ok ? new Date().toISOString() : prev.lastFailAt }), { status: 503 });
  }
}
