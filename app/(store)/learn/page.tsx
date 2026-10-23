import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ProductImage";
import { articleMeta, articles } from "@/content/editorial";

export const metadata: Metadata = { title: "Learn", description: "Plain answers to the questions behind the shelf, reviewed by our pharmacist.", alternates: { canonical: "/learn" } };

export default function LearnPage() {
  return (
    <div className="px-4 pb-20 pt-6 lg:px-12 lg:pb-[100px] lg:pt-9">
      <span className="eyebrow">Learn</span>
      <h1 className="m-0 mt-4 font-display text-[48px] font-medium leading-[.9] lg:text-[96px] lg:leading-[.88] lg:tracking-[-.015em]">Plain answers to the questions behind the shelf.</h1>
      <p className="mt-5 max-w-[560px] text-lg leading-normal">Short guides and explainers, each reviewed by our pharmacist.</p>
      <div className="mt-10 grid gap-x-6 gap-y-12 border-t border-ink pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link key={a.title} href={a.href} className="group flex flex-col gap-3.5 text-ink">
            <Photo src={a.image} alt={a.caption} sizes="(min-width:1024px) 31vw, (min-width:640px) 48vw, 100vw" className="aspect-[4/3] rounded-sm" />
            <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{articleMeta(a)}</span>
            <span className="font-display text-[28px] font-medium leading-none group-hover:text-slate-700 lg:text-[32px]">{a.title}</span>
            <span className="text-[15px] leading-[1.45] text-slate-text">{a.dek}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
