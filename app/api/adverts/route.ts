import { NextResponse } from "next/server";
import { fetchActiveAdvertsWithMedia } from "@/lib/adverts-db";
import { getActiveAdverts } from "@/lib/data";

/**
 * GET /api/adverts — active adverts with media from DB when available,
 * otherwise fallback to static data so the app works before migration.
 */
export async function GET() {
  try {
    const fromDb = await fetchActiveAdvertsWithMedia();
    if (fromDb.length > 0) {
      return NextResponse.json({ source: "database", adverts: fromDb });
    }
  } catch {
    // fall through
  }
  const fallback = getActiveAdverts();
  return NextResponse.json({ source: "fallback", adverts: fallback });
}
