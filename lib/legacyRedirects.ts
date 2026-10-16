// Permanent redirects from the old WooCommerce organoli.com to this site, so links Google
// and customers already have keep working when organoli.com moves here (HAD1-73).
// Built from the old site's wp-sitemap.xml (715 URLs, October 2026):
//   320 /product/<slug>/   → same slug under /products/ (all 320 match)
//    42 /product-category/ → the closest of the 8 shop categories
//   272 /product-tag/      → a diet filter when the tag names one, else the shop
//    34 /brand/<slug>/     → that brand's page (2 slugs were renamed)
//   pages (about, contact, cart, account…) → their new equivalent
// Theme demo pages (/portfolio/, /elementor-hf/) are left to 404: they were never real content.
// Used by next.config.ts; harmless on the demo host.
import type { NextConfig } from "next";

type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

const CATEGORY_MAP: Record<string, string> = {
  // vitamins & minerals
  "vitamins-minerals": "vitamins-minerals",
  "vitamins-and-minerals": "vitamins-minerals",
  "multivitamins-and-minerals": "vitamins-minerals",
  // gut & digestion
  "gi-support-gastrointestinal": "gut-digestion",
  "gi-support-gastrointestinal-2": "gut-digestion",
  gastrointestinal: "gut-digestion",
  digestion: "gut-digestion",
  fibers: "gut-digestion",
  prebiotic: "gut-digestion",
  liver: "gut-digestion",
  "liver-function": "gut-digestion",
  detox: "gut-digestion",
  "bone-broth": "gut-digestion",
  // probiotics
  probiotics: "probiotics",
  probiotic: "probiotics",
  // collagen & beauty
  collagen: "collagen-beauty",
  "collagen-creamer": "collagen-beauty",
  "skin-care": "collagen-beauty",
  // protein & performance
  "protein-powders": "protein-performance",
  "protein-powder": "protein-performance",
  performance: "protein-performance",
  muscles: "protein-performance",
  hydration: "protein-performance",
  // hormonal health
  hormonal: "hormonal-health",
  "women-and-men-health": "hormonal-health",
  adrenal: "hormonal-health",
  thyroid: "hormonal-health",
  "urinary-tract-support": "hormonal-health",
  // immune
  immune: "immune",
  antioxidant: "immune",
  // wellness & care
  oils: "wellness-care",
  "super-foods": "wellness-care",
  slimming: "wellness-care",
  "weight-loss": "wellness-care",
  seeds: "wellness-care",
  powders: "wellness-care",
  dental: "wellness-care",
  "teeth-health": "wellness-care",
  deodorant: "wellness-care",
  health: "wellness-care",
};

// Old tag (regex on its slug) → diet filter. First match wins; tags naming no diet go to the shop.
const TAG_DIETS: [string, string][] = [
  [".*vegan.*", "Vegan"],
  [".*vegetarian.*", "Vegetarian"],
  [".*gluten-free.*|.*free-from-gluten.*", "Gluten-free"],
  [".*dairy-free.*|.*lactose-free.*", "Dairy-free"],
  [".*soy-free.*|.*soya-free.*", "Soy-free"],
  [".*sugar-free.*|.*no-sugar.*|.*free-from-sugar.*|.*no-added-sugar.*", "Sugar-free"],
  [".*non-gmo.*|.*free-from-gmo.*|.*gmo-free.*", "Non-GMO"],
];

const PAGES: [string, string][] = [
  ["/home", "/"],
  ["/about", "/#why-organoli"],
  ["/about-us", "/#why-organoli"],
  ["/about-us-type-2", "/#why-organoli"],
  ["/contact-us", "/contact"],
  ["/contact-us-type-2", "/contact"],
  ["/elm-contact-us", "/contact"],
  ["/blog", "/#learn"],
  ["/shopping-cart", "/checkout"],
  ["/cart", "/checkout"],
  ["/my-account", "/account"],
  ["/order-tracking", "/account"],
  ["/compare", "/shop"],
];

// Each source with and without the trailing slash WooCommerce used, so it's one hop, not two.
const both = (source: string, destination: string): Redirect[] => [
  { source, destination, permanent: true },
  { source: `${source}/`, destination, permanent: true },
];

export const legacyRedirects: Redirect[] = [
  ...PAGES.flatMap(([from, to]) => both(from, to)),
  // Products: identical slugs.
  ...both("/product/:slug", "/products/:slug"),
  // Categories, including any sub-category path under them.
  ...Object.entries(CATEGORY_MAP).flatMap(([from, to]) => [
    ...both(`/product-category/${from}`, `/shop/${to}`),
    { source: `/product-category/${from}/:rest+`, destination: `/shop/${to}`, permanent: true },
  ]),
  ...both("/product-category/:rest*", "/shop"),
  // Brands: two were renamed, the rest keep their slug.
  ...both("/brand/minami-nutrition", "/brands/minami"),
  ...both("/brand/bio-reasearch", "/brands/bio-research"),
  ...both("/brand/:slug", "/brands/:slug"),
  // Tags.
  ...TAG_DIETS.flatMap(([pattern, diet]) => both(`/product-tag/:tag(${pattern})`, `/shop?diet=${encodeURIComponent(diet)}`)),
  ...both("/product-tag/:tag*", "/shop"),
  // WordPress search: /?s=magnesium (and WooCommerce's ?post_type=product).
  { source: "/", has: [{ type: "query", key: "s", value: "(?<q>.+)" }], destination: "/search?q=:q", permanent: true },
  // Last: any other trailing slash is dropped (replaces Next's own redirect, switched off in next.config.ts).
  { source: "/:path+/", destination: "/:path+", permanent: true },
];
