"use client";

import { useState } from "react";

export function Newsletter() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  return (
    <section id="newsletter" className="border-t border-hairline bg-paper-shade px-4 py-9 lg:px-12 lg:py-[100px]" aria-labelledby="nl-title">
      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-[7fr_5fr] lg:items-end lg:gap-14">
        <h2 id="nl-title" className="m-0 font-display text-[44px] font-medium leading-[.9] lg:text-[112px] lg:leading-[.86] lg:tracking-[-.015em]">
          Better information.
          <br className="hidden lg:block" /> <span className="text-slate-700">Better supplements.</span>
        </h2>
        <form onSubmit={submit} className="flex flex-col gap-3.5 lg:gap-4">
          <p className="m-0 text-[15px] leading-normal lg:text-[17px] lg:leading-[1.55]">
            <span className="hidden lg:inline">The Organoli letter: weekly product discoveries and straightforward wellness guidance. </span>One email, Thursdays. No discount codes dressed up as advice.
          </p>
          <label htmlFor="nl-email" className="label text-[10.5px] text-slate-text lg:text-[11px]">
            Email address
          </label>
          <div className="flex flex-col gap-2 lg:flex-row">
            <input
              id="nl-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-[52px] min-w-0 flex-1 rounded-sm border border-ink bg-paper px-3.5 text-base leading-none text-ink focus:shadow-halo focus:outline-none lg:h-14 lg:px-4"
            />
            <button
              type="submit"
              disabled={state === "sending" || state === "done"}
              className="h-[52px] rounded-sm bg-ink px-6 text-xs font-semibold uppercase leading-none tracking-[.16em] text-paper transition-colors hover:bg-slate-700 disabled:cursor-default lg:h-14"
            >
              {state === "done" ? "Subscribed ✓" : state === "sending" ? "Subscribing…" : "Subscribe"}
            </button>
          </div>
          <p role="status" className="m-0 min-h-5 text-sm text-slate-text">
            {state === "error" ? "That didn’t go through — please check the address and try again." : state === "done" ? "Thank you. The first letter arrives on Thursday." : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
