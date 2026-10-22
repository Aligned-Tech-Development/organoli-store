import type { CardProduct, ProductImage } from "@/lib/types";

export interface HeaderData {
  categories: { slug: string; name: string; short: string; count: number; image: ProductImage | null }[];
  goals: { slug: string; name: string }[];
  totals: { products: number; brands: number };
  trending: CardProduct[];
  newProduct: CardProduct | null;
}
