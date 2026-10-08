"use client";

import Image from "@/components/Img";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/ProductImage";
import { site, whatsappLink } from "@/content/site";
import { money } from "@/lib/format";
import { useCart } from "@/lib/store";
import type { CardProduct, GoalSlug } from "@/lib/types";

export type QuizProduct = CardProduct & { goals: GoalSlug[]; dietary: string[]; format: string | null; ingredients: string[]; rank: number };

const GOALS: { label: string; image: string; sub: string; ph: string; tone: string; slug: GoalSlug }[] = [
  { label: "Sleep", image: "/images/goal-sleep.jpg", sub: "Falling asleep, winding down", ph: "evening still life", tone: "ph-slate text-paper", slug: "sleep" },
  { label: "Gut", image: "/images/goal-gut.jpg", sub: "Digestion, bloating, regularity", ph: "macro · probiotic capsules", tone: "ph-paper text-slate-text", slug: "gut-health" },
  { label: "Energy", image: "/images/goal-energy.jpg", sub: "Tiredness, focus, busy days", ph: "morning run, Corniche", tone: "ph-mint text-ink", slug: "energy" },
  { label: "Skin", image: "/images/goal-skin.jpg", sub: "Skin, hair and nails", ph: "macro · collagen powder", tone: "ph-paper text-slate-text", slug: "skin-beauty" },
  { label: "Performance", image: "/images/routine-performance.jpg", sub: "Training, strength, recovery", ph: "gym floor, chalked hands", tone: "ph-slate text-paper", slug: "performance" },
  { label: "General wellness", image: "/images/goal-daily.jpg", sub: "A simple daily foundation", ph: "breakfast table", tone: "ph-mint text-ink", slug: "daily-essentials" },
];
const DIETS = ["Vegan", "Vegetarian", "Gluten-free", "Dairy-free", "No preference"];
const FORMATS: [string, string, string[]][] = [
  ["Capsules", "Easy to swallow, no taste", ["Capsule", "Softgel"]],
  ["Tablets", "Compact, often higher dose", ["Tablet"]],
  ["Powder", "Mix into water or coffee", ["Powder", "Sachet"]],
  ["Liquid", "Drops — flexible dosing", ["Liquid"]],
  ["Gummies", "Chewable, no water needed", ["Gummy"]],
  ["No preference", "Show me the best option", []],
];
const WHEN: [string, string][] = [
  ["Morning", "With breakfast"],
  ["Evening", "With dinner or before bed"],
  ["Both", "Split across the day"],
];
const HOW_MANY: [string, string][] = [
  ["Just one", "The single most useful product"],
  ["A short routine", "Two or three that work together"],
];
const Q: [string, string][] = [
  ["What are you shopping for?", "Pick up to two. We’ll keep the list short — three products at most."],
  ["Any dietary preferences?", "Choose all that apply. We’ll only show products that meet every one."],
  ["Which format do you prefer?", "The best supplement is the one you actually take."],
  ["How does it fit your day?", "So we can put things in the right order."],
  ["Your shelf.", `Chosen from what we stock today, in ${site.city}. Adjust anything you like.`],
];

/** When each kind of product is usually taken. Order index sorts the routine. */
function timing(p: QuizProduct, when: string): { t: string; when: string; order: number } {
  const i = p.ingredients;
  const has = (...x: string[]) => x.some((y) => i.includes(y));
  if (has("Electrolytes")) return { t: "Training", when: "In your bottle", order: 2 };
  if (has("Probiotic")) return { t: "Morning", when: "Before food", order: 0 };
  if (has("Collagen")) return { t: "Morning", when: "In coffee or water", order: 1 };
  if (has("Digestive enzymes")) return { t: "Meals", when: "With main meal", order: 3 };
  if (has("Protein", "Creatine")) return { t: "Daily", when: "After training", order: 4 };
  if (has("Magnesium", "Ashwagandha", "L-Theanine") || p.goals.includes("sleep")) return { t: "Evening", when: "With dinner", order: 6 };
  if (has("Fibre")) return { t: "Evening", when: "With water", order: 7 };
  if (when === "Evening") return { t: "Evening", when: "With dinner", order: 5 };
  return { t: "Morning", when: "With breakfast", order: 1 };
}

