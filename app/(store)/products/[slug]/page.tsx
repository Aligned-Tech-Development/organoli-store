import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { BuyBox } from "@/components/product/BuyBox";
import { MobileTabs, Warnings } from "@/components/product/Bits";
import { Gallery } from "@/components/product/Gallery";
import { defaultWarnings, productContent } from "@/content/products";
import { site, whatsappLink } from "@/content/site";
import { badgeFor, compareSet, getProduct, getProducts, relatedProducts, toCard } from "@/lib/catalog";
import { money, stockDot } from "@/lib/format";
import { CATEGORY_BY_SLUG, GOAL_BY_SLUG } from "@/lib/taxonomy";
import { Photo } from "@/components/ProductImage";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const title = `${p.brand ? `${p.brand} ` : ""}${p.name}${p.count ? `, ${p.count}` : ""}`;
  return {
    title,
    description: p.shortDescription ?? p.purpose ?? `${title} — pharmacist-curated and in stock in Beirut.`,
    openGraph: { title, images: p.images[0] ? [{ url: p.images[0].src }] : [] },
  };
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => <span className="eyebrow">{children}</span>;
const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="m-0 font-display text-[40px] font-medium leading-none lg:text-5xl">{children}</h2>;

function Section({ id, n, title, aside, children }: { id: string; n: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-8 border-b border-hairline py-14 lg:grid-cols-[4fr_8fr] lg:gap-14 lg:py-[88px]">
      <div className="flex flex-col gap-2.5">
        <Eyebrow>{n}</Eyebrow>
        <H2>{title}</H2>
        {aside}
      </div>
      <div>{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const extra = productContent[p.slug] ?? {};
  const cat = CATEGORY_BY_SLUG[p.category];
  const card = toCard(p);
  const related = relatedProducts(p).map(toCard);
  const compare = compareSet(p);
  const formLine = [p.format, p.form?.toLowerCase()].filter(Boolean).join(" · ");

  const specs: [string, string][] = [
    ["Dose", p.dose ?? "See label"],
    ["Form", formLine || "—"],
    ["Count", p.count ?? "—"],
    ["Serving size", extra.servingSize ?? "See label"],
    ["Main ingredient", p.ingredients.slice(0, 2).join(" · ") || p.name],
    ["Dietary", p.dietary.slice(0, 2).join(" · ") || "—"],
  ];
  const stickySpec = [p.dose, p.count, extra.howToTake?.amount ? `${extra.howToTake.amount} daily` : null].filter(Boolean).join(" · ") || (p.specLine ?? "");
  const goals = p.goals.map((g) => GOAL_BY_SLUG[g].name);
  const about = p.description ?? p.shortDescription;

  const anchors: [string, string][] = [
    ...(extra.whyWeChose ? [["#why", "Why we chose it"] as [string, string]] : []),
    ...(about ? [["#about", "About"] as [string, string]] : []),
    ...(extra.claims ? [["#does", "What it does"] as [string, string]] : []),
    ...(extra.howToTake ? [["#how", "How to take it"] as [string, string]] : []),
    ["#ingredients", "Ingredients"],
    ["#suits", "Who it suits"],
    ["#warnings", "Warnings"],
    ["#delivery", "Delivery & storage"],
    ...(compare.length ? [["#compare", "Compare"] as [string, string]] : []),
  ];
  let n = 0;
  const num = () => String(++n).padStart(2, "0");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.fullName,
    image: p.images.map((i) => i.src),
    description: p.shortDescription ?? p.purpose ?? undefined,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: p.price > 0 ? { "@type": "Offer", price: p.price, priceCurrency: p.currency, availability: p.stock === "out" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" } : undefined,
  };

  return (
    <div className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="hidden gap-2.5 px-12 py-6 text-xs font-medium uppercase leading-none tracking-[.12em] text-slate-text lg:flex">
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span aria-hidden="true">/</span>
        <Link href={`/shop/${cat.slug}`} className="hover:text-ink">
          {cat.name}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-ink">
          {p.name}
        </span>
      </nav>

      <section className="lg:grid lg:grid-cols-[7fr_5fr] lg:items-start lg:gap-14 lg:px-12 lg:pb-20">
        <Gallery images={p.images} badge={badgeFor(p.slug)} name={p.fullName} />

        <div className="flex flex-col gap-3 px-4 py-5 lg:gap-[22px] lg:px-0 lg:py-0">
          <div className="flex flex-col gap-3">
            {p.brand && (
              <Link href={`/shop?brand=${p.brandSlug}`} className="text-[11px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text hover:text-ink lg:text-xs">
                {p.brand}
              </Link>
            )}
            <h1 className="m-0 font-display text-[46px] font-medium leading-[.92] lg:text-[clamp(56px,5vw,76px)] lg:leading-[.9] lg:tracking-[-.01em]">{p.name}</h1>
            {p.purpose && <p className="m-0 mt-1 text-base leading-normal [text-wrap:pretty] lg:text-lg">{p.purpose}</p>}
          </div>

          {/* Mobile price row */}
          <div className="flex items-center justify-between border-y border-hairline py-3 lg:hidden">
            <span className="text-[26px] font-semibold leading-none">{p.price > 0 ? money(p.price) : "Price on request"}</span>
            <span className="text-right text-[13px] font-medium leading-[1.3]">
              <span style={{ color: stockDot(p.stock) }}>●</span> {p.stock === "out" ? "Back in ~2 weeks" : `In stock in ${site.city}`}
              <br />
              <span className="text-slate-text">{p.stock === "out" ? "Ask us to reserve one" : "Delivered tomorrow"}</span>
            </span>
          </div>

          {/* Spec sheet */}
          <div className="relative grid grid-cols-2 border border-ink lg:grid-cols-3">
            <span aria-hidden="true" className="absolute -left-1.5 -top-[11px] hidden bg-paper text-lg font-light leading-none text-slate-700 lg:block">
              +
            </span>
            <span aria-hidden="true" className="absolute -bottom-[11px] -right-1.5 hidden bg-paper text-lg font-light leading-none text-slate-700 lg:block">
              +
            </span>
            {specs.map(([k, v]) => (
              <div key={k} className="-mb-px -mr-px flex flex-col gap-1.5 border-b border-r border-hairline p-3 lg:gap-2 lg:px-4 lg:py-3.5">
                <span className="text-[9.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text lg:text-[10px]">{k}</span>
                <span className="text-[15px] font-medium leading-[1.2] lg:text-[17px]">{v}</span>
              </div>
            ))}
          </div>

          <div className="hidden items-end justify-between pt-1.5 lg:flex">
            <span className={`${p.price > 0 ? "text-4xl" : "text-2xl"} font-semibold leading-none tabular-nums`}>{p.price > 0 ? money(p.price) : "Price on request"}</span>
            <span className="flex items-center gap-2 text-sm font-medium leading-none">
              <span className="h-2 w-2 rounded-full" style={{ background: stockDot(p.stock) }} />
              {p.stock === "out" ? "Out of stock · back in ~2 weeks" : `In stock in ${site.city}`}
            </span>
          </div>

          <div className="hidden flex-col gap-[22px] lg:flex">
            <BuyBox p={card} stickySpec={stickySpec} />
          </div>
          <div className="lg:hidden">
            <BuyBoxMobileOnly p={card} stickySpec={stickySpec} />
          </div>

          <MobileTabs
            tabs={[
              { label: "Overview", rows: [["Best for", goals.slice(0, 2).join(", ") || cat.name], ["Format", formLine || "—"], ["Suits", p.dietary.slice(0, 3).join(" · ") || "—"]], text: about },
              {
                label: "How to take",
                rows: extra.howToTake
                  ? [["Amount", extra.howToTake.amount], ["When", extra.howToTake.when], ["How long", extra.howToTake.duration]]
                  : [["Amount", "As directed on the label"], ["Questions", "Ask our pharmacist"]],
              },
              { label: "Facts", rows: specs.filter(([, v]) => v !== "—") },
            ]}
          />
          {extra.whyWeChose && (
            <div className="mt-1.5 flex items-start gap-3 bg-paper-shade p-4 lg:hidden">
              <Photo src={site.pharmacist.avatar} sizes="48px" className="h-10 w-10 flex-none rounded-full" />
              <span className="text-[14.5px] leading-[1.45]">
                <strong className="font-semibold">Why we chose it.</strong> {extra.whyWeChose.quote} — {site.pharmacist.firstName}, pharmacist
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Sticky in-page anchor nav (desktop) */}
      <div className="sticky top-0 z-20 hidden border-y border-hairline bg-paper/95 backdrop-blur-[8px] lg:block">
        <nav aria-label="On this page" className="no-scrollbar flex h-14 items-stretch gap-8 overflow-x-auto px-12">
          {anchors.map(([href, l]) => (
            <a key={href} href={href} className="flex flex-none items-center border-b-2 border-transparent text-[14.5px] font-medium leading-none text-ink hover:border-ink">
              {l}
            </a>
          ))}
        </nav>
      </div>

      <div className="hidden px-12 lg:block">
        {extra.whyWeChose && (
          <Section id="why" n={num()} title="Why we chose it">
            <div className="flex flex-col gap-8">
              <blockquote className="m-0 font-display text-[42px] font-medium leading-[1.1] [text-wrap:pretty]">“{extra.whyWeChose.quote}”</blockquote>
              <div className="flex items-center gap-3.5">
                <Photo src={site.pharmacist.avatar} sizes="48px" className="h-12 w-12 flex-none rounded-full" />
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold leading-none">{site.pharmacist.name}</span>
                  <span className="text-[11px] font-medium uppercase leading-none tracking-[.14em] text-slate-text">{site.pharmacist.title}</span>
                </span>
              </div>
              {extra.whyWeChose.checks && (
                <div className="grid grid-cols-3 border-t border-ink">
                  {extra.whyWeChose.checks.map((c) => (
                    <div key={c.h} className="flex flex-col gap-2.5 pr-5 pt-5">
                      <span aria-hidden="true" className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-mint text-[13px] font-semibold leading-none">
                        ✓
                      </span>
                      <span className="text-base font-semibold leading-[1.3]">{c.h}</span>
                      <span className="text-[15px] leading-normal text-slate-text">{c.d}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {about && (
          <Section id="about" n={num()} title="About this product" aside={goals.length ? <p className="m-0 mt-2 max-w-[280px] text-sm leading-normal text-slate-text">Shelved under {goals.slice(0, 3).join(", ").toLowerCase()}.</p> : null}>
            <div className="flex max-w-[760px] flex-col gap-4 text-[17px] leading-[1.6]">
              {about.split("\n").map((para, i) => (
                <p key={i} className="m-0">
                  {para}
                </p>
              ))}
            </div>
          </Section>
        )}

        {extra.claims && (
          <Section id="does" n={num()} title="What it does" aside={<p className="m-0 mt-2 max-w-[280px] text-sm leading-normal text-slate-text">Authorised health claims only. We don’t write anything stronger.</p>}>
            <div className="grid grid-cols-3 gap-6">
              {extra.claims.map((d) => (
                <div key={d.h} className="flex flex-col gap-3.5 border-t-2 border-ink pt-[18px]">
                  <span className="font-display text-[30px] font-medium leading-none">{d.h}</span>
                  <span className="text-base leading-[1.55]">{d.d}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {extra.howToTake && (
          <Section id="how" n={num()} title="How to take it">
            <div className="flex flex-col gap-6">
              <div className="on-dark grid grid-cols-3 bg-ink text-paper">
                {[
                  ["Amount", extra.howToTake.amount, extra.howToTake.amountNote],
                  ["When", extra.howToTake.when, extra.howToTake.whenNote],
                  ["For how long", extra.howToTake.duration, extra.howToTake.durationNote],
                ].map(([k, v, d]) => (
                  <div key={k} className="flex flex-col gap-2.5 border-r border-paper/20 p-7">
                    <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-mint">{k}</span>
                    <span className="font-display text-[56px] font-medium leading-none">{v}</span>
                    {d && <span className="text-[15px] leading-[1.4] text-mist">{d}</span>}
                  </div>
                ))}
              </div>
              {extra.howToTake.summary && <p className="m-0 text-[22px] font-medium leading-[1.4]">{extra.howToTake.summary}</p>}
            </div>
          </Section>
        )}

        <Section id="ingredients" n={num()} title="Ingredients & supplement facts">
          <div className="grid grid-cols-[minmax(0,1fr)_400px] items-start gap-10">
            <div className="flex flex-col gap-[22px]">
              <div className="flex flex-col gap-2">
                <span className="label text-slate-text">Active</span>
                <span className="text-[17px] leading-[1.55]">{extra.ingredientsActive ?? (p.ingredients.length ? p.ingredients.join(", ") : p.name)}</span>
              </div>
              {extra.ingredientsOther && (
                <div className="flex flex-col gap-2">
                  <span className="label text-slate-text">Other ingredients</span>
                  <span className="text-[17px] leading-[1.55]">{extra.ingredientsOther}</span>
                </div>
              )}
              {p.dietary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.dietary.map((f) => (
                    <span key={f} className="flex h-8 items-center rounded-pill border border-hairline px-3 text-[13px] font-medium leading-none">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="border-2 border-ink bg-field px-[18px] py-4">
              <span className="block border-b border-ink pb-2.5 font-display text-[30px] font-semibold leading-none">Supplement Facts</span>
              {extra.supplementFacts ? (
                <>
                  <div className="flex justify-between py-2 text-sm leading-[1.3]">
                    <span>Serving size</span>
                    <strong className="font-semibold">{extra.servingSize ?? "—"}</strong>
                  </div>
                  <div className="flex justify-between border-b-[6px] border-ink pb-2 text-sm leading-[1.3]">
                    <span>Servings per container</span>
                    <strong className="font-semibold">{extra.servingsPerContainer ?? "—"}</strong>
                  </div>
                  <div className="flex justify-between border-b border-ink py-2 text-[11px] font-semibold uppercase leading-none tracking-[.12em]">
                    <span>Per serving</span>
                    <span>Amount · %NRV</span>
                  </div>
                  {extra.supplementFacts.map((f, i, a) => (
                    <div key={f.name} className={`flex justify-between py-2.5 text-[14.5px] leading-[1.3] ${i === a.length - 1 ? "border-b-[6px] border-ink" : "border-b border-hairline"}`}>
                      <span>
                        {f.name}
                        {f.detail && (
                          <>
                            <br />
                            <span className="text-[12.5px] text-slate-text">{f.detail}</span>
                          </>
                        )}
                      </span>
                      <strong className="font-semibold tabular-nums">
                        {f.amount} · {f.nrv ?? "†"}
                      </strong>
                    </div>
                  ))}
                  <span className="block pt-2 text-xs leading-[1.4] text-slate-text">NRV = EU nutrient reference value. † No NRV established.</span>
                </>
              ) : (
                <div className="flex flex-col gap-3 pt-3 text-sm leading-normal">
                  <span>The full panel is printed on the pack{p.count ? ` (${p.count})` : ""}.</span>
                  <a href={whatsappLink(`Hello, could you send me the supplement facts for ${p.fullName}?`)} target="_blank" rel="noopener noreferrer" className="link-rule self-start text-[11px]">
                    Ask us for a photo of the label →
                  </a>
                </div>
              )}
            </div>
          </div>
        </Section>

        <Section id="suits" n={num()} title="Who it may suit — and who it isn’t for">
          <div className="flex flex-col gap-8">
            {(extra.suits || extra.notFor) && (
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <span className="label border-b-2 border-mint pb-3 text-slate-text">May suit</span>
                  {(extra.suits ?? []).map((x) => (
                    <span key={x} className="border-b border-hairline py-3.5 text-base leading-[1.4]">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="label border-b-2 border-ink pb-3 text-slate-text">Not what it’s for</span>
                  {(extra.notFor ?? []).map((x) => (
                    <span key={x} className="border-b border-hairline py-3.5 text-base leading-[1.4]">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {!extra.suits && (
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col">
                  <span className="label border-b-2 border-mint pb-3 text-slate-text">Shelved for</span>
                  {(goals.length ? goals : [cat.name]).map((x) => (
                    <span key={x} className="border-b border-hairline py-3.5 text-base leading-[1.4]">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col">
                  <span className="label border-b-2 border-ink pb-3 text-slate-text">Not what it’s for</span>
                  <span className="border-b border-hairline py-3.5 text-base leading-[1.4]">A treatment for any medical condition</span>
                  <span className="border-b border-hairline py-3.5 text-base leading-[1.4]">Children, unless the label says otherwise — ask us</span>
                  <span className="border-b border-hairline py-3.5 text-base leading-[1.4]">Replacing medication without medical advice</span>
                </div>
              </div>
            )}
            <Warnings items={extra.warnings ?? defaultWarnings} />
          </div>
        </Section>

        <Section id="delivery" n={num()} title="Delivery & storage">
          <div className="grid grid-cols-3 border border-hairline">
            {[
              ["Dispatch", "Before 4 PM", `Orders placed before 4 PM leave our ${site.city} stockroom the same day.`],
              ["Storage", extra.storage ?? "15–25 °C", extra.storage ? "As stated on the label." : "Keep sealed, away from direct sunlight, unless the label says to refrigerate."],
              ["Shelf life", extra.shelfLife ?? "Checked", extra.shelfLife ? "Current batch, checked on arrival." : `Every batch’s expiry is logged when it arrives in ${site.city}.`],
            ].map(([k, v, d]) => (
              <div key={k} className="flex flex-col gap-2.5 border-r border-hairline p-6 last:border-r-0">
                <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{k}</span>
                <span className="font-display text-[30px] font-medium leading-none">{v}</span>
                <span className="text-[15px] leading-normal">{d}</span>
              </div>
            ))}
          </div>
        </Section>

        {compare.length > 0 && (
          <section id="compare" className="flex scroll-mt-20 flex-col gap-7 border-b border-hairline py-[88px]">
            <div className="flex items-end justify-between">
              <div className="flex flex-col gap-2.5">
                <Eyebrow>{num()} · Compare</Eyebrow>
                <H2>Other {p.ingredients[0].toLowerCase()} on the shelf</H2>
              </div>
              <Link href={`/search?q=${encodeURIComponent(p.ingredients[0])}`} className="link-rule">
                All {p.ingredients[0].toLowerCase()} →
              </Link>
            </div>
            <div role="table" className="flex flex-col border-t-2 border-ink">
              <div role="row" className="grid grid-cols-[2.2fr_1.6fr_1fr_1fr_1fr_120px] gap-5 border-b border-ink py-3.5 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">
                {["Product", "Best for", "Form", "Count", "Price", ""].map((h, i) => (
                  <span key={i} role="columnheader">
                    {h}
                  </span>
                ))}
              </div>
              {compare.map((c) => {
                const self = c.slug === p.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/products/${c.slug}`}
                    role="row"
                    aria-current={self ? "page" : undefined}
                    className={`grid grid-cols-[2.2fr_1.6fr_1fr_1fr_1fr_120px] items-center gap-5 border-b border-hairline py-[18px] text-ink ${self ? "bg-paper-shade" : "hover:bg-paper-hover"}`}
                  >
                    <span role="cell" className="flex flex-col gap-1">
                      <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{c.brand}</span>
                      <span className="text-[17px] font-medium leading-[1.2]">{c.name}</span>
                    </span>
                    <span role="cell" className="text-[15px] leading-[1.3]">
                      {productContent[c.slug]?.bestFor ?? (c.goals.slice(0, 2).map((g) => GOAL_BY_SLUG[g].name).join(" · ") || "—")}
                    </span>
                    <span role="cell" className="text-[15px] font-medium leading-none">
                      {c.form ?? c.format ?? "—"}
                    </span>
                    <span role="cell" className="text-[15px] font-medium leading-none tabular-nums">
                      {c.count ?? "—"}
                    </span>
                    <span role="cell" className="text-base font-semibold leading-none">
                      {c.price > 0 ? money(c.price) : "—"}
                    </span>
                    <span role="cell" className="text-right text-[11px] font-semibold uppercase leading-none tracking-[.14em]">
                      {self ? "Viewing" : "View →"}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {related.length > 0 && (
        <section className="flex flex-col gap-6 px-4 pb-16 pt-10 lg:gap-9 lg:px-12 lg:pb-[110px] lg:pt-[88px]">
          <div className="flex flex-col gap-2.5">
            <Eyebrow>Pairs well with</Eyebrow>
            <H2>Completes the routine</H2>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 lg:grid-cols-4 lg:gap-6">
            {related.map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** On mobile the BuyBox only contributes its sticky bar and delivery panel. */
function BuyBoxMobileOnly(props: React.ComponentProps<typeof BuyBox>) {
  return (
    <div className="flex flex-col gap-3 [&>div:first-child]:hidden">
      <BuyBox {...props} />
    </div>
  );
}
