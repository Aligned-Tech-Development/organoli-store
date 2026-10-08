import Link from "next/link";
import { site, whatsappLink } from "@/content/site";
import { FooterAccordion } from "./FooterAccordion";

const COLS: { h: string; l: [string, string][] }[] = [
  { h: "Shop", l: [["All products", "/shop"], ["Shop by goal", "/#shop-by-goal"], ["Brands A–Z", "/brands"], ["New on the shelf", "/shop?sort=new"], ["Wishlist", "/wishlist"]] },
  { h: "Help", l: [["Find your routine", "/routine"], ["Ask a pharmacist", whatsappLink()], ["Returns", whatsappLink("Hello, I'd like to return an item.")], ["Track an order", whatsappLink("Hello, I'd like to track my order.")], ["Search", "/search"]] },
  { h: "Organoli", l: [["How we curate", "/#how-we-curate"], ["Learn", "/#learn"], ["Our counter", "/#why-organoli"], ["For practitioners", `mailto:${site.email}`]] },
  { h: "Delivery", l: site.deliveryZones.map((z) => [`${z.zone} — ${z.time}`, "/#why-organoli"] as [string, string]) },
  { h: "Social", l: [...site.social.map((s) => [s.label, s.href] as [string, string]), ["Weekly letter", "/#newsletter"]] },
];

const FooterLink = ({ label, href, className }: { label: string; href: string; className: string }) =>
  href.startsWith("/") ? (
    <Link href={href} className={className}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {label}
    </a>
  );

export function SiteFooter() {
  const disclaimer = `Food supplements are not a substitute for a varied diet or medical care. Speak to your doctor if you are pregnant, nursing or taking medication. © ${new Date().getFullYear()} Organoli SAL, Beirut, Lebanon.`;
  return (
    <footer className="on-dark bg-ink font-sans text-paper">
      {/* Desktop */}
      <div className="hidden px-12 pb-8 pt-[72px] lg:block">
        <div className="grid grid-cols-[1.4fr_repeat(5,minmax(0,1fr))] gap-10 border-b border-paper/20 pb-14">
          <div className="flex flex-col gap-[18px]">
            <span className="label text-mint">The counter</span>
            <p className="m-0 max-w-[300px] text-base leading-[1.55]">
              {site.counter.address}. Open {site.counter.hours}. A pharmacist answers every message — usually within the hour.
            </p>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center self-start rounded-sm border border-paper/40 px-[18px] text-xs font-semibold uppercase leading-none tracking-[.14em] hover:border-mint hover:text-mint">
              WhatsApp {site.whatsapp.display}
            </a>
          </div>
          {COLS.map((c) => (
            <div key={c.h} className="flex flex-col gap-3">
              <span className="label pb-1.5 text-slate-300">{c.h}</span>
              {c.l.map(([label, href]) => (
                <FooterLink key={label} label={label} href={href} className="text-[15px] leading-[1.3] hover:text-mint" />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between gap-10 pt-10">
          <div className="flex items-center gap-[18px]" aria-hidden="true">
            <span className="flex h-[72px] w-[72px] items-center justify-center bg-mint text-[64px] font-medium leading-none text-ink">+</span>
            <span className="font-display text-[120px] font-semibold uppercase leading-[.8] tracking-[.04em]">Organoli</span>
          </div>
          <div className="flex max-w-[460px] flex-col items-end gap-2.5 text-right">
            <span className="text-[11px] font-medium uppercase leading-[1.4] tracking-[.14em] text-slate-300">{site.payments.join(" · ")}</span>
            <span className="text-[12.5px] leading-normal text-slate-300">{disclaimer}</span>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col px-4 pb-[110px] pt-7 lg:hidden">
        <FooterAccordion cols={COLS} />
        <span className="pt-6 text-[13.5px] leading-normal text-mist">
          {site.counter.address} · {site.counter.hoursShort} · WhatsApp {site.whatsapp.display}
        </span>
        <span className="pt-4 text-xs leading-normal text-slate-300">{disclaimer}</span>
        <span className="pt-5 font-display text-[64px] font-semibold uppercase leading-[.8] tracking-[.04em]" aria-hidden="true">
          Organoli<span className="text-mint">+</span>
        </span>
      </div>
    </footer>
  );
}
