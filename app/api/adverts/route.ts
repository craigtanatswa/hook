import { NextResponse } from "next/server";
import { fetchActiveAdvertsWithMedia } from "@/lib/adverts-db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/adverts — returns only real, active adverts from the database.
 * Never cached — always hits the DB so the landing page stays in sync
 * with whatever the admin sees in admin/active.
 */
export async function GET() {
  try {
    const adverts = await fetchActiveAdvertsWithMedia();
    return NextResponse.json(
      { adverts },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (e) {
    console.error("[GET /api/adverts] DB error:", e);
    return NextResponse.json(
      { adverts: [] },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}
