// Last good hader catalogue and sync health, kept in Neon. Server-only.
//
// When a sync fails the site serves this snapshot instead of falling back to the
// old built-in catalogue, so customers keep seeing the client's latest prices and
// stock. Note: hader photo links in a snapshot are signed for about an hour, so
// photos of an old snapshot can stop loading during a long outage.
import { neon } from "@neondatabase/serverless";
import type { RawProduct } from "./normalize";

export interface Snapshot {
  raws: RawProduct[];
  imageUrls: [string, string][];
  count: number;
  hash: string;
  savedAt: string;
}

export interface SyncStatus {
  ok: boolean;
  lastOkAt: string | null;
  lastFailAt: string | null;
  lastError: string | null;
  lastAlertAt: string | null;
  lastCheckAt: string | null;
  products: number | null;
}

const db = () => {
  const url = process.env.DATABASE_URL;
  return url ? neon(url) : null;
};

let ready: Promise<unknown> | null = null;
const ensureTables = () => {
  const sql = db();
  if (!sql) return Promise.reject(new Error("DATABASE_URL is not set"));
  return (ready ??= Promise.all([
    sql`create table if not exists catalog_snapshot (
          id int primary key default 1 check (id = 1),
          raws jsonb not null, image_urls jsonb not null, count int not null, hash text not null,
          saved_at timestamptz not null default now())`,
    sql`create table if not exists catalog_sync_status (
          id int primary key default 1 check (id = 1),
          ok boolean not null default true, last_ok_at timestamptz, last_fail_at timestamptz,
          last_error text, last_alert_at timestamptz, last_check_at timestamptz, products int)`,
  ]).catch((e) => {
    ready = null;
    throw e;
  }));
};

export async function readSnapshot(): Promise<Snapshot | null> {
  await ensureTables();
  const rows = await db()!`select raws, image_urls, count, hash, saved_at from catalog_snapshot where id = 1`;
  const r = rows[0];
  return r ? { raws: r.raws as RawProduct[], imageUrls: r.image_urls as [string, string][], count: Number(r.count), hash: r.hash as string, savedAt: new Date(r.saved_at as string).toISOString() } : null;
}

export async function writeSnapshot(s: Omit<Snapshot, "savedAt">) {
  await ensureTables();
  await db()!`
    insert into catalog_snapshot (id, raws, image_urls, count, hash, saved_at)
    values (1, ${JSON.stringify(s.raws)}::jsonb, ${JSON.stringify(s.imageUrls)}::jsonb, ${s.count}, ${s.hash}, now())
    on conflict (id) do update set raws = excluded.raws, image_urls = excluded.image_urls, count = excluded.count, hash = excluded.hash, saved_at = now()`;
}

export async function readStatus(): Promise<SyncStatus> {
  await ensureTables();
  const r = (await db()!`select * from catalog_sync_status where id = 1`)[0];
  const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
  return {
    ok: r ? Boolean(r.ok) : true,
    lastOkAt: iso(r?.last_ok_at),
    lastFailAt: iso(r?.last_fail_at),
    lastError: (r?.last_error as string) ?? null,
    lastAlertAt: iso(r?.last_alert_at),
    lastCheckAt: iso(r?.last_check_at),
    products: r?.products == null ? null : Number(r.products),
  };
}

export async function recordCheck(result: { ok: true; products: number } | { ok: false; error: string }, alerted: boolean) {
  await ensureTables();
  const sql = db()!;
  if (result.ok) {
    await sql`
      insert into catalog_sync_status (id, ok, last_ok_at, last_check_at, products, last_alert_at)
      values (1, true, now(), now(), ${result.products}, ${alerted ? new Date().toISOString() : null})
      on conflict (id) do update set ok = true, last_ok_at = now(), last_check_at = now(), products = ${result.products},
        last_alert_at = case when ${alerted} then now() else catalog_sync_status.last_alert_at end`;
  } else {
    await sql`
      insert into catalog_sync_status (id, ok, last_fail_at, last_check_at, last_error, last_alert_at)
      values (1, false, now(), now(), ${result.error}, ${alerted ? new Date().toISOString() : null})
      on conflict (id) do update set ok = false, last_fail_at = now(), last_check_at = now(), last_error = ${result.error},
        last_alert_at = case when ${alerted} then now() else catalog_sync_status.last_alert_at end`;
  }
}
