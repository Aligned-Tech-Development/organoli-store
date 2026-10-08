// Pharmacist-written product content that the WooCommerce export doesn't carry.
// Add an entry per product slug as the pharmacist reviews it; every field is
// optional and each product-page section only renders when its data exists.
// Health claims must be authorised claims only — don't write anything stronger.

export interface ProductEnrichment {
  whyWeChose?: { quote: string; checks?: { h: string; d: string }[] };
  claims?: { h: string; d: string }[];
  howToTake?: { amount: string; amountNote?: string; when: string; whenNote?: string; duration: string; durationNote?: string; summary?: string };
  servingSize?: string;
  servingsPerContainer?: number;
  ingredientsActive?: string;
  ingredientsOther?: string;
  supplementFacts?: { name: string; detail?: string; amount: string; nrv?: string }[];
  suits?: string[];
  notFor?: string[];
  warnings?: string[];
  storage?: string;
  shelfLife?: string;
  /** Compare-table column: "Best for" */
  bestFor?: string;
}

export const productContent: Record<string, ProductEnrichment> = {
  // Example shape (fill in with the pharmacist, then uncomment):
  // "magnesium-glycinate-vimergy-60-capsules": {
  //   whyWeChose: { quote: "…", checks: [{ h: "The right form", d: "…" }] },
  //   howToTake: { amount: "2 capsules", when: "Evening", duration: "4+ weeks" },
  //   servingSize: "2 capsules",
  // },
};

/** Standard food-supplement guidance shown on every product until product-specific warnings are added. */
export const defaultWarnings = [
  "Do not exceed the recommended daily dose stated on the label. Food supplements are not a substitute for a varied, balanced diet and a healthy lifestyle.",
  "Consult your doctor or pharmacist before use if you are pregnant, breastfeeding, taking medication or under medical supervision.",
  "Keep out of reach of young children. Store in a cool, dry place.",
];
