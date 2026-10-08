import { articles } from "@/content/editorial";

export function articlesFor(q: string, n = 2) {
  const t = q.trim().toLowerCase();
  const hits = articles.filter((a) => a.topics.some((x) => x.startsWith(t) || t.includes(x)) || a.title.toLowerCase().includes(t));
  return (hits.length ? hits : articles).slice(0, n);
}

/** Splits a suggestion into the typed prefix (bold) and the rest. */
export function splitHit(s: string, q: string) {
  const t = q.trim().toLowerCase();
  return s.toLowerCase().startsWith(t) ? { hit: s.slice(0, t.length), rest: s.slice(t.length) } : { hit: "", rest: s };
}
