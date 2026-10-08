"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ORDER_STATUSES, PAYMENT_METHODS, ZONES, allOrders, createOrder, ordersForUser, priceLines, setOrderStatus, type Order, type OrderStatus } from "@/lib/orders";
import { isStaff } from "@/lib/staff";

export type PlaceOrderResult = { ok: true; order: Order } | { ok: false; error: string; field?: string };

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function placeOrder(form: {
  name: string;
  phone: string;
  zone: string;
  address: string;
  notes: string;
  payment: string;
  lines: { slug: string; qty: number }[];
}): Promise<PlaceOrderResult> {
  const name = clip(form.name, 120);
  const phone = clip(form.phone, 40);
  const zone = clip(form.zone, 60);
  const address = clip(form.address, 400);
  const notes = clip(form.notes, 600);
  const payment = clip(form.payment, 40);

  if (name.length < 2) return { ok: false, field: "name", error: "Enter the name for the delivery." };
  if (phone.replace(/\D/g, "").length < 7) return { ok: false, field: "phone", error: "Enter a phone number we can call or WhatsApp — at least 7 digits." };
  if (!ZONES.includes(zone)) return { ok: false, field: "zone", error: "Choose a delivery area." };
  if (!zone.startsWith("Click") && address.length < 5) return { ok: false, field: "address", error: "Enter the delivery address — street, building and floor." };
  if (!(PAYMENT_METHODS as readonly string[]).includes(payment)) return { ok: false, field: "payment", error: "Choose how you’d like to pay." };

  const { items, subtotal, problems } = priceLines(Array.isArray(form.lines) ? form.lines : []);
  if (problems.length) return { ok: false, error: `${problems.join(" ")} Remove it from your bag and try again.` };
  if (!items.length) return { ok: false, error: "Your bag is empty." };

  const { userId } = await auth();
  const email = userId ? ((await currentUser())?.primaryEmailAddress?.emailAddress ?? null) : null;

  try {
    const order = await createOrder({ userId: userId ?? null, email, name, phone, zone, address, notes, payment, lines: form.lines }, items, subtotal);
    revalidatePath("/admin/orders");
    return { ok: true, order };
  } catch (e) {
    console.error("[placeOrder]", e);
    return { ok: false, error: "We couldn’t save your order. Try again, or message our pharmacist on WhatsApp." };
  }
}

export async function myOrders(): Promise<Order[] | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return ordersForUser(userId);
}

export async function staffOrders(status?: string): Promise<Order[] | null> {
  if (!(await isStaff())) return null;
  const s = (ORDER_STATUSES as readonly string[]).includes(status ?? "") ? (status as OrderStatus) : undefined;
  return allOrders(s);
}

export async function updateOrderStatus(id: number, status: string): Promise<{ ok: boolean }> {
  if (!(await isStaff())) return { ok: false };
  if (!(ORDER_STATUSES as readonly string[]).includes(status) || !Number.isInteger(id)) return { ok: false };
  const updated = await setOrderStatus(id, status as OrderStatus);
  revalidatePath("/admin/orders");
  return { ok: !!updated };
}
