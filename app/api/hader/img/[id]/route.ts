// Stable photo URL for products managed in hader.ai. hader's storage links are
// signed and expire after an hour, so pages point here instead and we redirect
// to the current link from the (≤5-minute-old) cached catalogue.
import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const catalog = await getCatalog();
  const url = catalog.haderImages.get(id);
  if (!url) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, max-age=300" } });
}
