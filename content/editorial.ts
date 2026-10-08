// Editorial content from the design handoff (edits, trust points, articles, brand
// stories, pharmacist notes). Product references are catalogue slugs.
import type { CategorySlug } from "@/lib/types";

export interface EditStep {
  time: string;
  label: string;
  product: string;
}

export interface Edit {
  tab: string;
  title: string;
  dek: string;
  window: string;
  caption: string;
  tone: "paper" | "slate" | "mint";
  foot: string;
  steps: EditStep[];
}

export const edits: Edit[] = [
  {
    tab: "Better morning",
    title: "Build your better morning",
    dek: "Four products, in the order you’d take them. Hydrate first, probiotic before food, vitamins with breakfast, protein when you need it.",
    window: "07:00–10:30",
    caption: "Lifestyle · morning kitchen, water glass, open window",
    tone: "paper",
    foot: "Take with food unless noted. That is the whole instruction.",
    steps: [
      { time: "07:00", label: "Hydrate", product: "lime-electrolytes-humantra-20-stick-packets" },
      { time: "07:15", label: "Before breakfast", product: "maxiflora" },
      { time: "08:00", label: "With breakfast", product: "one-per-day-multivitamin-life-extension-60-capsules" },
      { time: "10:30", label: "Mid-morning", product: "clean-lean-protein-smooth-vanilla-nuzest-250g" },
    ],
  },
  {
    tab: "The Sleep Edit",
    title: "The Sleep Edit",
    dek: "An evening routine built around magnesium — the most-asked-about product at our counter — plus two quiet companions.",
    window: "20:00–21:30",
    caption: "Lifestyle · bedside, low lamp, linen, glass jar",
    tone: "slate",
    foot: "Not a sleep aid. Speak to us if you take sedatives.",
    steps: [
      { time: "20:00", label: "With dinner", product: "magnesium-glycinate-vimergy-60-capsules" },
      { time: "21:00", label: "Wind down", product: "ashwagandha-premium-ksm-66-vita-bright-90-capsules" },
      { time: "21:30", label: "Before bed", product: "saffron-natroceutics-30-capsules" },
    ],
  },
  {
    tab: "Gut reset",
    title: "A calmer gut, in three steps",
    dek: "A probiotic for the flora, enzymes for heavy meals, and fibre for regularity — the short list our pharmacist recommends first.",
    window: "daily",
    caption: "Macro · psyllium, capsules, glass of water",
    tone: "mint",
    foot: "Start one product at a time. Give it four weeks.",
    steps: [
      { time: "Morning", label: "Before food", product: "maxiflora" },
      { time: "Meals", label: "With main meal", product: "super-enzymes-now-90-capsules" },
      { time: "Evening", label: "With water", product: "fibermend-thorne-330g" },
    ],
  },
];

export const trustStrip = ["Third-party tested", "Cold-chain stored", "Pharmacist curated", "Next-day Beirut"];

export const trustPoints = [
  { n: "01", h: "Carefully curated", d: "Fewer than one in seven products we review makes the shelf. We tell you why each one did.", v: "1 in 7 accepted", vShort: "1 in 7 accepted" },
  { n: "02", h: "Checked on arrival", d: "Every batch is logged when it lands in Beirut — seal, expiry date, storage temperature.", v: "Every batch", vShort: "Every batch" },
  { n: "03", h: "Trusted formulations", d: "Effective doses, bioavailable forms, third-party testing wherever it exists.", v: "Dose first", vShort: "Dose first" },
  { n: "04", h: "Stored correctly", d: "A climate-controlled stockroom; live probiotics are kept refrigerated until dispatch.", v: "15–25 °C · 2–8 °C", vShort: "15–25 °C" },
  { n: "05", h: "Delivered locally", d: "Dispatched from our own Beirut stockroom, not an overseas warehouse.", v: "Next day, Beirut", vShort: "Next day" },
  { n: "06", h: "Human support", d: "A pharmacist reads every message and answers by name — before and after you buy.", v: "Reply < 1 hour", vShort: "Reply < 1 h" },
];

