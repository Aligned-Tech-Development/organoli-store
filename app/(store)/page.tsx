import Image from "next/image";
import Link from "next/link";
import { CountUp, DrawRule, Reveal } from "@/components/motion";
import { Placeholder } from "@/components/ProductImage";
import { Edits, type EditView } from "@/components/home/Edits";
import { Essentials } from "@/components/home/Essentials";
import { Favourites } from "@/components/home/Favourites";
import { GoalIndex } from "@/components/home/GoalIndex";
import { Hero, type HeroProduct } from "@/components/home/Hero";
import { Newsletter } from "@/components/home/Newsletter";
import { articleMeta, articles, curateSteps, edits, featuredBrands, trustPoints, trustStrip } from "@/content/editorial";
import { bestSellers, essentialsTabs, heroProduct, pharmacistPicks } from "@/content/merchandising";
import { site } from "@/content/site";
import { cardsFor, categoryCounts, getBrand, getBrands, getProduct, goalCounts, inCategory, newArrivals, recommended, toCard, totalCounts } from "@/lib/catalog";
import { roundWords } from "@/lib/format";
import type { CategorySlug } from "@/lib/types";

function heroCard(): HeroProduct | null {
  const p = getProduct(heroProduct);
  if (!p) return null;
  const words = p.name.split(" ");
  const mid = Math.ceil(words.length / 2);
  return {
    slug: p.slug,
    no: String(p.id).padStart(4, "0"),
    lines: words.length > 1 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : [p.name, ""],
    rows: [
      ["Dose", p.dose ?? "See label"],
      ["Count", p.count ?? "—"],
      ["Form", [p.form ?? p.format, p.dietary.includes("Vegan") ? "vegan" : null].filter(Boolean).join(" · ") || "—"],
    ],
    price: p.price,
    short: p.name,
    spec: p.specLine ?? "",
  };
}

const TILE_BG = ["ph-paper", "ph-mint"];

