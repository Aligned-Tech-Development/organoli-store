"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { megaIngredients, site, whatsappLink } from "@/content/site";
import { cartCount, useCart, useUI, useWishlist } from "@/lib/store";
import { Logo } from "../Logo";
import { MobileMenu, MobileSearch } from "./MobileOverlays";
import { EmptyPanel, ResultsPanel } from "./SearchPanels";
import type { HeaderData } from "./types";
import { usePredictive } from "./usePredictive";
import { Photo } from "../ProductImage";

const NAV = [
  { label: "Shop", href: "/shop", mega: true },
  { label: "Shop by Goal", href: "/#shop-by-goal" },
  { label: "Brands", href: "/brands" },
  { label: "New & Trending", href: "/shop?sort=new" },
  { label: "How We Curate", href: "/#how-we-curate" },
  { label: "Learn", href: "/#learn" },
];

export function HeaderClient({ data }: { data: HeaderData }) {
  const pathname = usePathname();
  const router = useRouter();
  const { overlay, open, close, bump } = useUI();
  const lines = useCart((s) => s.lines);
  const wishCount = useWishlist((s) => s.slugs.length);
  const count = cartCount(lines);
  const [query, setQuery] = useState("");
  const [hoverNav, setHoverNav] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const compactInputRef = useRef<HTMLInputElement>(null);
  const { data: results } = usePredictive(query);

  const searchOpen = overlay === "search";
  const megaOpen = overlay === "mega";
  const compact = useCompactHeader();
  const activeInput = () => (compact ? compactInputRef.current : inputRef.current);

  // Close overlays on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setHoverNav(-1);
  }
  useEffect(() => {
    close();
  }, [pathname, close]);

  // "/" focuses search, Esc closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        setHoverNav(-1);
        inputRef.current?.blur();
        compactInputRef.current?.blur();
      }
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        (document.documentElement.dataset.compactHeader === "1" ? compactInputRef.current : inputRef.current)?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    close();
    activeInput()?.blur();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const searchPanel = (show: boolean, ref: React.RefObject<HTMLInputElement | null>) => (
    <div
      id={ref === inputRef ? "search-panel" : "search-panel-compact"}
      className={`absolute top-[calc(100%+10px)] z-[5] w-[min(1000px,calc(100vw-96px))] border border-hairline bg-paper shadow-search transition-[opacity,transform] duration-[240ms] ease-out ${
        ref === inputRef ? "left-1/2 -translate-x-1/2" : "right-0"
      } ${
        show ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1.5 opacity-0"
      }`}
      aria-hidden={!show}
      inert={!show}
    >
      {show &&
        (query.trim() ? (
          <ResultsPanel q={query} data={results} onNavigate={close} />
        ) : (
          <EmptyPanel
            trending={data.trending}
            onPick={(q) => {
              setQuery(q);
              ref.current?.focus();
            }}
            onNavigate={close}
          />
        ))}
    </div>
  );

  const activeNav = pathname.startsWith("/shop") || pathname.startsWith("/products") ? 0 : pathname.startsWith("/brands") ? 2 : -1;
  const scrim = searchOpen || megaOpen;

  return (
    <>
      <header className="relative z-[60] bg-paper font-sans text-ink">
        {/* Utility bar */}
        <div className="on-dark flex h-9 items-center justify-center bg-ink px-4 text-[10px] font-medium uppercase leading-[1.3] tracking-[.14em] text-paper lg:justify-between lg:px-12 lg:text-[11px] lg:leading-none lg:tracking-[.16em]">
          <span className="hidden opacity-75 lg:inline">
            {site.city} · Est. {site.established}
          </span>
          <span className="text-center">
            <span className="lg:hidden">Free Beirut delivery over ${site.freeDeliveryThreshold} · Dispatch before 4 PM</span>
            <span className="hidden lg:inline">
              Free delivery in Beirut over ${site.freeDeliveryThreshold} <span className="px-2 text-mint">+</span> Next-day dispatch before 4 PM
            </span>
          </span>
          <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hidden opacity-75 transition-opacity hover:opacity-100 lg:inline">
            Pharmacist on WhatsApp →
          </a>
        </div>

        {/* Desktop main row */}
        <div className="hidden h-[84px] grid-cols-[240px_minmax(0,1fr)_300px] items-center gap-8 px-12 lg:grid">
          <Logo />
          <div className="relative w-full max-w-[720px] justify-self-center">
            <form role="search" onSubmit={submit}>
              <label
                className={`flex h-[50px] items-center gap-3 rounded-sm border bg-field px-4 transition-[border-color,box-shadow] duration-200 ${
                  searchOpen ? "border-ink shadow-halo" : "border-hairline"
                }`}
              >
                <Search size={20} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">Search products, ingredients and brands</span>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    open("search");
                  }}
                  onFocus={() => open("search")}
                  placeholder={`Search ${data.totals.products} products, ingredients or brands — try “magnesium”`}
                  className="min-w-0 flex-1 border-0 bg-transparent text-base leading-none text-ink outline-none placeholder:text-slate-text [&:focus-visible]:shadow-none [&:focus-visible]:outline-none"
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={searchOpen && !compact}
                  aria-controls="search-panel"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center">
                    <X size={16} />
                  </button>
                )}
                <kbd className="border border-hairline px-[7px] py-[5px] font-sans text-[11px] font-medium leading-none tracking-[.1em] text-slate-text">/</kbd>
              </label>
            </form>
            {searchPanel(searchOpen && !compact, inputRef)}
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <Link href="/routine" className="mr-2.5 border-b border-mint pb-[3px] text-xs font-semibold uppercase leading-none tracking-[.14em] text-ink">
              Find your routine
            </Link>
            <a href={whatsappLink("Hello, I have a question about my account/order.")} target="_blank" rel="noopener noreferrer" aria-label="Account and order help" className="flex h-11 w-11 items-center justify-center rounded-sm hover:bg-paper-shade">
              <User size={20} strokeWidth={1.75} />
            </a>
            <Link href="/wishlist" aria-label={`Wishlist (${wishCount})`} className="relative flex h-11 w-11 items-center justify-center rounded-sm hover:bg-paper-shade">
              <Heart size={20} strokeWidth={1.75} />
              {wishCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mint" />}
            </Link>
            <button type="button" onClick={() => useUI.getState().openCart()} aria-label={`Open bag, ${count} items`} className="flex h-11 items-center gap-2 rounded-sm px-3 hover:bg-paper-shade">
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span key={bump} className={`h-5 min-w-5 rounded-pill bg-ink px-[5px] text-center text-[11px] font-semibold leading-5 text-paper ${bump ? "motion-safe:animate-bump" : ""}`}>
                {count}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop nav + mega menu */}
        <div
          className="relative hidden lg:block"
          onMouseLeave={() => {
            setHoverNav(-1);
            if (megaOpen) close();
          }}
        >
          <nav aria-label="Primary" className="flex h-[50px] items-center justify-between border-y border-hairline px-12">
            <div className="flex h-full gap-[34px]">
              {NAV.map((n, i) => {
                const on = hoverNav === i || (hoverNav === -1 && activeNav === i);
                return (
                  <Link
                    key={n.label}
                    href={n.href}
                    onMouseEnter={() => {
                      setHoverNav(i);
                      if (n.mega) open("mega");
                      else if (megaOpen || searchOpen) close();
                    }}
                    onFocus={() => {
                      setHoverNav(i);
                      if (n.mega) open("mega");
                    }}
                    onClick={() => {
                      close();
                      setHoverNav(-1);
                    }}
                    aria-haspopup={n.mega ? "true" : undefined}
                    aria-expanded={n.mega ? megaOpen : undefined}
                    className="relative flex h-full items-center gap-1.5 text-[15px] font-medium leading-none text-ink"
                  >
                    {n.label}
                    {n.mega && <ChevronDown size={14} className="transition-transform duration-[240ms]" style={{ transform: megaOpen ? "rotate(180deg)" : "none" }} />}
                    <span className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-nav ease-out" style={{ transform: on ? "scaleX(1)" : "scaleX(0)" }} />
                  </Link>
                );
              })}
            </div>
            <div className="flex gap-[22px] text-xs font-medium uppercase leading-none tracking-[.12em] text-slate-text">
              <span>Stocked in Lebanon</span>
              <span>{site.currency}</span>
            </div>
          </nav>
          <MegaMenu data={data} open={megaOpen && !compact} onNavigate={close} />
        </div>

        {/* Scrim under the header for search + mega */}
        <div
          onClick={() => {
            close();
            setHoverNav(-1);
          }}
          aria-hidden="true"
          className={`absolute inset-x-0 top-full z-[2] hidden h-[3000px] bg-ink/30 transition-opacity duration-300 ease-[ease] lg:block ${scrim && !compact ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        />
      </header>

      {/* Desktop compact bar — sticks once the full header scrolls away */}
      <div
        className={`fixed inset-x-0 top-0 z-[65] hidden font-sans text-ink transition-transform duration-300 ease-out lg:block ${compact ? "translate-y-0" : "-translate-y-[110%]"}`}
        aria-hidden={!compact}
        inert={!compact}
        onMouseLeave={() => {
          setHoverNav(-1);
          if (megaOpen) close();
        }}
      >
        <div className="relative z-[3] flex h-16 items-center gap-8 border-b border-hairline bg-paper/95 px-12 backdrop-blur-[10px]">
          <Logo size="sm" />
          <nav aria-label="Primary (compact)" className="flex h-full gap-7">
            {NAV.slice(0, 4).map((n, i) => {
              const on = hoverNav === i || (hoverNav === -1 && activeNav === i);
              return (
                <Link
                  key={n.label}
                  href={n.href}
                  onMouseEnter={() => {
                    setHoverNav(i);
                    if (n.mega) open("mega");
                    else if (megaOpen || searchOpen) close();
                  }}
                  onFocus={() => {
                    setHoverNav(i);
                    if (n.mega) open("mega");
                  }}
                  onClick={() => {
                    close();
                    setHoverNav(-1);
                  }}
                  aria-haspopup={n.mega ? "true" : undefined}
                  aria-expanded={n.mega ? megaOpen && compact : undefined}
                  className="relative flex h-full items-center gap-1.5 whitespace-nowrap text-[15px] font-medium leading-none"
                >
                  {n.label}
                  {n.mega && <ChevronDown size={14} className="transition-transform duration-[240ms]" style={{ transform: megaOpen ? "rotate(180deg)" : "none" }} />}
                  <span className="absolute inset-x-0 -bottom-px h-0.5 origin-left bg-ink transition-transform duration-nav ease-out" style={{ transform: on ? "scaleX(1)" : "scaleX(0)" }} />
                </Link>
              );
            })}
          </nav>
          <div className="relative ml-auto w-full max-w-[420px]">
            <form role="search" onSubmit={submit}>
              <label className={`flex h-11 items-center gap-2.5 rounded-sm border bg-field px-3.5 transition-[border-color,box-shadow] duration-200 ${searchOpen ? "border-ink shadow-halo" : "border-hairline"}`}>
                <Search size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">Search products, ingredients and brands</span>
                <input
                  ref={compactInputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    open("search");
                  }}
                  onFocus={() => open("search")}
                  placeholder={`Search ${data.totals.products} products…`}
                  className="min-w-0 flex-1 border-0 bg-transparent text-[15px] leading-none text-ink outline-none placeholder:text-slate-text [&:focus-visible]:shadow-none [&:focus-visible]:outline-none"
                  autoComplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={searchOpen && compact}
                  aria-controls="search-panel-compact"
                />
                {query && (
                  <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="flex h-8 w-8 items-center justify-center">
                    <X size={15} />
                  </button>
                )}
              </label>
            </form>
            {searchPanel(searchOpen && compact, compactInputRef)}
          </div>
          <div className="flex items-center gap-1">
            <Link href="/wishlist" aria-label={`Wishlist (${wishCount})`} className="relative flex h-11 w-11 items-center justify-center rounded-sm hover:bg-paper-shade">
              <Heart size={20} strokeWidth={1.75} />
              {wishCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mint" />}
            </Link>
            <button type="button" onClick={() => useUI.getState().openCart()} aria-label={`Open bag, ${count} items`} className="flex h-11 items-center gap-2 rounded-sm px-3 hover:bg-paper-shade">
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span key={bump} className={`h-5 min-w-5 rounded-pill bg-ink px-[5px] text-center text-[11px] font-semibold leading-5 text-paper ${bump ? "motion-safe:animate-bump" : ""}`}>
                {count}
              </span>
            </button>
          </div>
        </div>
        <div className="relative z-[2]">
          <MegaMenu data={data} open={megaOpen && compact} onNavigate={close} />
        </div>
      </div>
      <div
        onClick={() => {
          close();
          setHoverNav(-1);
        }}
        aria-hidden="true"
        className={`fixed inset-x-0 bottom-0 top-16 z-[64] hidden bg-ink/30 transition-opacity duration-300 ease-[ease] lg:block ${scrim && compact ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      />

        {/* Mobile header */}
      <div className="sticky top-0 z-50 flex flex-col gap-2.5 border-b border-hairline bg-paper px-4 pb-3 pt-2.5 lg:hidden">
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Menu" onClick={() => open("menu")} className="flex h-11 w-11 items-center justify-center">
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <Logo size="sm" />
          <a href={whatsappLink("Hello, I have a question about my account/order.")} target="_blank" rel="noopener noreferrer" aria-label="Account and order help" className="flex h-11 w-11 items-center justify-center">
            <User size={22} strokeWidth={1.75} />
          </a>
        </div>
        <button type="button" onClick={() => open("search")} className="flex h-12 items-center gap-2.5 rounded-sm border border-ink bg-field px-3.5 text-left">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <span className="text-[15px] leading-none text-slate-text">Search ingredient, brand or goal</span>
        </button>
      </div>

      <MobileMenu data={data} open={overlay === "menu"} onClose={close} />
      <MobileSearch data={data} open={searchOpen} onClose={close} />
    </>
  );
}