export function RoutineFinder({ products }: { products: QuizProduct[] }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string[]>([]);
  const [diet, setDiet] = useState<string[]>([]);
  const [format, setFormat] = useState("");
  const [when, setWhen] = useState("");
  const [howMany, setHowMany] = useState("");
  const qRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const shownStep = useRef(0);

  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    aRef.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    [qRef.current, aRef.current].forEach((el, i) =>
      el?.animate([{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }], { duration: 560, delay: i * 70, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" }),
    );
    qRef.current?.querySelector("h1")?.focus();
  }, [step]);

  const { picks, relaxed } = useMemo(() => {
    const goalSlugs = (goal.length ? goal : ["Sleep"]).map((g) => GOALS.find((x) => x.label === g)!.slug);
    const diets = diet.filter((d) => d !== "No preference");
    const fmt = FORMATS.find((f) => f[0] === format)?.[2] ?? [];
    const base = products.filter((p) => p.goals.some((g) => goalSlugs.includes(g)) && diets.every((d) => p.dietary.includes(d)));
    let pool = fmt.length ? base.filter((p) => p.format && fmt.includes(p.format)) : base;
    const relaxed = fmt.length > 0 && pool.length === 0 && base.length > 0;
    if (relaxed) pool = base;
    const n = howMany === "Just one" ? 1 : 3;
    const sorted = [...pool].sort((a, b) => b.rank - a.rank || (b.image2 ? 1 : 0) - (a.image2 ? 1 : 0));
    // Alternate between chosen goals and avoid two products built on the same ingredient
    const chosen: QuizProduct[] = [];
    const used = new Set<string>();
    for (let round = 0; chosen.length < n && round < 2; round++) {
      for (const g of goalSlugs) {
        const next = sorted.find((p) => !chosen.includes(p) && p.goals.includes(g) && (round > 0 || !p.ingredients.some((i) => used.has(i))));
        if (next && chosen.length < n) {
          chosen.push(next);
          next.ingredients.forEach((i) => used.add(i));
        }
      }
      for (const p of sorted) {
        if (chosen.length >= n) break;
        if (!chosen.includes(p) && (round > 0 || !p.ingredients.some((i) => used.has(i)))) {
          chosen.push(p);
          p.ingredients.forEach((i) => used.add(i));
        }
      }
    }
    const picks = chosen
      .map((p) => ({ p, ...timing(p, when) }))
      .sort((a, b) => a.order - b.order)
      .map((x) => {
        const fits = [goalSlugs.length && x.p.goals.find((g) => goalSlugs.includes(g)) ? GOALS.find((g) => goalSlugs.includes(g.slug) && x.p.goals.includes(g.slug))?.label.toLowerCase() : null, ...diets.map((d) => d.toLowerCase()), fmt.length && x.p.format && fmt.includes(x.p.format) ? x.p.format.toLowerCase() : null].filter(Boolean);
        return { ...x, why: `${x.p.purpose ? `${x.p.purpose}. ` : ""}Matches ${fits.join(", ")}.` };
      });
    return { picks, relaxed };
  }, [products, goal, diet, format, when, howMany]);

  const total = picks.reduce((a, x) => a + x.p.price, 0);
  const valid = [goal.length > 0, diet.length > 0, !!format, !!when && !!howMany, picks.length > 0][step];
  const addOne = (p: QuizProduct) => add({ ...p, image: p.image?.src });

  const tile = (on: boolean) => `border ${on ? "border-ink bg-field shadow-[inset_0_0_0_1px_#24343A]" : "border-hairline bg-transparent hover:border-ink"}`;
  const summary = `For ${(goal.length ? goal : ["sleep"]).join(" & ").toLowerCase()}${diet.length && diet[0] !== "No preference" ? `, ${diet.join(", ").toLowerCase()}` : ""}${format && format !== "No preference" ? `, ${format.toLowerCase()}` : ""} — taken in the ${(when || "evening").toLowerCase() === "both" ? "morning and evening" : (when || "evening").toLowerCase()}. All in stock in ${site.city}.`;

  const next = () => {
    if (step === 4) picks.forEach((x) => addOne(x.p));
    else if (valid) setStep(step + 1);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-paper font-sans text-ink lg:h-dvh lg:max-h-[100dvh]">
      <header className="flex h-16 flex-none items-center justify-between gap-4 border-b border-hairline px-4 lg:h-[72px] lg:px-10">
        <span className="flex min-w-0 items-center gap-2.5">
          <Link href="/" aria-label="Organoli home" className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex h-[22px] w-[22px] items-center justify-center bg-mint text-lg font-semibold leading-none">
              +
            </span>
            <span className="font-display text-2xl font-semibold uppercase leading-none tracking-[.08em]">Organoli</span>
          </Link>
          <span className="ml-3.5 hidden border-l border-hairline pl-3.5 text-[11px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text sm:inline">Find what fits your routine</span>
        </span>
        <div className="flex items-center gap-3 lg:gap-6">
          <div className="hidden gap-1.5 sm:flex" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-[3px] w-12 overflow-hidden bg-hairline">
                <span className="block h-full origin-left bg-ink transition-transform duration-500 ease-out" style={{ transform: i < step || step === 4 ? "scaleX(1)" : "scaleX(0)" }} />
              </span>
            ))}
          </div>
          <span className="min-w-[80px] text-right text-[13px] font-medium leading-none tabular-nums text-slate-text" aria-live="polite">
            {step === 4 ? "Complete" : `Step ${step + 1} of 4`}
          </span>
          <button type="button" aria-label="Close" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))} className="flex h-11 w-11 items-center justify-center rounded-sm border border-hairline">
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[5fr_7fr]">
        <div className="on-dark flex flex-col justify-between gap-6 bg-ink px-4 py-8 text-paper lg:px-12 lg:pb-10 lg:pt-14">
          <div ref={qRef} className="flex flex-col gap-4 lg:gap-[22px]">
            <span className="font-display text-[72px] font-medium leading-[.8] tabular-nums text-mint lg:text-[128px]" aria-hidden="true">
              {step === 4 ? "+" : String(step + 1).padStart(2, "0")}
            </span>
            <h1 tabIndex={-1} className="m-0 font-display text-[40px] font-medium leading-[.95] [text-wrap:pretty] focus:outline-none lg:text-[60px]">
              {Q[step][0]}
            </h1>
            <p className="m-0 max-w-[420px] text-base leading-[1.55] text-mist lg:text-[17px]">{Q[step][1]}</p>
          </div>
          <p className="m-0 hidden max-w-[420px] border-t border-paper/20 pt-[18px] text-[13px] leading-normal text-slate-300 lg:block">
            A shopping guide, not a diagnosis. If you are pregnant, take medication or have a health condition, speak to your doctor — or message our pharmacist first.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div ref={aRef} className="flex-1 overflow-auto px-4 pb-8 pt-6 lg:px-14 lg:pb-8 lg:pt-14">
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
                {GOALS.map((g) => {
                  const on = goal.includes(g.label);
                  return (
                    <button
                      key={g.label}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setGoal((x) => (x.includes(g.label) ? x.filter((y) => y !== g.label) : [...x, g.label].slice(-2)))}
                      className={`flex flex-col gap-3 rounded-sm px-3 pb-[18px] pt-3 text-left transition-[border-color,box-shadow,background] duration-200 ${tile(on)}`}
                    >
                      <Photo src={g.image} sizes="(min-width:1024px) 220px, 45vw" className={`aspect-[4/3] w-full ${g.tone}`} />
                      <span className="flex w-full items-center justify-between gap-2">
                        <span className="font-display text-2xl font-medium leading-none lg:text-[30px]">{g.label}</span>
                        <span aria-hidden="true" className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-ink text-[13px] font-semibold leading-none" style={{ background: on ? "#7FB9A1" : "transparent" }}>
                          {on ? "✓" : ""}
                        </span>
                      </span>
                      <span className="text-sm leading-[1.4] text-slate-text">{g.sub}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 1 && (
              <div className="flex max-w-[640px] flex-wrap gap-3">
                {DIETS.map((d) => {
                  const on = diet.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setDiet((x) => (d === "No preference" ? ["No preference"] : x.includes(d) ? x.filter((y) => y !== d) : [...x.filter((y) => y !== "No preference"), d]))}
                      className={`flex h-14 items-center gap-2.5 rounded-pill border px-[22px] text-[17px] font-medium leading-none transition-colors duration-200 ${on ? "border-ink bg-ink text-paper" : "border-hairline bg-transparent hover:border-ink"}`}
                    >
                      {on && <span aria-hidden="true">✓</span>}
                      {d}
                    </button>
                  );
                })}
              </div>
            )}

            {(step === 2 || step === 3) && (
              <div className="flex max-w-[720px] flex-col gap-9">
                {(step === 2
                  ? [{ title: "Format", opts: FORMATS.map(([l, d]) => [l, d] as [string, string]), val: format, set: setFormat }]
                  : [
                      { title: "When do you usually take supplements?", opts: WHEN, val: when, set: setWhen },
                      { title: "How many products?", opts: HOW_MANY, val: howMany, set: setHowMany },
                    ]
                ).map((L) => (
                  <fieldset key={L.title} className="m-0 flex flex-col gap-3 border-0 p-0">
                    <legend className="mb-3 text-[11px] font-semibold uppercase leading-none tracking-[.16em] text-slate-text">{L.title}</legend>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2.5">
                      {L.opts.map(([l, d]) => {
                        const on = L.val === l;
                        return (
                          <button key={l} type="button" role="radio" aria-checked={on} onClick={() => L.set(l)} className={`flex flex-col items-start gap-1.5 rounded-sm p-[18px] text-left transition-[border-color,box-shadow] duration-200 ${tile(on)}`}>
                            <span className="font-display text-[26px] font-medium leading-none">{l}</span>
                            <span className="text-sm leading-[1.4] text-slate-text">{d}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end sm:gap-6">
                  <span className="max-w-[480px] text-[15px] font-medium leading-normal">
                    {summary}
                    {relaxed && <span className="mt-1 block text-slate-text">Nothing matched that exact format, so we’ve shown the closest fits.</span>}
                  </span>
                  <button type="button" onClick={() => setStep(0)} className="min-h-11 flex-none self-start bg-transparent text-sm font-medium underline underline-offset-[3px]">
                    Change answers
                  </button>
                </div>
                {picks.length ? (
                  <div className="flex flex-col border-t-2 border-ink">
                    {picks.map((x) => (
                      <div key={x.p.slug} className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4 border-b border-hairline py-5 sm:grid-cols-[96px_120px_minmax(0,1fr)_auto] sm:items-center sm:gap-6">
                        <span className="flex flex-col gap-1.5 sm:order-none">
                          <span className="font-display text-2xl font-medium leading-none sm:text-[30px]">{x.t}</span>
                          <span className="text-[10px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{x.when}</span>
                        </span>
                        <Link href={`/products/${x.p.slug}`} className="relative hidden h-[120px] w-[120px] border border-hairline bg-paper-hover sm:block">
                          {x.p.image && <Image src={x.p.image.src} alt="" fill sizes="120px" className="object-contain p-2 mix-blend-multiply" />}
                        </Link>
                        <span className="flex min-w-0 flex-col gap-1.5">
                          {x.p.brand && <span className="text-[10.5px] font-semibold uppercase leading-none tracking-[.14em] text-slate-text">{x.p.brand}</span>}
                          <Link href={`/products/${x.p.slug}`} className="text-[19px] font-medium leading-[1.15] hover:text-slate-700 lg:text-[21px]">
                            {x.p.name}
                          </Link>
                          {x.p.specLine && <span className="spec">{x.p.specLine}</span>}
                          <span className="text-[14.5px] leading-[1.45] text-slate-text">
                            <strong className="font-semibold text-ink">Why it fits: </strong>
                            {x.why}
                          </span>
                          <span className="mt-2 flex items-center gap-3 sm:hidden">
                            <span className="text-lg font-semibold leading-none">{money(x.p.price)}</span>
                            <button type="button" onClick={() => addOne(x.p)} className="h-11 rounded-sm border border-ink px-3.5 text-[11px] font-semibold uppercase leading-none tracking-[.12em]">
                              Add +
                            </button>
                          </span>
                        </span>
                        <span className="hidden flex-col items-end gap-2.5 sm:flex">
                          <span className="text-lg font-semibold leading-none">{money(x.p.price)}</span>
                          <button type="button" onClick={() => addOne(x.p)} aria-label={`Add to bag: ${x.p.name}`} className="h-11 rounded-sm border border-ink bg-transparent px-3.5 text-[11px] font-semibold uppercase leading-none tracking-[.12em] hover:bg-ink hover:text-paper lg:h-10">
                            Add +
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-3 border-t-2 border-ink pt-6">
                    <span className="font-display text-[34px] font-medium leading-none">Nothing on the shelf fits all of that today.</span>
                    <span className="text-base text-slate-text">Try fewer dietary filters, or ask our pharmacist — we can often source something within a week.</span>
                    <a href={whatsappLink(`Hello, I'm looking for help with: ${summary}`)} target="_blank" rel="noopener noreferrer" className="link-rule mt-2">
                      Ask on WhatsApp →
                    </a>
                  </div>
                )}
              </div>
            )}

            <p className="m-0 mt-8 border-t border-hairline pt-4 text-[13px] leading-normal text-slate-text lg:hidden">
              A shopping guide, not a diagnosis. If you are pregnant, take medication or have a health condition, speak to your doctor — or message our pharmacist first.
            </p>
          </div>

          <div className="sticky bottom-0 flex flex-none items-center justify-between gap-3 border-t border-hairline bg-paper px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] lg:px-14 lg:py-[18px]">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="h-[52px] rounded-sm border border-hairline bg-transparent px-5 text-xs font-semibold uppercase leading-none tracking-[.14em] disabled:opacity-40"
            >
              ← Back
            </button>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm leading-none text-slate-text sm:inline">{step === 0 ? `${goal.length}/2 selected` : step === 4 ? `Free ${site.city} delivery over $${site.freeDeliveryThreshold}` : ""}</span>
              <button
                type="button"
                onClick={next}
                disabled={!valid}
                className="h-14 rounded-sm border-0 px-5 text-xs font-semibold uppercase leading-none tracking-[.16em] text-paper transition-colors duration-200 enabled:hover:bg-ink sm:px-[30px] sm:text-[13px]"
                style={{ background: valid ? "#4A656D" : "#A9B4B6" }}
              >
                {step === 3 ? "See my shelf →" : step === 4 ? `Add all to bag · ${money(total)}` : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
