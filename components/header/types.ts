import type { CardProduct } from "@/lib/types";

export interface HeaderData {
  categories: { slug: string; name: string; count: number }[];
  goals: { slug: string; name: string }[];
  totals: { products: number; brands: number };
  trending: CardProduct[];
  newProduct: CardProduct | null;
  sleepEdit: { title: string; count: number; caption: string; image: string };
}
