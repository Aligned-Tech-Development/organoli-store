import { NextResponse, type NextRequest } from "next/server";
import { predictive } from "@/lib/catalog";

export function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  if (!q.trim()) return NextResponse.json({ error: "Missing q" }, { status: 400 });
  return NextResponse.json(predictive(q), { headers: { "Cache-Control": "public, max-age=60, s-maxage=3600" } });
}
