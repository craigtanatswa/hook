import type { Advert, BodyType } from "@/lib/data";
import { createAnonServerClient, createServiceClient } from "@/lib/supabase/server";

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
  created_at: string;
};

type MediaRow = {
  advert_id: string;
  media_url: string;
  media_type: string;
  order_index: number;
};

function rowToAdvert(row: AdvertRow, mediaUrls: string[]): Advert {
  const images = mediaUrls.length > 0 ? mediaUrls : ["/placeholder.svg"];
  const now = new Date();
  const expires = new Date(row.expiry_date);
  const status: "active" | "expired" =
    row.status === "expired" || expires <= now ? "expired" : "active";

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
    profileImage: images[0],
    postedAt: row.created_at,
    expiresAt: row.expiry_date,
    status,
    featured: row.featured,
  };
}

/** Fetch active, unexpired adverts with media ordered by order_index. */
export async function fetchActiveAdvertsWithMedia(): Promise<Advert[]> {
  try {
    const supabase = createAnonServerClient();
    const nowIso = new Date().toISOString();

    const { data: advertRows, error: aErr } = await supabase
      .from("adverts")
      .select("*")
      .eq("status", "active")
      .gt("expiry_date", nowIso)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (aErr || !advertRows?.length) return [];

    const ids = advertRows.map((r: AdvertRow) => r.id);
    const { data: mediaRows, error: mErr } = await supabase
      .from("advert_media")
      .select("advert_id, media_url, order_index")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    if (mErr) return [];

    const byAdvert = new Map<string, string[]>();
    for (const m of (mediaRows || []) as MediaRow[]) {
      const list = byAdvert.get(m.advert_id) || [];
      list.push(m.media_url);
      byAdvert.set(m.advert_id, list);
    }

    return (advertRows as AdvertRow[]).map((row) =>
      rowToAdvert(row, byAdvert.get(row.id) || [])
    );
  } catch {
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
      .select("media_url, order_index")
      .eq("advert_id", id)
      .order("order_index", { ascending: true });

    const urls = (mediaRows || []).map((m: { media_url: string }) => m.media_url);
    return rowToAdvert(row as AdvertRow, urls);
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
    const { data: mediaRows } = await supabase
      .from("advert_media")
      .select("advert_id, media_url, order_index")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    const byAdvert = new Map<string, string[]>();
    for (const m of (mediaRows || []) as MediaRow[]) {
      const list = byAdvert.get(m.advert_id) || [];
      list.push(m.media_url);
      byAdvert.set(m.advert_id, list);
    }

    return (advertRows as AdvertRow[]).map((row) =>
      rowToAdvert({ ...row, status: "expired" }, byAdvert.get(row.id) || [])
    );
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
  expiryDays: number;
  featured: boolean;
  mediaUrls: string[];
};

function expiryDateFromDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export async function insertAdvertWithMedia(input: AdvertInput): Promise<{ id: string } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const expiry_date = expiryDateFromDays(input.expiryDays);

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
    const expiry_date = expiryDateFromDays(input.expiryDays);

    const { error: uErr } = await supabase
      .from("adverts")
      .update({
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
        featured: input.featured,
        updated_at: new Date().toISOString(),
      })
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
    const { data: mediaRows } = await supabase
      .from("advert_media")
      .select("advert_id, media_url, order_index")
      .in("advert_id", ids)
      .order("order_index", { ascending: true });

    const byAdvert = new Map<string, string[]>();
    for (const m of (mediaRows || []) as MediaRow[]) {
      const list = byAdvert.get(m.advert_id) || [];
      list.push(m.media_url);
      byAdvert.set(m.advert_id, list);
    }

    return (advertRows as AdvertRow[]).map((row) =>
      rowToAdvert(row, byAdvert.get(row.id) || [])
    );
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
