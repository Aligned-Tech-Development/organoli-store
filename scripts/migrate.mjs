// Creates/updates the database schema. Safe to run repeatedly: `npm run db:migrate`
// Reads DATABASE_URL from the environment or .env.local.
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^DATABASE_URL=(.*)$/);
    if (m) process.env.DATABASE_URL = m[1].replace(/^"|"$/g, "");
  }
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

const sql = neon(process.env.DATABASE_URL);

await sql`
  create table if not exists orders (
    id            bigint generated always as identity primary key,
    user_id       text,
    email         text,
    name          text not null,
    phone         text not null,
    zone          text not null,
    address       text,
    notes         text,
    payment       text not null,
    items         jsonb not null,
    subtotal      numeric(10,2) not null,
    status        text not null default 'placed'
                  check (status in ('placed','confirmed','out_for_delivery','delivered','cancelled')),
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
  )`;
await sql`create index if not exists orders_user_created_idx on orders (user_id, created_at desc)`;
await sql`create index if not exists orders_status_created_idx on orders (status, created_at desc)`;

const [{ count }] = await sql`select count(*)::int as count from orders`;
console.log(`orders table ready (${count} rows)`);
