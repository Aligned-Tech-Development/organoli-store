// Normalises the raw WooCommerce Store API export (data/products.json) into the
// typed catalogue the app reads (data/catalog.json). Run with `npm run catalog`.
// Everything here is derived from the source data; nothing is invented.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const raw = JSON.parse(readFileSync(join(root, "data/products.json"), "utf8"));

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", hellip: "…", reg: "®", trade: "™", deg: "°", micro: "µ" };
const decode = (s = "") =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m);
const stripHtml = (s = "") =>
  decode(s.replace(/<br\s*\/?>|<\/p>|<\/li>/gi, "\n").replace(/<[^>]+>/g, ""))
    .replace(/�/g, "–")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
const clean = (s) => decode(s).replace(/�/g, "–").replace(/\s+/g, " ").trim();
const slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");

// ---------- name parsing ----------
// Brands that appear in product names without the usual "(Brand)" marker.
const KNOWN_BRANDS = [
  "Nuzest", "Solgar", "Pulsin", "Phizz", "Wellbel", "Sports Research", "Ayurvediq Wellness", "My Magic Mud", "Hunter & Gather", "Vital Proteins",
];
const UNIT = String.raw`(capsules?|caps|vcaps|veg(?:etarian)? caps(?:ules)?|softgels?|tablets?|tabs|chewables?|lozenges?|gummies|sachets|stick packets|sticks|pouches|servings|g|kg|ml|l|oz|pieces|pcs|bars?)`;
const SIZE_RE = new RegExp(String.raw`[,.]?\s*(\d[\d.,]*)\s*${UNIT}\b\.?\s*,?\s*$`, "i");
const DOSE_RE = /(\d[\d.,]*\s?(?:mg|mcg|µg|iu|billion(?: cfu)?|b cfu|bn cfu|cfu))\b/i;