function MegaMenu({ data, open, onNavigate }: { data: HeaderData; open: boolean; onNavigate: () => void }) {
  const head = "border-b border-hairline pb-1.5 text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text";
  return (
    <div
      className={`absolute inset-x-0 top-full z-[4] border-b border-hairline bg-paper shadow-mega transition-[opacity,transform] duration-menu ease-out ${
        open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2.5 opacity-0"
      }`}
      aria-hidden={!open}
      inert={!open}
    >
      <div className="grid grid-cols-[1fr_1fr_1fr_1.25fr_1.25fr] gap-10 px-12 pb-8 pt-9">
        <div className="flex flex-col gap-3">
          <span className={head}>Categories</span>
          {data.categories.map((c) => (
            <Link key={c.slug} href={`/shop/${c.slug}`} onClick={onNavigate} className="flex justify-between text-base leading-[1.2] text-ink transition-[padding,color] hover:pl-1 hover:text-slate-700">
              <span>{c.name}</span>
              <span className="text-[13px] tabular-nums text-slate-text">{c.count}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <span className={head}>By goal</span>
          {data.goals.map((g) => (
            <Link key={g.slug} href={`/shop?goal=${g.slug}`} onClick={onNavigate} className="text-base leading-[1.2] text-ink hover:text-slate-700">
              {g.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <span className={head}>Popular ingredients</span>
          <div className="flex flex-wrap gap-1.5">
            {megaIngredients.map((i) => (
              <Link key={i} href={`/search?q=${encodeURIComponent(i)}`} onClick={onNavigate} className="rounded-pill border border-hairline px-3 py-2 text-[13px] font-medium leading-none hover:border-ink">
                {i}
              </Link>
            ))}
          </div>
          <span className={`${head} mt-3.5`}>Format</span>
          <div className="flex flex-wrap gap-1.5">
            {["Capsule", "Powder", "Liquid", "Gummy", "Spray"].map((f) => (
              <Link key={f} href={`/shop?format=${f}`} onClick={onNavigate} className="rounded-pill bg-paper-shade px-3 py-2 text-[13px] font-medium leading-none hover:bg-mint">
                {f}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/#the-edits" onClick={onNavigate} className="flex flex-col gap-3 text-ink">
          <Photo src={data.sleepEdit.image} sizes="20vw" duotone className="relative aspect-[4/5]" />
          <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">The edit · {data.sleepEdit.count} products</span>
          <span className="font-display text-[30px] font-medium leading-none">{data.sleepEdit.title} →</span>
        </Link>
        {data.newProduct && (
          <Link href={`/products/${data.newProduct.slug}`} onClick={onNavigate} className="flex flex-col gap-3 text-ink">
            <span className="relative aspect-[4/5] overflow-hidden bg-paper-shade">
              {data.newProduct.image && (
                <span className="absolute inset-[12%]">
                  <Image src={data.newProduct.image.src} alt="" fill sizes="20vw" className="object-contain mix-blend-multiply" />
                </span>
              )}
            </span>
            <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">New on the shelf</span>
            <span className="font-display text-[30px] font-medium leading-none">
              {data.newProduct.brand ? `${data.newProduct.brand} ` : ""}
              {data.newProduct.name} →
            </span>
          </Link>
        )}
      </div>
      <div className="flex gap-10 border-t border-hairline bg-paper-shade px-12 py-4 text-xs font-semibold uppercase leading-none tracking-[.14em]">
        <Link href="/shop" onClick={onNavigate}>
          All {data.totals.products} products →
        </Link>
        <Link href="/brands" onClick={onNavigate}>
          Browse {data.totals.brands} brands →
        </Link>
        <Link href="/routine" onClick={onNavigate} className="ml-auto">
          Not sure where to start? Find what fits your routine →
        </Link>
      </div>
    </div>
  );
}

/**
 * Desktop compact header: shown whenever the full header has scrolled out of
 * view, hidden again at the top of the page. Publishes its height as --hdr on
 * <html> so other sticky bars can sit beneath it.
 */
function useCompactHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const FULL_HEADER = 170;
    let raf = 0;
    const update = () => setVisible(mq.matches && window.scrollY > FULL_HEADER);
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      mq.removeEventListener("change", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--hdr", visible ? "64px" : "0px");
    root.dataset.compactHeader = visible ? "1" : "0";
  }, [visible]);

  return visible;
}
