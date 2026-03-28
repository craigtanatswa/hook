import { sortAdvertsForFeed, type Advert, type BodyType } from "@/lib/data";
import { createServiceClient } from "@/lib/supabase/server";

type AdvertRow = {
  id: string;
  name: string;
  age: number;
  location: string;
  suburb: string | null;
  gender: string;
  body_type: string;
  short_description: string;
  full_description: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  expiry_date: string;
  status: "active" | "expired";
  premium: boolean;
  premium_until?: string | null;
  vip: boolean;
  vip_until?: string | null;
  created_at: string;
};

/** Pre-migration rows may still use `featured` / `featured_until` instead of premium columns. */
type AdvertRowFromDb = AdvertRow & {
  featured?: boolean;
  featured_until?: string | null;
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
  row: AdvertRowFromDb,
  mediaUrls: string[],
  focalPoints?: string[],
  rating?: RatingSummary
): Advert {
  const images = mediaUrls.length > 0 ? mediaUrls : ["/placeholder.svg"];
  const now = new Date();
  const expires = new Date(row.expiry_date);
  const status: "active" | "expired" =
    row.status === "expired" || expires <= now ? "expired" : "active";

  const premiumFlag = row.premium ?? row.featured ?? false;
  const premiumUntilIso = (row.premium_until ?? row.featured_until) ?? undefined;
  const premiumUntilDate = premiumUntilIso ? new Date(premiumUntilIso) : null;
  const isPremium = Boolean(premiumFlag) && (!premiumUntilDate || premiumUntilDate > now);

  const vipUntilIso = row.vip_until ?? undefined;
  const vipUntilDate = vipUntilIso ? new Date(vipUntilIso) : null;
  const isVip = Boolean(row.vip) && (!vipUntilDate || vipUntilDate > now);

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    location: row.location,
    suburb: row.suburb ?? undefined,
    gender: row.gender,
    bodyType: row.body_type as BodyType,
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
    premium: isPremium,
    premiumUntil: premiumUntilIso,
    vip: isVip,
    vipUntil: vipUntilIso,
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

    // Prefer ordering by premium; fall back if migration 011 not applied yet (column still `featured`).
    let advertRows: AdvertRowFromDb[] | null = null;
    let aErr: { message: string } | null = null;

    const resPremium = await supabase
      .from("adverts")
      .select("*")
      .eq("status", "active")
      .order("premium", { ascending: false })
      .order("created_at", { ascending: false });

    if (!resPremium.error && resPremium.data) {
      advertRows = resPremium.data as AdvertRowFromDb[];
    } else {
      const resFeatured = await supabase
        .from("adverts")
        .select("*")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (!resFeatured.error && resFeatured.data) {
        advertRows = resFeatured.data as AdvertRowFromDb[];
        if (resPremium.error) {
          console.warn(
            "[fetchActiveAdvertsWithMedia] using legacy `featured` column — run migration 011_premium_vip.sql when ready."
          );
        }
      } else {
        const resCreated = await supabase
          .from("adverts")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (!resCreated.error && resCreated.data) {
          advertRows = resCreated.data as AdvertRowFromDb[];
          console.warn(
            "[fetchActiveAdvertsWithMedia] ordering by created_at only — apply migration 011 for premium sort."
          );
        } else {
          aErr = resCreated.error ?? resFeatured.error ?? resPremium.error;
        }
      }
    }

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

    const list = (advertRows as AdvertRow[]).map((row) => {
      const bundle = byAdvert.get(row.id) ?? { urls: [], focalPoints: [] };
      return rowToAdvert(row, bundle.urls, bundle.focalPoints, ratingById.get(row.id));
    });
    return sortAdvertsForFeed(list);
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
  suburb: string;
  gender: string;
  bodyType: string;
  shortDescription: string;
  fullDescription: string;
  phone: string;
  whatsapp: string;
  email?: string;
  expiryDays?: number;
  /** Can be combined with `vip`. */
  premium: boolean;
  vip: boolean;
  premiumDays?: number;
  vipDays?: number;
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
    const premium_until =
      input.premium && input.premiumDays ? expiryDateFromDays(input.premiumDays) : null;
    const vip_until = input.vip && input.vipDays ? expiryDateFromDays(input.vipDays) : null;

    const { data: advert, error: aErr } = await supabase
      .from("adverts")
      .insert({
        name: input.name,
        age: input.age,
        location: input.location,
        suburb: input.suburb,
        gender: input.gender,
        body_type: input.bodyType,
        short_description: input.shortDescription.slice(0, 500),
        full_description: input.fullDescription,
        phone: input.phone,
        whatsapp: input.whatsapp,
        email: input.email || null,
        expiry_date,
        status: "active",
        premium: input.premium,
        premium_until,
        vip: input.vip,
        vip_until,
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
    const premium_until =
      input.premium && input.premiumDays ? expiryDateFromDays(input.premiumDays) : null;
    const vip_until = input.vip && input.vipDays ? expiryDateFromDays(input.vipDays) : null;

    const advertUpdate: Record<string, unknown> = {
      name: input.name,
      age: input.age,
      location: input.location,
      suburb: input.suburb,
      gender: input.gender,
      body_type: input.bodyType,
      short_description: input.shortDescription.slice(0, 500),
      full_description: input.fullDescription,
      phone: input.phone,
      whatsapp: input.whatsapp,
      email: input.email || null,
      premium: input.premium,
      premium_until,
      vip: input.vip,
      vip_until,
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
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("adverts")
      .update({
        status: "active",
        expiry_date: expiryDateFromDays(days),
        created_at: now,
        updated_at: now,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
