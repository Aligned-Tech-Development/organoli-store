import { Photo } from "@/components/ProductImage";
import { site, whatsappLink } from "@/content/site";

/** Split layout for sign-in / sign-up: dark brand panel + form. */
export function AuthShell({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede: string; children: React.ReactNode }) {
  return (
    <section className="lg:grid lg:min-h-[calc(100dvh-170px)] lg:grid-cols-[5fr_7fr]">
      <div className="on-dark relative flex flex-col justify-between gap-8 overflow-hidden bg-ink px-4 py-10 text-paper lg:px-12 lg:pb-10 lg:pt-14">
        <Photo src="/images/hero-dropper.jpg" sizes="40vw" duotone className="absolute inset-0 opacity-25" />
        <div className="relative flex flex-col gap-5">
          <span className="label text-mint">{eyebrow}</span>
          <h1 className="m-0 font-display text-[48px] font-medium leading-[.92] lg:text-[76px]">{title}</h1>
          <p className="m-0 max-w-[420px] text-base leading-[1.55] text-mist lg:text-[17px]">{lede}</p>
        </div>
        <div className="relative hidden flex-col gap-3 border-t border-paper/20 pt-5 lg:flex">
          <span className="text-[15px] leading-[1.4]">Questions about an order or a product?</span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="label self-start border-b border-mint pb-1 text-paper">
            WhatsApp {site.whatsapp.display} →
          </a>
        </div>
      </div>
      <div className="flex items-start justify-center px-4 py-10 lg:items-center lg:px-14 lg:py-16">{children}</div>
    </section>
  );
}
