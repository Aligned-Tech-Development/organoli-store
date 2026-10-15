// schema.org structured data (JSON-LD) — what lets Google show price, availability and
// breadcrumbs in the search result itself (HAD1-75). Validate changes in Google's Rich Results Test.
import { site, siteUrl } from "@/content/site";
import { CATEGORY_BY_SLUG } from "./taxonomy";
import type { Product } from "./types";

export function JsonLd({ data }: { data: object }) {
  // "<" escaped so product text can never close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const abs = (path: string) => (path.startsWith("http") ? path : `${siteUrl}${path}`);

/** The shop itself — on every page. Online-only, so no street address (no LocalBusiness). */
export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${siteUrl}/#organization`,
  name: site.name,
  url: siteUrl,
  logo: abs("/icon.png"),
  email: site.email,
  areaServed: { "@type": "Country", name: "Lebanon" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: `+${site.whatsapp.digits}`,
    email: site.email,
    availableLanguage: ["English", "Arabic"],
  },
  ...(site.social.length ? { sameAs: site.social.map((s) => s.href) } : {}),
});

/** Breadcrumbs as shown on the page: [name, path] pairs, last one = this page. */
export const breadcrumbLd = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

/**
 * A product with its offer. Products without a price get no Product markup: Google requires an
 * offer, and a priceless one would be reported as an error.
 */
export const productLd = (p: Product) =>
  p.price > 0
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${siteUrl}/products/${p.slug}#product`,
        name: p.fullName,
        url: abs(`/products/${p.slug}`),
        sku: p.slug,
        image: p.images.map((i) => abs(i.src)),
        description: p.shortDescription ?? p.purpose ?? p.description ?? undefined,
        ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
        category: CATEGORY_BY_SLUG[p.category]?.name,
        offers: {
          "@type": "Offer",
          url: abs(`/products/${p.slug}`),
          price: p.price.toFixed(2),
          priceCurrency: p.currency,
          availability: p.stock === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
          seller: { "@id": `${siteUrl}/#organization` },
          // No shippingDetails: the delivery fee isn't fixed (free over the threshold, otherwise
          // confirmed per order), and a shipping block without a rate is reported as an error.
        },
      }
    : null;
