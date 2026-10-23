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
  image: string;
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
    image: "/images/edit-morning.jpg",
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
    dek: "An evening routine built around magnesium — the most-asked-about product on our shelf — plus two quiet companions.",
    window: "20:00–21:30",
    caption: "Lifestyle · bedside, low lamp, linen, glass jar",
    image: "/images/edit-sleep.jpg",
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
    image: "/images/edit-gut.jpg",
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
  { n: "03", h: "We select", d: "Only what we would recommend to our own family. If two products do the same job, we keep the better one.", short: "Fewer than one in seven make the shelf.", num: null, suffix: "", k: "Products on the shelf" },
  { n: "04", h: "We stock locally", d: "Imported through authorised distributors, stored correctly in Beirut, checked again before dispatch.", short: "Stored in Beirut, checked on arrival.", num: 100, suffix: "%", k: "Batches checked on arrival" },
];

export const featuredBrands = [
  { slug: "pure-encapsulations", image: "/images/brand-pure.jpg", origin: "Massachusetts, USA · hypoallergenic", why: "Clean formulas with no unnecessary fillers — the one we suggest for sensitivities.", caption: "Brand still · white bottles, hard light" },
  { slug: "kiki-health", image: "/images/brand-kiki.jpg", origin: "London, UK · organic & vegan", why: "Whole-food and organic ingredients, transparently sourced.", caption: "Brand still · pouches and raw ingredients" },
  { slug: "seeking-health", image: "/images/brand-seeking.jpg", origin: "Washington, USA · active nutrient forms", why: "Methylated and active B vitamins for people who need the ready-to-use forms.", caption: "Brand still · amber bottles on paper" },
];

/** One section of an article: an optional subheading, then paragraphs and/or a bullet list. */
export interface ArticleSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Article {
  slug: string;
  type: string;
  minutes: number;
  title: string;
  dek: string;
  caption: string;
  image: string;
  /** The article page. */
  href: string;
  /** Where "Shop the shelf" at the end of the article goes. */
  shop: { label: string; href: string };
  topics: string[];
  body: ArticleSection[];
}

