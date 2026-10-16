// Landing pages for goals (/goals/<goal>) and brands (/brands/<brand>) — the searches people
// actually make ("supplements for sleep", "Thorne Lebanon") that a shop filter can't rank for.
// Copy describes what products support, never what they treat.
import type { GoalSlug } from "@/lib/types";

export const goalHref = (slug: string) => `/goals/${slug}`;
export const brandHref = (slug: string) => `/brands/${slug}`;

/** Brands with fewer products get a page for visitors, but stay out of search (too thin to rank). */
export const BRAND_PAGE_MIN = 4;

export const GOAL_COPY: Record<GoalSlug, { title: string; description: string; intro: string }> = {
  sleep: {
    title: "Supplements for sleep in Lebanon",
    description: "Magnesium glycinate, L-theanine and melatonin chosen by a pharmacist, for winding down and sleeping through. Delivered next day in Beirut.",
    intro: "For winding down in the evening and sleeping through: magnesium in its calming glycinate form, L-theanine and melatonin. Start with one, take it at the same time each night, and give it two weeks.",
  },
  energy: {
    title: "Supplements for energy and tiredness",
    description: "B vitamins, iron, CoQ10 and vitamin D for everyday energy, chosen by a pharmacist. Cash on delivery across Lebanon.",
    intro: "Ongoing tiredness often comes down to low B12, iron or vitamin D, all common in Lebanon. These are the forms we would choose for steady energy, not a caffeine-style lift.",
  },
  stress: {
    title: "Supplements for stress and anxiety",
    description: "Ashwagandha, magnesium and L-theanine for everyday stress, chosen by a pharmacist. Delivered next day in Beirut.",
    intro: "For busy, stressful stretches: ashwagandha, magnesium and L-theanine to support a calmer day. If anxiety is affecting your life, speak to your doctor first — these support, they don't replace care.",
  },
  immunity: {
    title: "Supplements for immunity",
    description: "Vitamin D3, zinc, vitamin C, colostrum and quercetin for everyday immune support, chosen by a pharmacist in Beirut.",
    intro: "Vitamin D3 and zinc do most of the work for everyday immune function, and most people in Lebanon are low in vitamin D by winter. Vitamin C, colostrum and quercetin complete the shelf.",
  },
  "gut-health": {
    title: "Gut health supplements: probiotics, enzymes and fibre",
    description: "Probiotics, digestive enzymes and fibre for bloating, regularity and digestion, chosen by a pharmacist. Delivered across Lebanon.",
    intro: "Three different jobs: probiotics for the balance of the gut, enzymes for heavy meals and fibre for regularity. Pick the one that matches what you feel, rather than all three at once.",
  },
  "womens-health": {
    title: "Supplements for women's health",
    description: "Iron, folate, omega-3, prenatal formulas and women's multivitamins, chosen by a pharmacist. Delivered next day in Beirut.",
    intro: "Iron, folate and omega-3 cover what women most often run low on, with prenatal formulas for before and during pregnancy. If you're pregnant or trying, check the dose with your doctor.",
  },
  "hormonal-support": {
    title: "Supplements for hormonal balance and PCOS",
    description: "Inositol, vitex and DIM for hormonal balance and PCOS support, chosen by a pharmacist. Delivered across Lebanon.",
    intro: "Myo- and D-chiro-inositol are the most studied option for PCOS, with vitex and DIM for cycle and hormone support. Best taken alongside advice from your doctor or gynaecologist.",
  },
  "skin-beauty": {
    title: "Vitamins for hair, skin and nails",
    description: "Collagen peptides, hyaluronic acid and zinc for skin, hair and nails, chosen by a pharmacist. Delivered next day in Beirut.",
    intro: "Collagen peptides do the heavy lifting — about 10 g a day, as powder or capsules — with hyaluronic acid and zinc for skin, hair and nails. Expect to wait 8–12 weeks to see a difference.",
  },
  performance: {
    title: "Gym and sports supplements",
    description: "Creatine, clean protein and electrolytes for training and recovery, chosen by a pharmacist. Cash on delivery across Lebanon.",
    intro: "Creatine monohydrate is the most researched sports supplement there is. Add clean protein for recovery and electrolytes for long sessions and hot days.",
  },
  "daily-essentials": {
    title: "Daily vitamins: multivitamins, D3 and omega-3",
    description: "Multivitamins, vitamin D3 and omega-3 — the everyday basics, chosen by a pharmacist. Delivered next day in Beirut.",
    intro: "The basics most people benefit from: a good multivitamin, vitamin D3 through the winter and omega-3 if you rarely eat oily fish.",
  },
};
