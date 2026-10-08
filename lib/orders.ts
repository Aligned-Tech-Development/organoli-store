// Orders data access (Neon Postgres). Server-only.
import { neon } from "@neondatabase/serverless";
import { getProduct } from "./catalog";
import { canBuy } from "./format";
import { orderNumber, type Order, type OrderItem, type OrderStatus } from "./orderMeta";

export * from "./orderMeta";

const db = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

type Row = Record<string, unknown>;
const toOrder = (r: Row): Order => ({
  id: Number(r.id),
  number: orderNumber(Number(r.id)),
  userId: (r.user_id as string) ?? null,
  email: (r.email as string) ?? null,
  name: r.name as string,
  phone: r.phone as string,
  zone: r.zone as string,
  address: (r.address as string) ?? null,
  notes: (r.notes as string) ?? null,
  payment: r.payment as string,
  items: r.items as OrderItem[],
  subtotal: Number(r.subtotal),
  status: r.status as OrderStatus,
  createdAt: new Date(r.created_at as string).toISOString(),
  updatedAt: new Date(r.updated_at as string).toISOString(),
});

export interface NewOrderInput {
  userId: string | null;
  email: string | null;
  name: string;
  phone: string;
  zone: string;
  address: string;
  notes: string;
  payment: string;
  lines: { slug: string; qty: number }[];
}

/** Prices and names come from the catalogue, never from the browser. */
export function priceLines(lines: { slug: string; qty: number }[]) {
  const items: OrderItem[] = [];
  const problems: string[] = [];
  for (const l of lines.slice(0, 50)) {
    const p = getProduct(l.slug);
    const qty = Math.min(20, Math.max(1, Math.floor(Number(l.qty) || 0)));
    if (!p) continue;
    if (!canBuy(p)) {
      problems.push(`${p.brand ? `${p.brand} ` : ""}${p.name} is not available right now.`);
      continue;
    }
    items.push({ slug: p.slug, name: p.name, brand: p.brand, specLine: p.specLine, image: p.images[0]?.src ?? null, price: p.price, qty });
  }
  const subtotal = Math.round(items.reduce((a, i) => a + i.price * i.qty, 0) * 100) / 100;
  return { items, subtotal, problems };
}

export async function createOrder(input: NewOrderInput, items: OrderItem[], subtotal: number) {
  const sql = db();
  const rows = await sql`
    insert into orders (user_id, email, name, phone, zone, address, notes, payment, items, subtotal)
    values (${input.userId}, ${input.email}, ${input.name}, ${input.phone}, ${input.zone}, ${input.address || null},
            ${input.notes || null}, ${input.payment}, ${JSON.stringify(items)}::jsonb, ${subtotal})
    returning *`;
  return toOrder(rows[0]);
}

export async function ordersForUser(userId: string) {
  const rows = await db()`select * from orders where user_id = ${userId} order by created_at desc limit 100`;
  return rows.map(toOrder);
}

export async function allOrders(status?: OrderStatus) {
  const sql = db();
  const rows = status
    ? await sql`select * from orders where status = ${status} order by created_at desc limit 300`
    : await sql`select * from orders order by created_at desc limit 300`;
  return rows.map(toOrder);
}

export async function setOrderStatus(id: number, status: OrderStatus) {
  const rows = await db()`update orders set status = ${status}, updated_at = now() where id = ${id} returning *`;
  return rows[0] ? toOrder(rows[0]) : null;
}
