// Order constants and types shared by server and client code.
import { site } from "@/content/site";

export const ORDER_STATUSES = ["placed", "confirmed", "out_for_delivery", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_METHODS = ["Cash on delivery", "Whish"] as const;
export const ZONES: string[] = site.deliveryZones.map((z) => z.zone);

export interface OrderItem {
  slug: string;
  name: string;
  brand: string | null;
  specLine: string | null;
  image: string | null;
  price: number;
  qty: number;
}

export interface Order {
  id: number;
  number: string;
  userId: string | null;
  email: string | null;
  name: string;
  phone: string;
  zone: string;
  address: string | null;
  notes: string | null;
  payment: string;
  items: OrderItem[];
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const orderNumber = (id: number) => `OR-${10000 + id}`;
export const orderIdFromNumber = (n: string) => {
  const m = /^OR-(\d+)$/i.exec(n.trim());
  return m ? Number(m[1]) - 10000 : null;
};

/** "Pure Encapsulations Zinc 30", but just "Maxiflora" when the name already starts with the brand. */
export const itemTitle = (i: { brand: string | null; name: string }) =>
  i.brand && !i.name.toLowerCase().startsWith(i.brand.toLowerCase()) ? `${i.brand} ${i.name}` : i.name;