/** `num: null` means the figure is taken from the live catalogue. */
export const curateSteps = [
  { n: "01", h: "We research", d: "We read the evidence for an ingredient before looking at any brand: which form, what dose, for whom.", short: "Evidence for the ingredient first, brand second.", num: 120, suffix: "+", k: "Ingredient monographs on file" },
  { n: "02", h: "We evaluate", d: "Dose against the evidence, form, excipients, allergens, third-party testing and manufacturing standards.", short: "Dose, form, excipients and testing.", num: null, suffix: "", k: "Brands on the shelf" },
  { n: "03", h: "We select", d: "Only what we would recommend across the counter. If two products do the same job, we keep the better one.", short: "Fewer than one in seven make the shelf.", num: null, suffix: "", k: "Products on the shelf" },
  { n: "04", h: "We stock locally", d: "Imported through authorised distributors, stored correctly in Beirut, checked again before dispatch.", short: "Stored in Beirut, checked on arrival.", num: 100, suffix: "%", k: "Batches checked on arrival" },
];

export const featuredBrands = [
  { slug: "pure-encapsulations", origin: "Massachusetts, USA · hypoallergenic", why: "Clean formulas with no unnecessary fillers — the one we suggest for sensitivities.", caption: "Brand still · white bottles, hard light" },
  { slug: "kiki-health", origin: "London, UK · organic & vegan", why: "Whole-food and organic ingredients, transparently sourced.", caption: "Brand still · pouches and raw ingredients" },
  { slug: "seeking-health", origin: "Washington, USA · active nutrient forms", why: "Methylated and active B vitamins for people who need the ready-to-use forms.", caption: "Brand still · amber bottles on paper" },
];

export interface Article {
  type: string;
  minutes: number;
  title: string;
  dek: string;
  caption: string;
  href: string;
  topics: string[];
}

export const articles: Article[] = [
  { type: "Guide", minutes: 6, title: "Magnesium glycinate vs magnesium malate", dek: "Same mineral, different partner molecule. Glycinate is the evening form; malate suits the daytime. Here is how to choose — and when it doesn’t matter.", caption: "Macro · two magnesium powders side by side", href: "/search?q=magnesium", topics: ["magnesium", "sleep", "glycinate", "malate"] },
  { type: "Guide", minutes: 5, title: "How to choose a probiotic", dek: "Strains, CFU and storage — the three things on the label that matter.", caption: "Macro · probiotic capsules", href: "/shop/probiotics", topics: ["probiotic", "gut", "cfu", "digestion"] },
  { type: "Explainer", minutes: 4, title: "Understanding vitamin D dosage", dek: "IU, micrograms, and why most people in Lebanon are still low in winter.", caption: "Winter light · dropper bottle", href: "/search?q=vitamin%20d", topics: ["vitamin d", "d3", "immunity", "k2"] },
  { type: "Glossary", minutes: 2, title: "What does CFU mean?", dek: "Colony-forming units, and why bigger isn’t automatically better.", caption: "Macro · capsule opened", href: "/shop/probiotics", topics: ["cfu", "probiotic"] },
  { type: "Explainer", minutes: 3, title: "Why form matters more than milligrams", dek: "Glycinate, citrate, picolinate: the partner molecule changes what a mineral is good for.", caption: "Still · mineral forms on paper", href: "/shop/vitamins-minerals", topics: ["magnesium", "zinc", "form", "minerals"] },
  { type: "Guide", minutes: 4, title: "Collagen: powder or capsules?", dek: "How much you actually need per day, and which format makes that easy.", caption: "Macro · collagen powder dissolving", href: "/shop/collagen-beauty", topics: ["collagen", "skin", "beauty"] },
];

