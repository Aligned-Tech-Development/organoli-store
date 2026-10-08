import type { Config } from "tailwindcss";

// Design tokens from the Organoli handoff (README → "Design tokens").
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts"],
  theme: {
    extend: {
      colors: {
        ink: "#24343A",
        slate: {
          DEFAULT: "#6A8A92",
          100: "#E6ECED",
          200: "#CAD6D9",
          300: "#A9BCC1",
          400: "#89A2A9",
          500: "#6A8A92",
          600: "#587780",
          700: "#4A656D",
          800: "#375056",
          900: "#24343A",
          text: "#4E6870",
        },
        mint: {
          DEFAULT: "#7FB9A1",
          100: "#E5F1EC",
          200: "#C8E2D6",
          300: "#A5CFBC",
          400: "#7FB9A1",
          500: "#64A288",
          600: "#4E856E",
          700: "#3C6856",
        },
        paper: { DEFAULT: "#F2F1ED", shade: "#E4E2DC", hover: "#E9E7E1" },
        field: "#FAF9F6",
        hairline: { DEFAULT: "#CFCCC4", soft: "#E0DDD6" },
        "spec-rule": "#C4C1B9",
        "low-stock": "#C9A46E",
        "out-of-stock": "#A9B4B6",
        mist: "#D5DCDD",
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "Barlow", "system-ui", "sans-serif"],
        display: ["var(--font-barlow-condensed)", "Barlow Condensed", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "Menlo", "monospace"],
      },
      spacing: { gutter: "48px", "gutter-sm": "16px" },
      borderRadius: { DEFAULT: "2px", sm: "2px", pill: "999px" },
      boxShadow: {
        mega: "0 30px 60px -30px rgba(36,52,58,.35)",
        search: "0 24px 60px -24px rgba(36,52,58,.35)",
        cart: "-30px 0 60px -30px rgba(36,52,58,.4)",
        card: "0 30px 60px -30px rgba(36,52,58,.5)",
        halo: "0 0 0 3px rgba(127,185,161,.45)",
      },
      transitionTimingFunction: { out: "cubic-bezier(.2,.7,.2,1)", bounce: "cubic-bezier(.3,1.6,.5,1)" },
      transitionDuration: { press: "120ms", nav: "280ms", menu: "320ms", drawer: "420ms" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "mask-up": { from: { transform: "translateY(105%)" }, to: { transform: "none" } },
        bump: { "0%": { transform: "scale(1)" }, "45%": { transform: "scale(1.35)" }, "100%": { transform: "scale(1)" } },
        rise: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "none" } },
      },
      animation: {
        marquee: "marquee 60s linear infinite",
        "mask-up": "mask-up 950ms cubic-bezier(.2,.7,.2,1) both",
        bump: "bump 520ms cubic-bezier(.3,1.6,.5,1)",
        rise: "rise 560ms cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
};

export default config;
