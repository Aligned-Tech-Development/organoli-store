// Curated product lists. These are editorial choices, not product data —
// edit the slugs here to change what appears in each rail and badge.
// SAMPLE CURATION: chosen from what is in stock today; confirm with the pharmacist.

export const bestSellers = [
  "maxiflora",
  "magnesium-glycinate-vimergy-60-capsules",
  "collagen-peptides-unflavoured-vital-proteins-284g",
  "zinc-30-pure-encapsulations-60-capsules",
  "clean-lean-protein-smooth-vanilla-nuzest-250g",
  "mega-d3-and-mk-7-5000-iu-now-60-capsules",
];

export const pharmacistPicks = [
  "pure-magnesium-bisglycinate-prizmag-90-capsules",
  "methyl-b-complex-biocare-60-capsules",
  "one-per-day-multivitamin-life-extension-60-capsules",
  "digest-basic-probiotics-enzymedica-90-capsules",
];

/** How many of the most recently added in-stock products get the "New" badge. */
export const newArrivalCount = 8;

/** The product on the homepage hero "On the shelf" card. */
export const heroProduct = "magnesium-glycinate-vimergy-60-capsules";

/** Homepage "Shop everyday essentials" chips → category slug. */
export const essentialsTabs = [
  { label: "All", category: null },
  { label: "Vitamins", category: "vitamins-minerals" },
  { label: "Gut", category: "gut-digestion" },
  { label: "Collagen", category: "collagen-beauty" },
  { label: "Protein", category: "protein-performance" },
] as const;

/** Toolbar quick-filter chips on the shop page. */
export const quickFilters = [
  { label: "Vegan", key: "diet", value: "Vegan" },
  { label: "Gluten-free", key: "diet", value: "Gluten-free" },
  { label: "Capsule", key: "format", value: "Capsule" },
  { label: "Powder", key: "format", value: "Powder" },
] as const;
