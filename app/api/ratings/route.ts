import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

function getOrCreateRaterId(req: NextRequest): { id: string; isNew: boolean } {
  const existing = req.cookies.get("hook_rater_id")?.value;
  if (existing) return { id: existing, isNew: false };
  const id =
    (globalThis.crypto && "randomUUID" in globalThis.crypto && globalThis.crypto.randomUUID?.()) ||
    `rid_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  return { id, isNew: true };
}

async function getSummary(advertId: string): Promise<{ avg: number; count: number }> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("advert_ratings")
    .select("rating")
    .eq("advert_id", advertId);

  const ratings = (data || []) as { rating: number }[];
  const count = ratings.length;
  const sum = ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  const avg = count > 0 ? sum / count : 0;
  return { avg, count };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { advertId?: string; rating?: unknown };
    const advertId = String(body.advertId || "");
    const rating = Number(body.rating);

    if (!advertId) {
      return NextResponse.json({ error: "Missing advertId" }, { status: 400 });
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const { id: raterId, isNew } = getOrCreateRaterId(req);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("advert_ratings")
      .upsert(
        {
          advert_id: advertId,
          rater_id: raterId,
          rating,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "advert_id,rater_id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const summary = await getSummary(advertId);
    const res = NextResponse.json({ ok: true, summary });
    if (isNew) {
      res.cookies.set("hook_rater_id", raterId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 2, // 2 years
      });
    }
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

