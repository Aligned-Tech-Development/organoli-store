import type { Metadata } from "next";
import { site, whatsappLink } from "@/content/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about a product, an order or a return? Send a message and a pharmacist will reply, or reach us on WhatsApp.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="px-4 pb-24 pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start lg:gap-20 lg:px-12 lg:pb-[110px] lg:pt-16">
      <div className="flex flex-col gap-5">
        <span className="eyebrow">Contact us</span>
        <h1 className="m-0 font-display text-[56px] font-medium leading-[.86] lg:text-[96px]">Ask us anything.</h1>
        <p className="m-0 max-w-[460px] text-base leading-[1.55] lg:text-lg">A product question, an order or a return — send a message and a pharmacist will reply.</p>
        <div className="mt-2 flex flex-col gap-3 border-t border-hairline pt-5 text-[15px]">
          <span className="text-[11px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">Faster on WhatsApp</span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="link-rule self-start">
            WhatsApp {site.whatsapp.display}
          </a>
          <a href={`mailto:${site.email}`} className="link-rule self-start">
            {site.email}
          </a>
        </div>
      </div>
      <div className="mt-12 lg:mt-2">
        <ContactForm />
      </div>
    </div>
  );
}
