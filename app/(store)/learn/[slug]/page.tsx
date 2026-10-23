import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Photo } from "@/components/ProductImage";
import { articleMeta, articles, getArticle } from "@/content/editorial";
import { whatsappLink } from "@/content/site";
import { JsonLd, breadcrumbLd } from "@/lib/structuredData";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const a = getArticle((await params).slug);
  if (!a) return {};
  return { title: a.title, description: a.dek, alternates: { canonical: a.href }, openGraph: { title: a.title, description: a.dek, type: "article", images: [a.image] } };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const a = getArticle((await params).slug);
  if (!a) notFound();
  const more = articles.filter((x) => x.slug !== a.slug && x.topics.some((t) => a.topics.includes(t)));
  const next = [...more, ...articles.filter((x) => x.slug !== a.slug && !more.includes(x))].slice(0, 3);

  return (
    <>
      <JsonLd data={breadcrumbLd([["Learn", "/learn"], [a.title, a.href]])} />
      <article className="px-4 pb-16 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
        <nav aria-label="Breadcrumb" className="text-[11px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">
          <Link href="/learn" className="hover:text-ink">
            Learn
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          {a.type}
        </nav>
        <header className="mx-auto mt-8 flex max-w-[760px] flex-col gap-5 lg:mt-12">
          <span className="label text-slate-text">{articleMeta(a)} · Reviewed by our pharmacist</span>
          <h1 className="m-0 font-display text-[44px] font-medium leading-[.95] lg:text-[72px] lg:leading-[.92]">{a.title}</h1>
          <p className="m-0 text-lg leading-[1.55] text-slate-text lg:text-xl">{a.dek}</p>
        </header>
        <Photo src={a.image} alt={a.caption} sizes="(min-width:1024px) 1000px, 100vw" priority className="mx-auto mt-8 aspect-[16/9] max-w-[1000px] rounded-sm lg:mt-12" />

        <div className="mx-auto mt-10 flex max-w-[680px] flex-col gap-9 text-[17px] leading-[1.7] lg:mt-14 lg:text-lg">
          {a.body.map((s, i) => (
            <section key={i} className="flex flex-col gap-4">
              {s.heading && <h2 className="m-0 font-display text-[28px] font-medium leading-[1.05] lg:text-[34px]">{s.heading}</h2>}
              {s.paragraphs?.map((p) => (
                <p key={p} className="m-0">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                  {s.list.map((li) => (
                    <li key={li} className="relative pl-6">
                      <span aria-hidden="true" className="absolute left-0 top-[.75em] h-1.5 w-1.5 rounded-full bg-mint" />
                      {li}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <aside className="flex flex-col gap-4 border-y border-hairline py-7">
            <p className="m-0 text-[15px] leading-[1.55] text-slate-text">
              General information, not medical advice. If you’re pregnant, breastfeeding, taking medication or managing a health condition, check with your doctor or our pharmacist before starting a supplement.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <Link href={a.shop.href} className="flex h-12 items-center rounded-sm bg-slate-700 px-5 text-xs font-semibold uppercase tracking-[.14em] text-paper hover:bg-ink">
                {a.shop.label} →
              </Link>
              <a
                href={whatsappLink(`Hello, I have a question about: ${a.title}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center rounded-sm border border-ink px-5 text-xs font-semibold uppercase tracking-[.14em] hover:bg-paper-shade"
              >
                Ask our pharmacist
              </a>
            </div>
          </aside>
        </div>
      </article>

      <section className="border-t border-hairline px-4 pb-20 pt-10 lg:px-12 lg:pb-[100px] lg:pt-14" aria-labelledby="more-title">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="more-title" className="m-0 font-display text-[36px] font-medium leading-none lg:text-[48px]">
            Keep reading
          </h2>
          <Link href="/learn" className="link-rule flex-none">
            All articles →
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {next.map((x) => (
            <Link key={x.slug} href={x.href} className="group flex flex-col gap-3 text-ink">
              <Photo src={x.image} alt={x.caption} sizes="(min-width:1024px) 31vw, (min-width:640px) 48vw, 100vw" className="aspect-[4/3] rounded-sm" />
              <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{articleMeta(x)}</span>
              <span className="font-display text-[26px] font-medium leading-none group-hover:text-slate-700">{x.title}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