function parseName(name, brandField) {
  let n = clean(name).replace(/\s*,\s*$/, "");
  let brand = brandField || null;
  let size = null;

  const sz = n.match(SIZE_RE);
  if (sz) {
    size = { n: sz[1], unit: sz[2].toLowerCase() };
    n = n.slice(0, sz.index).trim();
  }
  // "(Brand)" — take the last parenthesised group that isn't a dose/description
  const parens = [...n.matchAll(/\(([^()]+)\)/g)].filter((m) => !/\d[\d.,]*\s?(mg|mcg|iu|g|ml|%)\b|^as |^type /i.test(m[1]));
  if (parens.length) {
    const m = parens[parens.length - 1];
    if (!brand) brand = m[1].trim();
    n = (n.slice(0, m.index) + n.slice(m.index + m[0].length)).trim();
  }
  const by = n.match(/\s+by\s+([A-Z][\w&' ]+)$/);
  if (by) {
    if (!brand) brand = by[1].trim();
    n = n.slice(0, by.index).trim();
  }
  // a trailing size left behind after removing the brand
  const sz2 = n.match(SIZE_RE);
  if (!size && sz2) {
    size = { n: sz2[1], unit: sz2[2].toLowerCase() };
    n = n.slice(0, sz2.index).trim();
  }
  const dash = n.match(/^(.+?)-([A-Z][\w’' ]+)$/);
  if (!brand && dash && !/\d/.test(dash[2])) {
    brand = dash[2].trim();
    n = dash[1].trim();
  }
  if (!brand) {
    // a known brand written into the name: "Nuzest – Clean Lean…", "Oligo Alfer Plus, Solgar, 90caps"
    const hit = KNOWN_BRANDS.find((b) => new RegExp(`(^|[,–\\s])${b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[,–\\s])`, "i").test(n));
    if (hit) {
      brand = hit;
      n = n.replace(new RegExp(`\\s*[,–-]?\\s*${hit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[,–-]?\\s*`, "i"), (m, i) => (i === 0 ? "" : ", ")).trim();
    }
  }
  n = n.replace(/\s+,/g, ",").replace(/[,.\s–-]+$/, "").replace(/^[,.\s–-]+/, "").replace(/\s*,\s*,/g, ",").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim();
  if (brand) {
    brand = brand.replace(/\s+/g, " ").trim();
    // drop a leading "Brand – " prefix from the product name
    const lead = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[–:-]\\s*`, "i");
    n = n.replace(lead, "");
  }
  return { name: n, brand, size };
}

const BRAND_CANON = {
  now: "NOW", "now foods": "NOW", biocare: "BioCare", "pure encapsulations": "Pure Encapsulations",
  "hunter&gather": "Hunter & Gather", "hunter and gather": "Hunter & Gather", "hunter & gather": "Hunter & Gather",
  "lake avenue nutrition": "Lake Avenue Nutrition", "seeking health": "Seeking Health",
  "vita bright": "Vitabright", vitabright: "Vitabright", "minami nutrition": "Minami", "biocidin botanicals": "Biocidin",
  "nutricost women": "Nutricost", "bio reasearch": "Bio Research", "nature's way": "Nature’s Way", "doctor's best": "Doctor’s Best",
};
const canonBrand = (b) => {
  if (!b) return null;
  b = b.replace(/[,.;:]+$/, "").trim();
  const k = b.toLowerCase().replace(/’/g, "'").trim();
  if (BRAND_CANON[k]) return BRAND_CANON[k];
  return b.trim().replace(/\b([a-z])/g, (m, c, i, s) => (i === 0 || s[i - 1] === " " ? c.toUpperCase() : m));
};

function sizeLabel(size) {
  if (!size) return null;
  const n = size.n.replace(/\.0+$/, "");
  const u = size.unit;
  const map = { caps: "capsules", vcaps: "veg capsules", tabs: "tablets", capsule: "capsules", tablet: "tablets", softgel: "softgels", chewable: "chewables", sticks: "sticks" };
  const unit = map[u] ?? u;
  if (["g", "kg", "ml", "l", "oz"].includes(unit)) return `${n} ${unit}`;
  return `${n} ${unit}`;
}

function detectFormat(size, text) {
  const t = text.toLowerCase();
  if (/spray/.test(t)) return "Spray";
  if (/gumm/.test(t) || size?.unit === "gummies") return "Gummy";
  if (/drops|liquid|tincture|syrup/.test(t)) return "Liquid";
  if (/toothpaste|deodorant|toothbrush|tongue scraper|floss|mouthwash|serum|cream|balm|soap/.test(t)) return "Personal care";
  const u = size?.unit ?? "";
  if (/caps|capsule|vcaps/.test(u)) return "Capsule";
  if (/softgel/.test(u)) return "Softgel";
  if (/tablet|tabs|chewable|lozenge/.test(u)) return "Tablet";
  if (/sachet|stick/.test(u)) return "Sachet";
  if (u === "ml" || u === "l") return "Liquid";
  if (u === "g" || u === "kg" || /powder/.test(t)) return /\bbar\b|bars/.test(t) ? "Food" : "Powder";
  if (/capsule/.test(t)) return "Capsule";
  if (/tablet/.test(t)) return "Tablet";
  if (/softgel/.test(t)) return "Softgel";
  if (/\boil\b/.test(t)) return "Liquid";
  return null;
}

const FORMS = [
  ["Glycinate", /bisglycinate|glycinate/i], ["Citrate", /citrate/i], ["Malate", /malate/i], ["L-threonate", /threonate|magtein/i],
  ["Taurate", /taurate/i], ["Picolinate", /picolinate/i], ["Methylated", /methyl|folinic|5-mthf|hydroxo/i], ["Liposomal", /liposomal/i],
  ["Hydrolysed", /peptides|hydroly[sz]ed/i], ["Marine", /marine/i],
];
const detectForm = (t) => FORMS.find(([, re]) => re.test(t))?.[0] ?? null;

const INGREDIENTS = [
  ["Magnesium", /magnesium|magtein/i], ["Zinc", /\bzinc\b/i], ["Iron", /\biron\b/i], ["Calcium", /calcium/i], ["Selenium", /selenium/i],
  ["Vitamin D3", /\bd3\b|vitamin d/i], ["Vitamin C", /vitamin c|\bc-?1000\b/i], ["Vitamin B12", /b12|cobalamin/i], ["B complex", /b[- ]?complex|b vitamins/i],
  ["Folate", /folate|folic|folinic|mthf/i], ["Multivitamin", /multi(?:-)?vitamin|multinutrient|\bmulti\b/i], ["Omega-3", /omega|fish oil|krill|\bdha\b|\bepa\b/i],
  ["Probiotic", /probiotic|lactobac|bifido|cfu|akkermansia|muciniphila|flora|saccharomyces/i], ["Digestive enzymes", /enzyme/i], ["Fibre", /fiber|fibre|psyllium|inulin/i],
  ["Collagen", /collagen/i], ["Protein", /protein/i], ["Creatine", /creatine/i], ["Electrolytes", /electrolyte|hydration/i], ["Ashwagandha", /ashwagandha/i],
  ["Berberine", /berberine/i], ["CoQ10", /coq10|ubiquinol/i], ["Colostrum", /colostrum/i], ["Inositol", /inositol/i], ["Quercetin", /quercetin/i],
  ["Turmeric", /turmeric|curcumin/i], ["L-Theanine", /theanine/i], ["NAC", /\bnac\b|acetyl.?cysteine/i], ["Glutathione", /glutathione/i],
];
const detectIngredients = (t) => INGREDIENTS.filter(([, re]) => re.test(t)).map(([n]) => n);

// ---------- taxonomy ----------
// 8 shop categories; a product can sit in several. `primary` is the first match in this order.
const CATEGORY_RULES = [
  ["probiotics", (c, t) => /probiotic|prebiotic/.test(c) || /probiotic|akkermansia|muciniphila|lactobac|bifido|\bcfu\b|maxiflora|myceflora/i.test(t)],
  ["collagen-beauty", (c, t) => /collagen|skin-care/.test(c) || /collagen|hyaluronic|biotin|skin|hair|nail/i.test(t)],
  ["protein-performance", (c, t) => /protein|muscles|performance|hydration/.test(c) || /protein|creatine|electrolyte|bcaa|glutamine|pre-?workout/i.test(t)],
  ["hormonal-health", (c, t) => /hormonal|women-and-men|thyroid|adrenal|urinary/.test(c) || /inositol|vitex|\bdim\b|thyroid|menopause|prenatal|fertility|cranberry/i.test(t)],
  ["gut-digestion", (c, t) => /gi-support|digestion|gastro|fibers|liver|detox/.test(c) || /enzyme|digest|fiber|fibre|psyllium|\bgut\b|bloat|liver|berberine|glutamine|mastic|bone broth/i.test(t)],
  ["immune", (c, t) => /immune|antioxidant/.test(c) || /immune|elderberry|echinacea|colostrum|quercetin|propolis|vitamin c|glutathione/i.test(t)],
  ["vitamins-minerals", (c, t) => /vitamin|mineral/.test(c) || /vitamin|magnesium|zinc|iron|calcium|selenium|\bb12\b|\bd3\b|folate|multi/i.test(t)],
  ["wellness-care", () => true],
];

const GOAL_RULES = [
  ["gut-health", (c, t) => /gi-support|digestion|gastro|probiotic|prebiotic|fibers/.test(c) || /probiotic|enzyme|fiber|fibre|psyllium|digest|\bgut\b|akkermansia|muciniphila|bloat|mastic|bone broth/i.test(t)],
  ["sleep", (c, t) => /magnesium|glycine|theanine|melatonin|\bsleep\b|valerian|gaba/i.test(t)],
  ["energy", (c, t) => /\bb12\b|b[- ]?complex|b vitamins|\biron\b|coq10|ubiquinol|energy|methyl|fatigue|tiredness/i.test(t)],
  ["immunity", (c, t) => /immune/.test(c) || /immun|vitamin c|\bzinc\b|\bd3\b|vitamin d|elderberry|colostrum|quercetin|propolis|echinacea/i.test(t)],
  ["stress", (c, t) => /adrenal/.test(c) || /ashwagandha|rhodiola|stress|theanine|saffron|adrenal|magnesium/i.test(t)],
  ["womens-health", (c, t) => /women/.test(c) || /women|prenatal|folate|folinic|folic|\biron\b|cranberry|urinary|pregnan/i.test(t)],
  ["hormonal-support", (c, t) => /hormonal|thyroid/.test(c) || /inositol|vitex|\bdim\b|thyroid|menopause|hormon|maca|primrose/i.test(t)],
  ["skin-beauty", (c, t) => /collagen|skin/.test(c) || /collagen|hyaluronic|skin|biotin|hair|nail/i.test(t)],
  ["performance", (c, t) => /protein|muscles|performance|hydration/.test(c) || /protein|creatine|electrolyte|hydration|bcaa|muscle|glutamine/i.test(t)],
  ["daily-essentials", (c, t) => /multivitamin/.test(c) || /multi(?:-)?vitamin|multinutrient|omega|fish oil|vitamin d|\bd3\b|greens|superfood|super food/i.test(t)],
];

// ---------- dietary ----------
function dietary(tags, text) {
  const ts = tags.map((t) => clean(t).toLowerCase());
  const hasFreeList = ts.some((t) => /free/.test(t));
  const out = new Set();
  const any = (re) => ts.some((t) => re.test(t));
  const bare = (re) => hasFreeList && ts.some((t) => re.test(t));
  if (any(/vegan|plant[- ]based/) || /\bvegan\b/i.test(text)) out.add("Vegan");
  if (out.has("Vegan") || any(/vegetarian/)) out.add("Vegetarian");
  if (any(/gluten[- ]?free|free from:? ?gluten|free from:? ?wheat|wheat[- ]?free/) || bare(/^(gluten|wheat)$/)) out.add("Gluten-free");
  if (any(/dairy[- ]?free|lactose[- ]?free|does not contain dairy|free from:? ?(dairy|milk|lactose)/) || bare(/^(dairy|milk|lactose|casein|dairy and eggs)$/)) out.add("Dairy-free");
  if (any(/soy[- ]?free|free from:? ?soy/) || bare(/^(soy|soya)$/)) out.add("Soy-free");
  if (any(/non[\s-]*gmo|gmo[- ]?free/) || bare(/^gmos?$/)) out.add("Non-GMO");
  if (any(/sugar[- ]?free|no added sugar/) || bare(/^(sugar|added sugar)$/)) out.add("Sugar-free");
  return ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "Soy-free", "Non-GMO", "Sugar-free"].filter((d) => out.has(d));
}

// ---------- build ----------
const firstLine = (s) => {
  const line = s.split("\n").map((x) => x.trim()).find(Boolean) ?? "";
  const sentence = line.split(/(?<=[.!?])\s/)[0];
  return sentence.length > 110 ? sentence.slice(0, 107).replace(/\s+\S*$/, "") + "…" : sentence.replace(/\.$/, "");
};

const seen = new Set();
const products = raw.map((p) => {
  const brandField = p.brands?.[0]?.name ? clean(p.brands[0].name) : null;
  const parsed = parseName(p.name, brandField);
  const brand = canonBrand(parsed.brand);
  const cats = p.categories.map((c) => c.slug).join(" ");
  const shortDesc = stripHtml(p.short_description);
  const description = stripHtml(p.description);
  const fullName = clean(p.name);
  const text = `${fullName} ${shortDesc} ${description}`;
  const nameText = `${fullName} ${shortDesc}`;
  const size = sizeLabel(parsed.size);
  const dose = (fullName.match(DOSE_RE)?.[1] ?? null)?.replace(/\s?(mg|mcg|iu)$/i, (m, u) => ` ${u === "iu" || u === "IU" ? "IU" : u.toLowerCase()}`) ?? null;
  const format = detectFormat(parsed.size, fullName);
  const form = detectForm(fullName);
  const ingredients = detectIngredients(fullName);
  const categories = CATEGORY_RULES.filter(([, f]) => f(cats, fullName)).map(([s]) => s);
  const cleanCats = categories.length > 1 ? categories.filter((c) => c !== "wellness-care") : categories;
  const goals = GOAL_RULES.filter(([, f]) => f(cats, nameText)).map(([s]) => s);
  let slug = p.slug;
  while (seen.has(slug)) slug += "-2";
  seen.add(slug);
  const tags = p.tags.map((t) => clean(t.name));
  const diet = dietary(tags, text);
  const spec = [dose, size].filter(Boolean);
  return {
    id: p.id,
    slug,
    name: parsed.name || fullName,
    fullName,
    brand,
    brandSlug: brand ? slugify(brand) : null,
    purpose: shortDesc ? firstLine(shortDesc) : description ? firstLine(description) : null,
    shortDescription: shortDesc || null,
    description: description || null,
    specLine: spec.length ? spec.join(" · ") : format ?? null,
    price: Number(p.prices.price) / 10 ** (p.prices.currency_minor_unit ?? 0),
    compareAt: p.on_sale ? Number(p.prices.regular_price) / 10 ** (p.prices.currency_minor_unit ?? 0) : null,
    currency: p.prices.currency_code,
    stock: p.is_in_stock ? "in" : "out",
    images: p.images.map((i) => ({ src: i.src, alt: clean(i.alt || "") || fullName })),
    category: cleanCats[0],
    categories: cleanCats,
    sourceCategories: p.categories.map((c) => clean(c.name)),
    goals,
    dietary: diet,
    format,
    form,
    dose,
    count: size,
    ingredients,
    permalink: p.permalink,
  };
});

const brands = Object.values(
  products.reduce((acc, p) => {
    if (!p.brand) return acc;
    acc[p.brandSlug] ??= { slug: p.brandSlug, name: p.brand, productCount: 0 };
    acc[p.brandSlug].productCount++;
    return acc;
  }, {}),
).sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));

const catalog = { generatedAt: new Date().toISOString(), products, brands };
writeFileSync(join(root, "data/catalog.json"), JSON.stringify(catalog));

const count = (k) => products.reduce((a, p) => ((p[k] ? 1 : 0) + a), 0);
console.log(`catalog: ${products.length} products, ${brands.length} brands`);
console.log(`  brand ${count("brand")} · spec ${count("specLine")} · purpose ${count("purpose")} · format ${count("format")} · dose ${count("dose")} · in stock ${products.filter((p) => p.stock === "in").length}`);
