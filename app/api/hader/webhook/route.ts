// Receives hader.ai webhooks for the Organoli tenant and refreshes the catalogue
// the moment a product is added, edited or deleted.
//
// Register in hader: URL https://<site>/api/hader/webhook, events
// product_created, product_updated, product_deleted, catalog_changed.
// Put the endpoint's signing secret in HADER_WEBHOOK_SECRET.
//
// Signature: X-Aligned-Signature = "sha256=" + hex(hmac_sha256(secret, timestamp + "." + body)),
// with X-Aligned-Timestamp in unix seconds.
import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { CATALOG_TAG } from "@/lib/hader";

const CATALOG_EVENTS = new Set(["product_created", "product_updated", "product_deleted", "catalog_changed"]);
const MAX_SKEW_SECONDS = 300;

function validSignature(secret: string, timestamp: string, body: string, header: string) {
  const expected = "sha256=" + createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(header);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const secret = process.env.HADER_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });

  const body = await req.text();
  const timestamp = req.headers.get("x-aligned-timestamp") ?? "";
  const signature = req.headers.get("x-aligned-signature") ?? "";
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!timestamp || !Number.isFinite(age) || age > MAX_SKEW_SECONDS) return NextResponse.json({ error: "Stale or missing timestamp" }, { status: 401 });
  if (!validSignature(secret, timestamp, body, signature)) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  const event = req.headers.get("x-aligned-event") ?? (JSON.parse(body) as { event?: string }).event ?? "";
  if (CATALOG_EVENTS.has(event)) {
    // expire: 0 → the next visitor gets fresh data (deleted products disappear right away).
    revalidateTag(CATALOG_TAG, { expire: 0 });
    return NextResponse.json({ ok: true, refreshed: true });
  }
  return NextResponse.json({ ok: true, refreshed: false });
}
