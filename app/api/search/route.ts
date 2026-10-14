import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  if (!q.trim()) return NextResponse.json({ error: "Missing q" }, { status: 400 });
  const catalog = await getCatalog();
  // Short CDN cache: catalogue edits in hader must reach the search dropdown within a minute.
  return NextResponse.json(catalog.predictive(q), { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=30" } });
}