export default function HomePage() {
  const totals = totalCounts();
  const cats = categoryCounts();
  const brands = getBrands();

  const editViews: EditView[] = edits.map((e) => ({
    tab: e.tab,
    title: e.title,
    dek: e.dek,
    meta: `The edit · ${e.steps.length} products · ${e.window}`,
    caption: e.caption,
    tone: e.tone,
    foot: e.foot,
    steps: e.steps.flatMap((s) => {
      const p = getProduct(s.product);
      return p ? [{ time: s.time, label: s.label, p: toCard(p) }] : [];
    }),
  }));

  const featured = [...bestSellers, ...pharmacistPicks].map(getProduct).filter((p) => p !== null);
  const essentials = essentialsTabs.map((t) => ({
    label: t.label,
    items: (t.category ? recommended(inCategory(t.category as CategorySlug).filter((p) => p.stock !== "out"), 8) : recommended(featured, 8)).map(toCard),
  }));

  const marquee = brands.slice(0, 8).map((b) => b.name);
  const curate = curateSteps.map((c, i) => ({ ...c, num: c.num ?? (i === 1 ? totals.brands : totals.products) }));

  return (
    <>
      <Hero headline={`${roundWords(totals.brands)} brands.`} product={heroCard()} />

      {/* Trust strip */}
      <div className="no-scrollbar flex overflow-x-auto border-b border-hairline lg:grid lg:grid-cols-4">
        {trustStrip.map((t) => (
          <div key={t} className="flex flex-none items-center gap-3 border-r border-hairline px-4 py-4 text-[11px] font-semibold uppercase leading-[1.2] tracking-[.16em] lg:px-12 lg:py-[22px] lg:text-xs">
            <span aria-hidden="true" className="text-base text-slate-700">
              +
            </span>
            {t}
          </div>
        ))}
      </div>

      {/* Shop by category */}
      <section className="px-4 pb-6 pt-9 lg:px-12 lg:pb-[72px] lg:pt-16" aria-labelledby="cat-title">
        <div className="mb-5 flex items-end justify-between gap-6 lg:mb-7">
          <h2 id="cat-title" className="m-0 font-display text-[38px] font-medium leading-[.95] lg:text-[52px]">
            Shop by category
          </h2>
          <Link href="/shop" className="link-rule flex-none text-[11px] lg:text-xs">
            All {totals.products} products →
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 grid snap-x snap-mandatory auto-cols-[42%] grid-flow-col gap-3 overflow-x-auto px-4 sm:auto-cols-[26%] lg:mx-0 lg:grid-flow-row lg:grid-cols-8 lg:gap-4 lg:overflow-visible lg:px-0">
          {cats.map((c, i) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} className="group flex snap-start flex-col gap-2.5 text-ink hover:text-slate-700">
              <span className={`relative aspect-square overflow-hidden rounded-sm border border-hairline transition-transform duration-[400ms] ease-out group-hover:-translate-y-[3px] ${TILE_BG[i % 2]}`}>
                {c.image ? (
                  <span className="absolute inset-[14%]">
                    <Image src={c.image.src} alt="" fill sizes="(min-width:1024px) 12vw, 42vw" className="object-contain mix-blend-multiply" />
                  </span>
                ) : (
                  <span className="caption absolute bottom-2 left-2 text-[9px] text-slate-text">{c.caption}</span>
                )}
              </span>
              <span className="flex items-baseline justify-between gap-1.5">
                <span className="text-base font-medium leading-[1.2] lg:text-[17px]">{c.short}</span>
                <span className="text-[12.5px] font-medium leading-none tabular-nums text-slate-text">{c.count}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Favourites
        tabs={[
          { label: "Best sellers", short: "Best sellers", items: cardsFor(bestSellers) },
          { label: "New on the shelf", short: "New", items: newArrivals(6) },
          { label: "Pharmacist picks", short: "Pharmacist picks", items: cardsFor(pharmacistPicks) },
        ]}
      />

      <GoalIndex goals={goalCounts().map(({ slug, name, ingredients, caption, count }) => ({ slug, name, ingredients, caption, count }))} />

      <Edits edits={editViews} />

      <Essentials tabs={essentials} total={totals.products} />

      {/* Why Organoli */}
      <section id="why-organoli" className="on-dark bg-ink px-4 py-10 text-paper lg:px-12 lg:py-[120px]" aria-labelledby="why-title">
        <div className="flex flex-col gap-1.5 lg:grid lg:grid-cols-[5fr_7fr] lg:items-start lg:gap-[72px]">
          <Reveal className="flex flex-col gap-2.5 lg:sticky lg:top-10 lg:gap-7">
            <span className="label text-[10.5px] text-mint lg:text-[11px] lg:tracking-[.18em]">Why Organoli</span>
            <h2 id="why-title" className="m-0 mb-3.5 font-display text-[40px] font-medium leading-[.95] lg:mb-0 lg:text-[72px] lg:leading-[.92]">
              <span className="lg:hidden">Six things before anything reaches your door.</span>
              <span className="hidden lg:inline">Six things that happen before anything reaches your door.</span>
            </h2>
            <DispensingLabel />
          </Reveal>
          <div className="flex flex-col lg:border-t lg:border-paper/30">
            {trustPoints.map((t) => (
              <Reveal key={t.n} className="flex items-baseline justify-between gap-3 border-t border-paper/20 py-3.5 lg:grid lg:grid-cols-[56px_minmax(0,1fr)_150px] lg:gap-6 lg:border-b lg:border-t-0 lg:border-paper/20 lg:py-[30px]">
                <span className="hidden text-[13px] font-medium leading-none tabular-nums text-slate-300 lg:block">{t.n}</span>
                <span className="flex flex-col gap-2">
                  <span className="font-display text-[22px] font-medium leading-none lg:text-4xl">{t.h}</span>
                  <span className="hidden max-w-[460px] text-base leading-normal text-mist lg:block">{t.d}</span>
                </span>
                <span className="text-right text-[10.5px] font-semibold uppercase leading-[1.2] tracking-[.12em] text-mint lg:text-xs lg:leading-[1.3] lg:tracking-[.14em]">
                  <span className="lg:hidden">{t.vShort}</span>
                  <span className="hidden lg:inline">{t.v}</span>
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How we curate */}
      <section id="how-we-curate" className="px-4 py-10 lg:px-12 lg:py-[120px]" aria-labelledby="curate-title">
        <div className="mb-3.5 grid gap-14 lg:mb-[72px] lg:grid-cols-[7fr_5fr] lg:items-end">
          <Reveal className="flex flex-col gap-5">
            <span className="eyebrow hidden lg:block">How we curate</span>
            <h2 id="curate-title" className="m-0 font-display text-[40px] font-medium leading-[.95] lg:text-[104px] lg:leading-[.88] lg:tracking-[-.015em]">
              Most products
              <br className="hidden lg:block" /> don’t make the shelf.
            </h2>
          </Reveal>
          <Reveal className="hidden flex-col gap-5 lg:flex">
            <Placeholder caption="Stockroom, Beirut · pharmacist checking batch numbers" className="aspect-[3/2] rounded-sm" />
            <p className="m-0 text-[17px] leading-[1.55]">We start from the ingredient and the evidence, not the brand’s marketing. Then we check every batch again when it lands.</p>
          </Reveal>
        </div>
        <div className="flex flex-col lg:grid lg:grid-cols-4 lg:gap-8">
          {curate.map((c) => (
            <Reveal key={c.n} className="grid grid-cols-[36px_minmax(0,1fr)] gap-2.5 border-t border-hairline py-3.5 lg:flex lg:flex-col lg:gap-[18px] lg:border-t-0 lg:py-0">
              <span className="hidden lg:block">
                <DrawRule />
              </span>
              <span className="text-[13px] font-medium leading-[1.4] tabular-nums text-slate-text lg:text-[15px] lg:leading-none">{c.n}</span>
              <span className="flex flex-col gap-1 lg:contents">
                <span className="font-display text-2xl font-medium leading-none lg:text-[44px]">{c.h}</span>
                <span className="text-[14.5px] leading-[1.45] lg:hidden">{c.short}</span>
                <p className="m-0 hidden min-h-[100px] text-base leading-[1.55] lg:block">{c.d}</p>
                <span className="hidden flex-col gap-1.5 border-t border-dashed border-spec-rule pt-4 lg:flex">
                  <span className="font-display text-[52px] font-medium leading-none tabular-nums">
                    <CountUp to={c.num} suffix={c.suffix} />
                  </span>
                  <span className="text-[10.5px] font-semibold uppercase leading-[1.3] tracking-[.14em] text-slate-text">{c.k}</span>
                </span>
              </span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Brands */}
      <section id="brands" className="hidden bg-paper-shade py-[110px] lg:block" aria-labelledby="brands-title">
        <Reveal className="mb-10 flex items-end justify-between gap-10 px-12">
          <div className="flex flex-col gap-5">
            <span className="eyebrow">Brands</span>
            <h2 id="brands-title" className="m-0 font-display text-[76px] font-medium leading-[.92]">
              {roundWords(totals.brands)} brands, each for a reason.
            </h2>
          </div>
          <Link href="/brands" className="link-rule flex-none">
            All brands A–Z →
          </Link>
        </Reveal>
        <div className="overflow-hidden border-y border-hairline py-[26px]" aria-hidden="true">
          <div className="flex w-max gap-14 whitespace-nowrap motion-safe:animate-marquee">
            {[...marquee, ...marquee].map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="flex items-center gap-14 font-display text-[88px] font-medium uppercase leading-none tracking-[-.01em]"
                style={i % 2 ? { color: "transparent", WebkitTextStroke: "1px #24343A" } : { color: "#24343A" }}
              >
                {n}
                <span className="font-sans text-[40px] font-light leading-none text-slate-700 [-webkit-text-stroke:0]">+</span>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6 px-12 pt-12">
          {featuredBrands.map((fb) => {
            const b = getBrand(fb.slug);
            if (!b) return null;
            return (
              <Reveal key={fb.slug}>
                <Link href={`/shop?brand=${b.slug}`} className="flex h-full flex-col gap-4 border border-hairline bg-paper px-4 pb-[22px] pt-4 text-ink transition-colors duration-[250ms] hover:border-ink">
                  <Placeholder caption={fb.caption} className="aspect-[3/2]" />
                  <span className="flex items-baseline justify-between">
                    <span className="font-display text-4xl font-medium leading-none">{b.name}</span>
                    <span className="text-[13px] font-medium leading-none text-slate-text">{b.productCount} products</span>
                  </span>
                  <span className="text-[11px] font-medium uppercase leading-[1.3] tracking-[.12em] text-slate-text">{fb.origin}</span>
                  <span className="border-t border-hairline pt-3.5 text-[15.5px] leading-normal">
                    <strong className="font-semibold">Why it’s on the shelf: </strong>
                    {fb.why}
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Learn */}
      <section id="learn" className="px-4 py-10 lg:px-12 lg:py-[120px]" aria-labelledby="learn-title">
        <Reveal className="mb-8 flex flex-col gap-5 border-b border-ink pb-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-7">
          <div className="flex flex-col gap-3.5 lg:gap-5">
            <span className="eyebrow">Learn</span>
            <h2 id="learn-title" className="m-0 font-display text-[40px] font-medium leading-[.95] lg:text-[76px] lg:leading-[.92]">
              Plain answers to the questions behind the shelf.
            </h2>
          </div>
          <Link href="/search?q=guide" className="link-rule flex-none self-start lg:self-auto">
            All articles →
          </Link>
        </Reveal>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[7fr_5fr] lg:gap-14">
          <Reveal>
            <Link href={articles[0].href} className="flex flex-col gap-5 text-ink">
              <Placeholder caption={articles[0].caption} tone="slate" className="aspect-[4/3] rounded-sm p-[18px]" />
              <span className="label text-slate-text">
                {articleMeta(articles[0])} · Reviewed by {site.pharmacist.name}, {site.pharmacist.credentials}
              </span>
              <span className="font-display text-[40px] font-medium leading-[.95] lg:text-[54px]">{articles[0].title}</span>
              <span className="max-w-[620px] text-base leading-[1.55] lg:text-lg">{articles[0].dek}</span>
            </Link>
          </Reveal>
          <div className="flex flex-col">
            {articles.slice(1, 4).map((a) => (
              <Reveal key={a.title}>
                <Link href={a.href} className="grid grid-cols-[minmax(0,1fr)_96px] gap-5 border-b border-hairline py-6 text-ink lg:grid-cols-[minmax(0,1fr)_140px]">
                  <span className="flex flex-col gap-2.5">
                    <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{articleMeta(a)}</span>
                    <span className="font-display text-[26px] font-medium leading-none lg:text-[30px]">{a.title}</span>
                    <span className="text-[15px] leading-[1.45] text-slate-text">{a.dek}</span>
                  </span>
                  <Placeholder className="aspect-square rounded-sm" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function DispensingLabel() {
  const p = getProduct(bestSellers[0]) ?? getProduct(heroProduct);
  return (
    <div className="relative mt-6 hidden aspect-[7/4] max-w-[460px] -rotate-2 flex-col justify-between bg-paper px-6 py-[22px] text-ink shadow-[0_40px_60px_-30px_rgba(0,0,0,.6)] lg:flex" aria-hidden="true">
      <span className="absolute -left-3 -top-3 text-xl font-light leading-none text-mint">+</span>
      <span className="absolute -bottom-3 -right-3 text-xl font-light leading-none text-mint">+</span>
      <div className="flex justify-between text-[9.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">
        <span>Organoli · Dispensing label</span>
        <span>70 × 40 mm</span>
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-display text-[32px] font-medium leading-none">{p ? `${p.brand ?? ""} ${p.name}`.trim() : "Organoli"}</span>
        <span className="text-[11px] font-medium uppercase leading-[1.4] tracking-[.1em]">{[p?.count, "Follow the label", "Expiry logged"].filter(Boolean).join(" · ")}</span>
      </div>
      <div className="flex items-center justify-between border-t border-hairline pt-2.5 text-[10px] font-semibold uppercase leading-none tracking-[.14em]">
        <span>Batch logged · received in {site.city}</span>
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-sm">+</span>
          Checked · {site.pharmacist.initials}
        </span>
      </div>
    </div>
  );
}

export const dynamic = "force-static";