const articleList: Omit<Article, "href">[] = [
  {
    slug: "magnesium-glycinate-vs-malate",
    type: "Guide",
    minutes: 6,
    title: "Magnesium glycinate vs magnesium malate",
    image: "/images/article-magnesium.jpg",
    dek: "Same mineral, different partner molecule. Glycinate is the evening form; malate suits the daytime. Here is how to choose — and when it doesn’t matter.",
    caption: "Macro · two magnesium powders side by side",
    shop: { label: "Shop magnesium", href: "/search?q=magnesium" },
    topics: ["magnesium", "sleep", "glycinate", "malate"],
    body: [
      {
        paragraphs: [
          "Magnesium is involved in hundreds of processes in the body, from muscle and nerve function to energy production and sleep. On its own it isn’t stable, so supplements bind it to a partner molecule. That partner is the word after “magnesium” on the label, and it changes how the product feels to take.",
        ],
      },
      {
        heading: "Magnesium glycinate: the evening form",
        paragraphs: [
          "Glycinate (often sold as bisglycinate) pairs magnesium with glycine, an amino acid. It is well absorbed and among the gentlest forms on the stomach, so it rarely causes the loose stools other forms can.",
          "Glycine itself has a calming role in the nervous system, which is why glycinate is the form most people choose for winding down, sleep and muscle relaxation in the evening.",
        ],
      },
      {
        heading: "Magnesium malate: the daytime form",
        paragraphs: [
          "Malate pairs magnesium with malic acid, a compound the body uses to make energy. It is also well absorbed and generally well tolerated.",
          "People often take malate in the morning or early afternoon, especially for muscle aches or tiredness. The research comparing it directly with other forms is limited, so think of it as a sensible daytime choice rather than a proven energy booster.",
        ],
      },
      {
        heading: "When it doesn’t matter much",
        paragraphs: [
          "If you simply want to top up a low intake, both forms will do the job. The best magnesium is the one you take consistently, at a time of day that suits you.",
        ],
      },
      {
        heading: "Other forms you’ll see",
        list: [
          "Citrate — well absorbed, with a mild laxative effect. Useful if you’re prone to constipation; less so if you’re not.",
          "Oxide — high in magnesium per tablet but poorly absorbed, and the most likely to upset the stomach.",
          "L-threonate — a newer form studied for the brain. Usually more expensive, with a lower dose per capsule.",
        ],
      },
      {
        heading: "Before you start",
        list: [
          "For adults, the usual upper limit from supplements is 350 mg of magnesium a day unless a doctor advises more.",
          "Leave at least two hours between magnesium and some antibiotics, thyroid medication or osteoporosis medication, as it can reduce how well they’re absorbed.",
          "If you have kidney problems, speak to your doctor before taking magnesium.",
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-probiotic",
    type: "Guide",
    minutes: 5,
    title: "How to choose a probiotic",
    image: "/images/article-probiotic.jpg",
    dek: "Strains, CFU and storage — the three things on the label that matter.",
    caption: "Macro · probiotic capsules",
    shop: { label: "Shop probiotics", href: "/shop/probiotics" },
    topics: ["probiotic", "gut", "cfu", "digestion"],
    body: [
      {
        paragraphs: [
          "Probiotic labels are crowded with numbers and Latin names. Three things on that label tell you most of what you need: which strains it contains, how many live organisms it delivers, and how it needs to be stored.",
        ],
      },
      {
        heading: "1. The strains",
        paragraphs: [
          "A full strain name has three parts: the genus, the species and a strain code — for example Lactobacillus rhamnosus GG, or Bifidobacterium lactis BB-12. Different strains of the same species can behave quite differently, and the research is done strain by strain.",
          "A good label lists every strain in full. If it only says “Lactobacillus blend”, you can’t tell whether what’s inside matches the research you’ve read about.",
        ],
      },
      {
        heading: "2. The CFU count",
        paragraphs: [
          "CFU stands for colony-forming units, the number of live organisms per dose. Look for a count that is guaranteed until the expiry date, not just at the time of manufacture — probiotics slowly lose potency on the shelf.",
          "A higher number isn’t automatically better. What matters is that the dose matches what was studied for that strain.",
        ],
      },
      {
        heading: "3. Storage",
        paragraphs: [
          "Some probiotics need the fridge; others are freeze-dried and packaged to be shelf-stable. Neither is better in itself — what matters is following the label. A shelf-stable product you remember to take every day will do more for you than a refrigerated one you forget.",
        ],
      },
      {
        heading: "Giving it a fair trial",
        list: [
          "Start with one product and take it daily for about four weeks before judging it.",
          "Mild bloating in the first few days is common and usually settles.",
          "If you are taking antibiotics, take the probiotic at least two hours apart from them.",
          "If you are immunocompromised, seriously unwell or have a central line, speak to your doctor before taking a probiotic.",
        ],
      },
    ],
  },
  {
    slug: "understanding-vitamin-d-dosage",
    type: "Explainer",
    minutes: 4,
    title: "Understanding vitamin D dosage",
    image: "/images/article-vitamin-d.jpg",
    dek: "IU, micrograms, and why most people in Lebanon are still low in winter.",
    caption: "Winter light · dropper bottle",
    shop: { label: "Shop vitamin D", href: "/search?q=vitamin%20d" },
    topics: ["vitamin d", "d3", "immunity", "k2"],
    body: [
      {
        paragraphs: [
          "Vitamin D supports bones, muscles and the immune system. Your skin makes it in sunlight, which is why it surprises people that low vitamin D is common in Lebanon. Time spent indoors, covered skin, sunscreen and the lower winter sun all mean many people make less than they need.",
        ],
      },
      {
        heading: "IU or micrograms?",
        paragraphs: [
          "Vitamin D is measured in two units, and labels use either or both. The conversion is simple: 1 microgram (mcg or µg) equals 40 IU. So 25 mcg is 1,000 IU, and 50 mcg is 2,000 IU.",
        ],
      },
      {
        heading: "How much is usual?",
        list: [
          "The recommended daily intake for most adults is 600 IU (15 mcg), rising to 800 IU (20 mcg) over the age of 70.",
          "Many people take 1,000–2,000 IU a day through the winter to maintain their levels.",
          "The upper limit for adults is 4,000 IU (100 mcg) a day unless a doctor prescribes more, for example to correct a confirmed deficiency.",
        ],
      },
      {
        heading: "D3, D2, and the K2 question",
        paragraphs: [
          "D3 (cholecalciferol) is the form your skin makes, and it raises blood levels more effectively than D2. Most supplements now use D3; vegan versions are made from lichen.",
          "You’ll often see D3 paired with vitamin K2, because both play a part in how the body uses calcium. It’s a reasonable combination, but the evidence for adding K2 is still developing. If you take a blood thinner such as warfarin, don’t start K2 without speaking to your doctor.",
        ],
      },
      {
        heading: "Getting the most from it",
        list: [
          "Vitamin D is fat-soluble, so take it with a meal that contains some fat.",
          "Drops and soft gels work equally well — choose whichever you’ll take consistently.",
          "A blood test (25-hydroxy vitamin D) is the only way to know your level. If you’ve been tired or achy through the winter, it’s worth asking your doctor for one.",
        ],
      },
    ],
  },
  {
    slug: "what-does-cfu-mean",
    type: "Glossary",
    minutes: 2,
    title: "What does CFU mean?",
    image: "/images/article-cfu.jpg",
    dek: "Colony-forming units, and why bigger isn’t automatically better.",
    caption: "Macro · capsule opened",
    shop: { label: "Shop probiotics", href: "/shop/probiotics" },
    topics: ["cfu", "probiotic"],
    body: [
      {
        paragraphs: [
          "CFU stands for colony-forming units. It is the number of live bacteria or yeasts in a dose that are able to grow and multiply. You’ll see it on probiotic labels as a figure in billions — “10 billion CFU”, for example.",
        ],
      },
      {
        heading: "Why bigger isn’t automatically better",
        paragraphs: [
          "Studies are done on specific strains at specific doses, and some well-researched strains work at a few billion CFU. A product with 100 billion CFU of strains that haven’t been studied for your concern isn’t more useful than one with 5 billion of the right strain.",
          "Very high counts can also cause more bloating when you start.",
        ],
      },
      {
        heading: "What to look for on the label",
        list: [
          "A CFU count guaranteed at expiry, not “at time of manufacture”.",
          "Every strain named in full, ideally with the CFU per strain.",
          "Clear storage instructions — and follow them, because heat and moisture reduce the live count.",
        ],
      },
    ],
  },
  {
    slug: "why-form-matters",
    type: "Explainer",
    minutes: 3,
    title: "Why form matters more than milligrams",
    image: "/images/article-form.jpg",
    dek: "Glycinate, citrate, picolinate: the partner molecule changes what a mineral is good for.",
    caption: "Still · mineral forms on paper",
    shop: { label: "Shop vitamins & minerals", href: "/shop/vitamins-minerals" },
    topics: ["magnesium", "zinc", "form", "minerals"],
    body: [
      {
        paragraphs: [
          "Minerals in supplements are always bound to something else — a salt or an amino acid. That partner affects how much of the mineral you absorb, how kind it is to your stomach, and sometimes what it’s best used for.",
        ],
      },
      {
        heading: "Read the elemental amount",
        paragraphs: [
          "Labels can list the weight of the whole compound or just the mineral itself, called the elemental amount. 500 mg of magnesium glycinate contains far less than 500 mg of magnesium, because most of that weight is glycine. When comparing products, compare the elemental figure.",
        ],
      },
      {
        heading: "Common forms, compared",
        list: [
          "Magnesium — glycinate is gentle and calming; citrate is well absorbed and mildly laxative; oxide packs a lot per tablet but is poorly absorbed.",
          "Zinc — picolinate, citrate and bisglycinate are well absorbed; take zinc with food if it makes you feel sick on an empty stomach.",
          "Iron — bisglycinate tends to cause less constipation and nausea than ferrous sulphate.",
          "Calcium — carbonate needs stomach acid, so take it with a meal; citrate is absorbed with or without food.",
        ],
      },
      {
        heading: "The short version",
        paragraphs: [
          "A slightly lower dose in a form you absorb well and tolerate will usually serve you better than a big number on the front of the pack. If you’re not sure which form suits you, ask our pharmacist.",
        ],
      },
    ],
  },
  {
    slug: "collagen-powder-or-capsules",
    type: "Guide",
    minutes: 4,
    title: "Collagen: powder or capsules?",
    image: "/images/article-collagen.jpg",
    dek: "How much you actually need per day, and which format makes that easy.",
    caption: "Macro · collagen powder dissolving",
    shop: { label: "Shop collagen", href: "/shop/collagen-beauty" },
    topics: ["collagen", "skin", "beauty"],
    body: [
      {
        paragraphs: [
          "Collagen is the main structural protein in skin, joints and connective tissue. Supplements contain hydrolysed collagen, also called collagen peptides — collagen broken into small pieces so it dissolves easily and is absorbed.",
        ],
      },
      {
        heading: "How much do you need?",
        paragraphs: [
          "Most studies on skin and joints have used between 2.5 g and 10 g of collagen peptides a day, taken for at least 8–12 weeks. That daily amount is what decides the format.",
        ],
      },
      {
        heading: "Powder",
        paragraphs: [
          "One scoop of powder usually provides 5–10 g, which makes reaching a studied dose easy. Unflavoured powder dissolves into coffee, tea, smoothies or water. It’s also usually the better value per gram.",
        ],
      },
      {
        heading: "Capsules",
        paragraphs: [
          "Each capsule usually holds well under 1 g, so a useful dose can mean five or more capsules a day. Capsules suit travel and people who dislike the texture of powder, but check the daily serving on the label before you buy.",
        ],
      },
      {
        heading: "Worth knowing",
        list: [
          "Collagen comes from animals — usually bovine (beef) or marine (fish). Avoid marine collagen if you have a fish allergy.",
          "Vitamin C helps your body make its own collagen, which is why many products include it.",
          "Collagen isn’t a complete protein, so it doesn’t replace protein from your meals.",
        ],
      },
    ],
  },
];

export const articles: Article[] = articleList.map((a) => ({ ...a, href: `/learn/${a.slug}` }));

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug) ?? null;

export const articleMeta = (a: Article) => `${a.type} · ${a.minutes} min`;

/** Pharmacist's note and Learn tile for each category page. */
export const categoryNotes: Record<CategorySlug | "all", { note: string; link: { label: string; href: string }; learn: { title: string; dek: string; href: string; minutes: number } }> = {
  all: {
    note: "If you’re unsure where to start, filter by goal first — then choose the form you’ll actually take.",
    link: { label: "Find your routine →", href: "/routine" },
    learn: { title: "Why form matters more than milligrams", dek: "Glycinate, citrate, picolinate: the partner molecule changes what a mineral is good for.", href: "/learn/why-form-matters", minutes: 3 },
  },
  "vitamins-minerals": {
    note: "If you’re unsure, start with glycinate magnesium in the evening. It’s the gentlest form and the one we’re asked about most.",
    link: { label: "Glycinate vs malate →", href: "/learn/magnesium-glycinate-vs-malate" },
    learn: { title: "Which magnesium is right for you?", dek: "Glycinate for evenings, citrate for digestion, malate for the daytime. A one-page guide.", href: "/search?q=magnesium", minutes: 3 },
  },
  "gut-digestion": {
    note: "Start with one product and give it four weeks. Enzymes for heavy meals, fibre for regularity — not both on day one.",
    link: { label: "Build a gut routine →", href: "/routine" },
    learn: { title: "Enzymes, fibre or a probiotic?", dek: "Three different jobs. Here is how to tell which one you need first.", href: "/shop/probiotics", minutes: 4 },
  },
  probiotics: {
    note: "Look at the strains and how it’s stored before the CFU count. A shelf-stable product you take daily beats a big number you forget.",
    link: { label: "How to choose a probiotic →", href: "/learn/how-to-choose-a-probiotic" },
    learn: { title: "How to choose a probiotic", dek: "Strains, CFU and storage — the three things on the label that matter.", href: "/learn/how-to-choose-a-probiotic", minutes: 5 },
  },
  immune: {
    note: "Most people in Lebanon are low in vitamin D by late winter. Check that first before adding anything else.",
    link: { label: "Vitamin D on the shelf →", href: "/search?q=vitamin%20d" },
    learn: { title: "Understanding vitamin D dosage", dek: "IU, micrograms, and why most people in Lebanon are still low in winter.", href: "/learn/understanding-vitamin-d-dosage", minutes: 4 },
  },
  "collagen-beauty": {
    note: "Powder is the easiest way to reach a useful daily amount. Capsules suit travel, but you’ll need several a day.",
    link: { label: "Powder or capsules? →", href: "/shop/collagen-beauty?format=Powder" },
    learn: { title: "Collagen: powder or capsules?", dek: "How much you actually need per day, and which format makes that easy.", href: "/learn/collagen-powder-or-capsules", minutes: 4 },
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
