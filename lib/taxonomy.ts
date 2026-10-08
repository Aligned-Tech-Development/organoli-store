import type { CategorySlug, Dietary, Format, GoalSlug } from "./types";

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  short: string;
  intro: string;
  /** Caption for the tile when no product photo is available. */
  caption: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { slug: "vitamins-minerals", name: "Vitamins & Minerals", short: "Vitamins", intro: "The foundations — vitamin D, B12, magnesium, zinc and iron — in the forms your body can use. Choose by form, or filter by what you need.", caption: "bottles · D3, B12, magnesium" },
  { slug: "gut-digestion", name: "Gut & Digestion", short: "Gut", intro: "Enzymes for heavy meals, fibre for regularity and gentle support for the lining of the gut.", caption: "enzymes, fibre, psyllium" },
  { slug: "probiotics", name: "Probiotics", short: "Probiotics", intro: "Live cultures and prebiotics, chosen by strain and count — not by the biggest number on the label.", caption: "capsules, sachets" },
  { slug: "immune", name: "Immune Support", short: "Immune", intro: "Vitamin C, zinc, selenium, colostrum and quercetin for everyday immune function.", caption: "zinc, vitamin C, colostrum" },
  { slug: "collagen-beauty", name: "Collagen & Beauty", short: "Collagen", intro: "Marine and bovine collagen peptides, powders and capsules, plus the nutrients that support skin, hair and nails.", caption: "powder pouch, capsules" },
  { slug: "protein-performance", name: "Protein & Performance", short: "Protein", intro: "Clean protein, creatine and electrolytes for training, recovery and hot days.", caption: "tins, tubs & sticks" },
  { slug: "hormonal-health", name: "Hormonal Health", short: "Hormonal", intro: "Inositol, thyroid and adrenal support, and women’s and men’s formulas.", caption: "capsules and a notebook" },
  { slug: "wellness-care", name: "Wellness & Care", short: "Wellness", intro: "Oils, superfoods, oral care and natural personal care from the same trusted shelf.", caption: "oils, oral care" },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c])) as Record<CategorySlug, CategoryMeta>;

export interface GoalMeta {
  slug: GoalSlug;
  name: string;
  ingredients: string;
  caption: string;
}

export const GOALS: GoalMeta[] = [
  { slug: "gut-health", name: "Gut Health", ingredients: "Probiotics · enzymes · fibre", caption: "Macro · probiotic capsules on linen" },
  { slug: "sleep", name: "Sleep", ingredients: "Magnesium · glycine · L-theanine", caption: "Evening still life · bedside, low lamp" },
  { slug: "energy", name: "Energy", ingredients: "B vitamins · iron · CoQ10", caption: "Morning run, coastal road, Beirut" },
  { slug: "immunity", name: "Immunity", ingredients: "Vitamin D3 · zinc · vitamin C", caption: "Citrus, zinc tablets, winter light" },
  { slug: "stress", name: "Stress", ingredients: "Ashwagandha · magnesium · rhodiola", caption: "Hands around a warm cup" },
  { slug: "womens-health", name: "Women's Health", ingredients: "Iron · folate · omega-3", caption: "Portrait, natural light, studio" },
  { slug: "hormonal-support", name: "Hormonal Support", ingredients: "Inositol · vitex · DIM", caption: "Still life · capsules and a notebook" },
  { slug: "skin-beauty", name: "Skin & Beauty", ingredients: "Collagen · hyaluronic acid · zinc", caption: "Macro · collagen powder dissolving" },
  { slug: "performance", name: "Performance", ingredients: "Creatine · protein · electrolytes", caption: "Gym floor, chalked hands, shaker" },
  { slug: "daily-essentials", name: "Daily Essentials", ingredients: "Multivitamin · D3 · omega-3", caption: "Breakfast table, weekly pill box" },
];

export const GOAL_BY_SLUG = Object.fromEntries(GOALS.map((g) => [g.slug, g])) as Record<GoalSlug, GoalMeta>;

export const DIETARY: Dietary[] = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Soy-free", "Non-GMO", "Sugar-free"];

export const FORMATS: Format[] = ["Capsule", "Softgel", "Tablet", "Powder", "Liquid", "Gummy", "Sachet", "Spray", "Food", "Personal care"];

/** What each ingredient form is usually chosen for — shown on the category form selector. */
export const FORM_USE: Record<string, string> = {
  Glycinate: "Evening · gentle on the gut",
  Citrate: "Digestion · regularity",
  Malate: "Daytime · energy",
  "L-threonate": "Focus · cognition",
  Taurate: "Heart · calm",
  Picolinate: "Well absorbed",
  Methylated: "Active B vitamins",
  Liposomal: "Liposome delivery",
  Hydrolysed: "Peptides · dissolves easily",
  Marine: "From fish skin",
};
