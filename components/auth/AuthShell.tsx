import Link from "next/link";
import { Photo } from "@/components/ProductImage";
import { site, whatsappLink } from "@/content/site";
import { DeviceStub } from "./DeviceStub";

type Mode = "sign-in" | "sign-up";

const COPY: Record<Mode, { title: string; lede: string }> = {
  "sign-in": {
    title: "Sign in.",
    lede: "Use the email you created your account with. Anything you’ve saved to your wishlist here is added to your account; your bag stays as it is.",
  },
  "sign-up": {
    title: "Create an account.",
    lede: "An email address and a password — that’s all we ask for. You can change either later from your account page.",
  },
};

/**
 * Auth page: the form is set on a dispensing label — ink header strip with the
 * Sign in / Create account switch, registration marks, and a perforated stub
 * showing what is already saved on this device.
 */
export function AuthShell({ mode, children }: { mode: Mode; children: React.ReactNode }) {
  const c = COPY[mode];
  const tab = (m: Mode, label: string) => (
    <Link
      href={`/${m}`}
      aria-current={m === mode ? "page" : undefined}
      className={`relative flex h-full items-center text-[11px] font-semibold uppercase leading-none tracking-[.16em] transition-colors ${
        m === mode ? "text-paper" : "text-paper/55 hover:text-paper"
      }`}
    >
      {label}
      {m === mode && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-mint" />}
    </Link>
  );

  return (
    <section className="px-4 pb-20 pt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_480px] lg:items-start lg:gap-20 lg:px-12 lg:pb-[110px] lg:pt-16 xl:grid-cols-[minmax(0,1fr)_520px]">
      {/* Headline column */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--hdr,0px)+64px)] lg:pt-2">
        <span className="eyebrow">Your account</span>
        <h1 className="m-0 font-display text-[60px] font-medium leading-[.86] tracking-[-.015em] lg:text-[clamp(88px,8vw,128px)]">{c.title}</h1>
        <p className="m-0 max-w-[460px] text-base leading-[1.55] lg:text-lg">{c.lede}</p>
        <div className="mt-4 hidden max-w-[460px] items-center gap-3.5 border-t border-hairline pt-5 lg:flex">
          <Photo src={site.pharmacist.avatar} sizes="44px" className="h-11 w-11 flex-none rounded-full" />
          <span className="flex flex-col gap-1">
            <span className="text-[15px] font-medium leading-[1.35]">An account is optional. Checkout works without one — your order goes straight to our pharmacist.</span>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium uppercase leading-none tracking-[.14em] text-slate-text hover:text-ink">
              WhatsApp {site.whatsapp.display}
            </a>
          </span>
        </div>
      </div>

      {/* The label */}
      <div className="relative mt-10 lg:mt-0">
        {(["-left-1.5 -top-[11px]", "-right-1.5 -top-[11px]", "-bottom-[11px] -left-1.5", "-bottom-[11px] -right-1.5"] as const).map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute z-[1] bg-paper text-lg font-light leading-none text-slate-700 ${pos}`}>
            +
          </span>
        ))}
        <div className="border border-ink bg-paper">
          <div className="on-dark flex h-12 items-center justify-between gap-4 bg-ink px-5 text-paper">
            <span className="flex items-center gap-2 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-paper/70">
              <span aria-hidden="true" className="flex h-3.5 w-3.5 items-center justify-center bg-mint text-[11px] text-ink">
                +
              </span>
              Organoli · Account
            </span>
            <nav aria-label="Account" className="flex h-full gap-5">
              {tab("sign-in", "Sign in")}
              {tab("sign-up", "Create account")}
            </nav>
          </div>
          <div className="px-5 pb-7 pt-7 sm:px-8">{children}</div>
          <DeviceStub />
        </div>
      </div>
    </section>
  );
}
