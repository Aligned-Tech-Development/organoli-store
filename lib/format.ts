import type { StockStatus } from "./types";

export const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;

export const stockLabel = (s: StockStatus) =>
  s === "in" ? "In stock · Beirut" : s === "low" ? "Low stock" : "Back in ~2 weeks";

export const stockDot = (s: StockStatus) => (s === "in" ? "#7FB9A1" : s === "low" ? "#C9A46E" : "#A9B4B6");

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const WORDS = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
/** 43 → "Forty", 100+ → "100" — used in the brand headline (kept short so the hero stays on three lines). */
export function roundWords(n: number) {
  if (n >= 100) return String(Math.floor(n / 10) * 10);
  return WORDS[Math.floor(n / 10)] || String(n);
}

export const canBuy = (p: { stock: StockStatus; price: number }) => p.stock !== "out" && p.price > 0;