export const articleMeta = (a: Article) => `${a.type} · ${a.minutes} min`;

/** Pharmacist's note and Learn tile for each category page. */
export const categoryNotes: Record<CategorySlug | "all", { note: string; link: { label: string; href: string }; learn: { title: string; dek: string; href: string; minutes: number } }> = {
  all: {
    note: "If you’re unsure where to start, filter by goal first — then choose the form you’ll actually take.",
    link: { label: "Find your routine →", href: "/routine" },
    learn: { title: "Why form matters more than milligrams", dek: "Glycinate, citrate, picolinate: the partner molecule changes what a mineral is good for.", href: "/shop/vitamins-minerals", minutes: 3 },
  },
  "vitamins-minerals": {
    note: "If you’re unsure, start with glycinate magnesium in the evening. It’s the gentlest form and the one we’re asked about most.",
    link: { label: "Glycinate vs malate →", href: "/search?q=magnesium" },
    learn: { title: "Which magnesium is right for you?", dek: "Glycinate for evenings, citrate for digestion, malate for the daytime. A one-page guide.", href: "/search?q=magnesium", minutes: 3 },
  },
  "gut-digestion": {
    note: "Start with one product and give it four weeks. Enzymes for heavy meals, fibre for regularity — not both on day one.",
    link: { label: "Build a gut routine →", href: "/routine" },
    learn: { title: "Enzymes, fibre or a probiotic?", dek: "Three different jobs. Here is how to tell which one you need first.", href: "/shop/probiotics", minutes: 4 },
  },
  probiotics: {
    note: "Look at the strains and how it’s stored before the CFU count. A shelf-stable product you take daily beats a big number you forget.",
    link: { label: "How to choose a probiotic →", href: "/shop/probiotics" },
    learn: { title: "How to choose a probiotic", dek: "Strains, CFU and storage — the three things on the label that matter.", href: "/shop/probiotics", minutes: 5 },
  },
  immune: {
    note: "Most people in Lebanon are low in vitamin D by late winter. Check that first before adding anything else.",
    link: { label: "Vitamin D on the shelf →", href: "/search?q=vitamin%20d" },
    learn: { title: "Understanding vitamin D dosage", dek: "IU, micrograms, and why most people in Lebanon are still low in winter.", href: "/search?q=vitamin%20d", minutes: 4 },
  },
  "collagen-beauty": {
    note: "Powder is the easiest way to reach a useful daily amount. Capsules suit travel, but you’ll need several a day.",
    link: { label: "Powder or capsules? →", href: "/shop/collagen-beauty?format=Powder" },
    learn: { title: "Collagen: powder or capsules?", dek: "How much you actually need per day, and which format makes that easy.", href: "/shop/collagen-beauty", minutes: 4 },
  },
  "protein-performance": {
    note: "Creatine monohydrate is the most researched sports supplement there is. Unflavoured, 3–5 g a day, every day.",
    link: { label: "Creatine on the shelf →", href: "/search?q=creatine" },
    learn: { title: "Electrolytes: when water isn’t enough", dek: "Long sessions, hot days and what sodium is actually for.", href: "/search?q=electrolytes", minutes: 3 },
  },
  "hormonal-health": {
    note: "Hormonal products are the ones we most want to talk through with you first — message us before you start.",
    link: { label: "Ask our pharmacist →", href: "/routine" },
    learn: { title: "Inositol, explained", dek: "Myo- and D-chiro-inositol, the 40:1 ratio, and what the research looked at.", href: "/search?q=inositol", minutes: 4 },
  },
  "wellness-care": {
    note: "Everyday care from the same trusted shelf — simple ingredient lists, no unnecessary fragrance.",
    link: { label: "Shop by goal →", href: "/shop" },
    learn: { title: "Castor oil, three ways", dek: "What cold-pressed means, and how people use it at home.", href: "/search?q=castor%20oil", minutes: 2 },
  },
};
