// Store-level editorial content. Online-only shop: no named pharmacist, shop
// address or opening hours. Values marked CONFIRM need the client's OK before launch.

export const site = {
  name: "Organoli",
  url: "https://organoli.com",
  city: "Beirut",
  established: 2024,
  currency: "USD",
  freeDeliveryThreshold: 75,
  /** Local time (Asia/Beirut) after which orders ship the next working day. */
  dispatchCutoffHour: 16,
  timeZone: "Asia/Beirut",
  /** WhatsApp number: display format, and digits only for wa.me links. */
  whatsapp: { display: "+961 81 047 743", digits: "96181047743" },
  /** CONFIRM — that this mailbox exists on organoli.com. */
  email: "hello@organoli.com",
  payments: ["Cash on delivery", "Whish"],
  /** CONFIRM — delivery times per area. */
  deliveryZones: [
    { zone: "Beirut", time: "next day" },
    { zone: "Mount Lebanon", time: "1–2 days" },
    { zone: "North, South & Bekaa", time: "2–3 days" },
  ],
  /** Empty until the client sends their accounts — the footer hides the links meanwhile. */
  social: [] as { label: string; href: string }[],
} as const;

/**
 * The site's public origin: NEXT_PUBLIC_SITE_URL when set, otherwise Vercel's
 * production domain (the demo now, organoli.com once it is attached), else site.url.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : site.url)
).replace(/\/+$/, "");

/** True while the site is served from a *.vercel.app address — keep search engines out. */
export const isDemoHost = new URL(siteUrl).hostname.endsWith(".vercel.app");

export const whatsappLink =(text?: string) =>
  `https://wa.me/${site.whatsapp.digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const popularSearches = ["magnesium", "creatine", "vitamin d", "probiotic", "collagen", "ashwagandha", "omega", "zinc"];

export const megaIngredients = ["Magnesium", "Vitamin D3", "Creatine", "Omega-3", "Ashwagandha", "Zinc", "Collagen", "B complex"];
