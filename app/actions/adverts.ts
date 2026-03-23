"use server";

import { revalidatePath } from "next/cache";
import {
  insertAdvertWithMedia,
  updateAdvertWithMedia,
  deleteAdvert,
  deactivateAdvert,
  repostAdvert,
  type AdvertInput,
} from "@/lib/adverts-db";

function parseMediaUrls(formData: FormData): string[] {
  const raw = formData.get("media_urls");
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function buildInput(formData: FormData): AdvertInput | { error: string } {
  const isEdit = formData.get("is_edit") === "1";
  const name = String(formData.get("name") || "").trim();
  const age = parseInt(String(formData.get("age") || "0"), 10);
  const location = String(formData.get("location") || "").trim();
  const gender = String(formData.get("gender") || "Female");
  const bodyType = String(formData.get("bodyType") || "Average");
  const fullDescription = String(formData.get("description") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim() || undefined;
  const expiryRaw = String(formData.get("expiry") || "30");
  const featured = formData.get("featured") === "on";
  const featuredDurationRaw = String(formData.get("featured_days") || "7");
  const featuredDays = featured ? Math.max(1, parseInt(featuredDurationRaw, 10) || 7) : undefined;
  const mediaUrls = parseMediaUrls(formData);
  const focalPointsRaw = String(formData.get("media_focal_points") ?? "");
  const focalPoints = focalPointsRaw
    .split(/\r?\n/)
    .map((s) => s.trim() || "50% 50%");

  if (!name || !location || !fullDescription || !phone || !whatsapp) {
    return { error: "Missing required fields" };
  }
  if (mediaUrls.length === 0) {
    return { error: "Please add at least one photo before publishing." };
  }

  // Editing: keep current expiry by default unless admin explicitly changes it.
  let expiryDays: number | undefined;
  if (!isEdit) {
    expiryDays =
      expiryRaw === "custom"
        ? parseInt(String(formData.get("custom_expiry_days") || "14"), 10) || 14
        : parseInt(expiryRaw, 10) || 30;
  } else if (expiryRaw && expiryRaw !== "keep") {
    expiryDays =
      expiryRaw === "custom"
        ? parseInt(String(formData.get("custom_expiry_days") || "14"), 10) || 14
        : parseInt(expiryRaw, 10) || 30;
  }

  return {
    name,
    age: Number.isFinite(age) ? age : 25,
    location,
    gender,
    bodyType,
    shortDescription: fullDescription.slice(0, 280),
    fullDescription,
    phone,
    whatsapp,
    email,
    expiryDays,
    featured,
    featuredDays,
    mediaUrls,
    focalPoints,
  };
}

export async function createAdvertAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { error: string }> {
  const input = buildInput(formData);
  if ("error" in input) return { error: input.error };

  // Safety: featured cannot outlast the advert itself.
  if (input.featured && input.featuredDays && typeof input.expiryDays === "number") {
    input.featuredDays = Math.min(input.featuredDays, input.expiryDays);
  }

  const result = await insertAdvertWithMedia(input);
  if ("error" in result) return result;

  revalidatePath("/");
  revalidatePath("/admin/active");
  return { ok: true, id: result.id };
}

export async function updateAdvertAction(
  advertId: string,
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const input = buildInput(formData);
  if ("error" in input) return { error: input.error };

  // Safety: featured cannot outlast the advert itself.
  // If editing and keeping expiry, we cap to the remaining days on the existing advert.
  if (input.featured && input.featuredDays) {
    let cap = input.expiryDays;
    if (typeof cap !== "number") {
      // Fetch current expiry_date from DB
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();
      const { data } = await supabase.from("adverts").select("expiry_date").eq("id", advertId).maybeSingle();
      const untilIso = (data as { expiry_date?: string } | null)?.expiry_date;
      if (untilIso) {
        const ms = new Date(untilIso).getTime() - Date.now();
        cap = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
      }
    }
    if (typeof cap === "number") {
      input.featuredDays = Math.min(input.featuredDays, cap);
    }
  }

  const result = await updateAdvertWithMedia(advertId, input);
  if ("error" in result) return result;

  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath(`/adverts/${advertId}`);
  return { ok: true };
}

export async function deleteAdvertAction(advertId: string) {
  const result = await deleteAdvert(advertId);
  if ("error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath("/admin/expired");
  return { ok: true };
}

export async function deactivateAdvertAction(advertId: string) {
  const result = await deactivateAdvert(advertId);
  if ("error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath("/admin/expired");
  return { ok: true };
}

export async function repostAdvertAction(
  advertId: string,
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const days = parseInt(String(formData.get("days") || "30"), 10) || 30;
  const result = await repostAdvert(advertId, days);
  if ("error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath("/admin/expired");
  return { ok: true };
}
