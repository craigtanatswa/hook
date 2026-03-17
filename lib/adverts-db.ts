import type { Advert, BodyType } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/server";

type AdvertRow = {
  id: string;
  name: string;
  age: number;
  location: string;
  gender: string;
  body_type: string;
  category: string;
  short_description: string;
  full_description: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  expiry_date: string;
  status: "active" | "expired";
  featured: boolean;
  featured_until?: string | null;
  created_at: string;
};

type MediaRow = {
  advert_id: string;
  media_url: string;
  media_type: string;
  order_index: number;
  focal_point?: string | null;
};

type MediaBundle = { urls: string[]; focalPoints: string[] };

type RatingSummary = { avg: number; count: number };

async function fetchRatingsByAdvertIds(ids: string[]): Promise<Map<string, RatingSummary>> {
  const map = new Map<string, RatingSummary>();
  if (!ids.length) return map;
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("advert_ratings")
      .select("advert_id,rating")
      .in("advert_id", ids);

    if (error || !data) return map;
    const rows = data as { advert_id: string; rating: number }[];
    const sums = new Map<string, { sum: number; count: number }>();
    for (const r of rows) {
      const prev = sums.get(r.advert_id) ?? { sum: 0, count: 0 };
      sums.set(r.advert_id, { sum: prev.sum + (Number(r.rating) || 0), count: prev.count + 1 });
    }
    for (const [advertId, v] of sums.entries()) {
      map.set(advertId, { avg: v.count ? v.sum / v.count : 0, count: v.count });
    }
    return map;
  } catch {
    return map;
  }
}

function rowToAdvert(
  row: AdvertRow,
  mediaUrls: string[],
  focalPoints?: string[],
  rating?: RatingSummary
): Advert {
  const images = mediaUrls.length > 0 ? mediaUrls : ["/placeholder.svg"];
  const now = new Date();
  const expires = new Date(row.expiry_date);
  const status: "active" | "expired" =
    row.status === "expired" || expires <= now ? "expired" : "active";
  const featuredUntilIso = row.featured_until ?? undefined;
  const featuredUntilDate = featuredUntilIso ? new Date(featuredUntilIso) : null;
  const isFeatured = Boolean(row.featured) && (!featuredUntilDate || featuredUntilDate > now);

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    location: row.location,
    gender: row.gender,
    bodyType: row.body_type as BodyType,
    category: row.category,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email ?? undefined,
    images,
    imageFocalPoints: focalPoints && focalPoints.length > 0 ? focalPoints : undefined,
    profileImage: images[0],
    postedAt: row.created_at,
    expiresAt: row.expiry_date,
    status,
    featured: isFeatured,
    featuredUntil: featuredUntilIso,
    ratingAvg: rating?.count ? rating.avg : undefined,
    ratingCount: rating?.count ? rating.count : undefined,
  };
}

function buildBundleMap(mediaRows: MediaRow[]): Map<string, MediaBundle> {
  const map = new Map<string, MediaBundle>();
  for (const m of mediaRows || []) {
    const existing = map.get(m.advert_id) ?? { urls: [], focalPoints: [] };
    existing.urls.push(m.media_url);
    existing.focalPoints.push(m.focal_point ?? "50% 50%");
    map.set(m.advert_id, existing);
  }
  return map;
}

/** Fetch active adverts with media ordered by order_index.
 *  Uses the service client so it works regardless of RLS grant configuration.
 *  We enforce the same visibility rules in code: status = 'active'.
 */
export async function fetchActiveAdvertsWithMedia(): Promise<Advert[]> {
  try {
    const supabase = createServiceClient();

    const { data: advertRows, error: aErr } = await supabase
      .from("adverts")
      .select("*")
      .eq("status", "active")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (aErr) {
      console.error("[fetchActiveAdvertsWithMedia] adverts query error:", aErr);
      return [];
    }
    if (!advertRows?.length) return [];

    const ids = advertRows.map((r: AdvertRow) => r.id);
    const ratingById = await fetchRatingsByAdvertIds(ids);
    const { data: mediaRows, error: mErr } = await supabase
      .from("advert_media")
      .select("*")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    if (mErr) {
      console.error("[fetchActiveAdvertsWithMedia] media query error:", mErr);
      return [];
    }

    const byAdvert = buildBundleMap(mediaRows as MediaRow[]);

    return (advertRows as AdvertRow[]).map((row) => {
      const bundle = byAdvert.get(row.id) ?? { urls: [], focalPoints: [] };
      return rowToAdvert(row, bundle.urls, bundle.focalPoints, ratingById.get(row.id));
    });
  } catch (e) {
    console.error("[fetchActiveAdvertsWithMedia] unexpected error:", e);
    return [];
  }
}

