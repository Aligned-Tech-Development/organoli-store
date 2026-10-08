// Store-level editorial content. Values marked PLACEHOLDER come from the design
// handoff and must be replaced with the real details before launch.

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
  /** PLACEHOLDER — pharmacist shown across the site. */
  pharmacist: { name: "Rana Haddad", firstName: "Rana", initials: "RH", title: "Founder · Pharmacist", credentials: "PharmD" },
  /** PLACEHOLDER — WhatsApp number in international format, digits only for links. */
  whatsapp: { display: "+961 3 123 123", digits: "9613123123" },
  email: "hello@organoli.com",
  /** PLACEHOLDER — counter address and hours. */
  counter: { address: "Hamra Street, Beirut", hours: "Mon–Sat, 9:00–19:00", hoursShort: "Mon–Sat 9–19" },
  payments: ["Cash on delivery", "Visa", "Mastercard", "Whish"],
  deliveryZones: [
    { zone: "Beirut", time: "next day" },
    { zone: "Mount Lebanon", time: "1–2 days" },
    { zone: "North, South & Bekaa", time: "2–3 days" },
    { zone: "Click & collect, Hamra", time: "same day" },
  ],
  social: [
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "Facebook", href: "https://www.facebook.com/" },
  ],
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp.digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const popularSearches = ["magnesium", "creatine", "vitamin d", "probiotic", "collagen", "ashwagandha", "omega", "zinc"];

export const megaIngredients = ["Magnesium", "Vitamin D3", "Creatine", "Omega-3", "Ashwagandha", "Zinc", "Collagen", "B complex"];
