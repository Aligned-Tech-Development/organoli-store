export type StockStatus = "in" | "low" | "out";

export type Badge = "Best seller" | "New" | "Pharmacist pick";

export type CategorySlug =
  | "vitamins-minerals"
  | "gut-digestion"
  | "probiotics"
  | "immune"
  | "collagen-beauty"
  | "protein-performance"
  | "hormonal-health"
  | "wellness-care";

export type GoalSlug =
  | "gut-health"
  | "sleep"
  | "energy"
  | "immunity"
  | "stress"
  | "womens-health"
  | "hormonal-support"
  | "skin-beauty"
  | "performance"
  | "daily-essentials";

export type Dietary = "Vegan" | "Vegetarian" | "Gluten-free" | "Dairy-free" | "Soy-free" | "Non-GMO" | "Sugar-free";

export type Format =
  | "Capsule"
  | "Softgel"
  | "Tablet"
  | "Powder"
  | "Liquid"
  | "Gummy"
  | "Sachet"
  | "Spray"
  | "Food"
  | "Personal care";

export interface ProductImage {
  src: string;
  alt: string;
}

/** Shape of each record in data/catalog.json (built by scripts/build-catalog.mjs). */
export interface Product {
  id: number;
  slug: string;
  name: string;
  fullName: string;
  brand: string | null;
  brandSlug: string | null;
  purpose: string | null;
  shortDescription: string | null;
  description: string | null;
  specLine: string | null;
  price: number;
  compareAt: number | null;
  currency: string;
  stock: StockStatus;
  images: ProductImage[];
  category: CategorySlug;
  categories: CategorySlug[];
  sourceCategories: string[];
  goals: GoalSlug[];
  dietary: Dietary[];
  format: Format | null;
  form: string | null;
  dose: string | null;
  count: string | null;
  ingredients: string[];
  permalink: string;
}

export interface Brand {
  slug: string;
  name: string;
  productCount: number;
}

/** A product as rendered on cards and in lists — the catalogue record plus merchandising. */
export interface CardProduct {
  slug: string;
  name: string;
  brand: string | null;
  purpose: string | null;
  specLine: string | null;
  price: number;
  stock: StockStatus;
  image: ProductImage | null;
  image2: ProductImage | null;
  badge: Badge | null;
}

export interface CartLine {
  slug: string;
  name: string;
  brand: string | null;
  specLine: string | null;
  price: number;
  image: string | null;
  qty: number;
}