/** Fetch single advert by id with media (any status — for admin edit). */
export async function fetchAdvertByIdWithMedia(id: string): Promise<Advert | null> {
  try {
    const supabase = createServiceClient();
    const { data: row, error } = await supabase
      .from("adverts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !row) return null;

    const { data: mediaRows } = await supabase
      .from("advert_media")
      .select("*")
      .eq("advert_id", id)
      .order("order_index", { ascending: true });

    const rows = (mediaRows || []) as MediaRow[];
    const urls = rows.map((m) => m.media_url);
    const focalPoints = rows.map((m) => m.focal_point ?? "50% 50%");
    const ratingById = await fetchRatingsByAdvertIds([id]);
    return rowToAdvert(row as AdvertRow, urls, focalPoints, ratingById.get(id));
  } catch {
    return null;
  }
}

/** Fetch expired adverts for admin. */
export async function fetchExpiredAdvertsWithMedia(): Promise<Advert[]> {
  try {
    const supabase = createServiceClient();
    const nowIso = new Date().toISOString();

    const { data: advertRows } = await supabase
      .from("adverts")
      .select("*")
      .or(`status.eq.expired,expiry_date.lte.${nowIso}`)
      .order("expiry_date", { ascending: false });

    if (!advertRows?.length) return [];

    const ids = advertRows.map((r: AdvertRow) => r.id);
    const ratingById = await fetchRatingsByAdvertIds(ids);
    const { data: mediaRows } = await supabase
      .from("advert_media")
      .select("*")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    const byAdvert = buildBundleMap(mediaRows as MediaRow[]);

    return (advertRows as AdvertRow[]).map((row) => {
      const bundle = byAdvert.get(row.id) ?? { urls: [], focalPoints: [] };
      return rowToAdvert(
        { ...row, status: "expired" },
        bundle.urls,
        bundle.focalPoints,
        ratingById.get(row.id)
      );
    });
  } catch {
    return [];
  }
}

export type AdvertInput = {
  name: string;
  age: number;
  location: string;
  gender: string;
  bodyType: string;
  category: string;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  whatsapp: string;
  email?: string;
  expiryDays?: number;
  featured: boolean;
  featuredDays?: number;
  mediaUrls: string[];
  focalPoints?: string[];
};

function expiryDateFromDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function insertAdvertWithMedia(input: AdvertInput): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const expiryDays = input.expiryDays ?? 30;
    const expiry_date = expiryDateFromDays(expiryDays);
    const featured_until =
      input.featured && input.featuredDays ? expiryDateFromDays(input.featuredDays) : null;

    const { data: advert, error: aErr } = await supabase
      .from("adverts")
      .insert({
        name: input.name,
        age: input.age,
        location: input.location,
        gender: input.gender,
        body_type: input.bodyType,
        category: input.category,
        short_description: input.shortDescription.slice(0, 500),
        full_description: input.fullDescription,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email || null,
        expiry_date,
        status: "active",
        featured: input.featured,
        featured_until,
      })
      .select("id")
      .single();

    if (aErr || !advert) return { error: aErr?.message || "Insert failed" };

    const advertId = advert.id as string;
    const mediaRows = input.mediaUrls
      .map((url) => url.trim())
      .filter(Boolean)
      .map((media_url, order_index) => ({
        advert_id: advertId,
        media_url,
        media_type: "image" as const,
        order_index,
        focal_point: input.focalPoints?.[order_index] ?? "50% 50%",
      }));

    if (mediaRows.length > 0) {
      const { error: mErr } = await supabase.from("advert_media").insert(mediaRows);
      if (mErr) return { error: mErr.message };
    }

    return { id: advertId };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateAdvertWithMedia(
  id: string,
  input: AdvertInput
): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const featured_until =
      input.featured && input.featuredDays ? expiryDateFromDays(input.featuredDays) : null;

    const advertUpdate: Record<string, unknown> = {
      name: input.name,
      age: input.age,
      location: input.location,
      gender: input.gender,
      body_type: input.bodyType,
      category: input.category,
      short_description: input.shortDescription.slice(0, 500),
      full_description: input.fullDescription,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email || null,
      featured: input.featured,
      featured_until,
      updated_at: new Date().toISOString(),
    };
    if (typeof input.expiryDays === "number" && Number.isFinite(input.expiryDays)) {
      advertUpdate.expiry_date = expiryDateFromDays(input.expiryDays);
    }

    const { error: uErr } = await supabase
      .from("adverts")
      .update(advertUpdate)
      .eq("id", id);

    if (uErr) return { error: uErr.message };

    await supabase.from("advert_media").delete().eq("advert_id", id);

    const mediaRows = input.mediaUrls
      .map((url) => url.trim())
      .filter(Boolean)
      .map((media_url, order_index) => ({
        advert_id: id,
        media_url,
        media_type: "image" as const,
        order_index,
        focal_point: input.focalPoints?.[order_index] ?? "50% 50%",
      }));

    if (mediaRows.length > 0) {
      const { error: mErr } = await supabase.from("advert_media").insert(mediaRows);
      if (mErr) return { error: mErr.message };
    }

    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** All adverts for admin list (service role). */
export async function fetchAllAdvertsWithMediaForAdmin(): Promise<Advert[]> {
  try {
    const supabase = createServiceClient();
    const { data: advertRows } = await supabase
      .from("adverts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!advertRows?.length) return [];

    const ids = advertRows.map((r: AdvertRow) => r.id);
    const ratingById = await fetchRatingsByAdvertIds(ids);
    const { data: mediaRows } = await supabase
      .from("advert_media")
      .select("*")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    const byAdvert = buildBundleMap(mediaRows as MediaRow[]);

    return (advertRows as AdvertRow[]).map((row) => {
      const bundle = byAdvert.get(row.id) ?? { urls: [], focalPoints: [] };
      return rowToAdvert(row, bundle.urls, bundle.focalPoints, ratingById.get(row.id));
    });
  } catch {
    return [];
  }
}

export async function deleteAdvert(id: string): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("adverts").delete().eq("id", id);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** Set a listing to expired/inactive so it no longer shows on the public feed. */
export async function deactivateAdvert(id: string): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("adverts")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

/** Make an expired listing live again with a fresh expiry window. */
export async function repostAdvert(
  id: string,
  days: number
): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("adverts")
      .update({
        status: "active",
        expiry_date: expiryDateFromDays(days),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
