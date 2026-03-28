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
import { getSuburbsForCity, zimbabweCities } from "@/lib/data";
import { normalizePhoneE164, normalizeWhatsappDigits } from "@/lib/phone-zw";

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
  const suburb = String(formData.get("suburb") || "").trim();
  const gender = String(formData.get("gender") || "Female");
  const bodyType = String(formData.get("bodyType") || "Average");
  const fullDescription = String(formData.get("description") || "").trim();
  const phone = normalizePhoneE164(String(formData.get("phone") || "").trim());
  const whatsapp = normalizeWhatsappDigits(String(formData.get("whatsapp") || "").trim());
  const email = String(formData.get("email") || "").trim() || undefined;
  const expiryRaw = String(formData.get("expiry") || "30");
  const premium = formData.get("premium") === "on";
  const vip = formData.get("vip") === "on";
  const premiumDays = premium
    ? Math.max(1, parseInt(String(formData.get("premium_days") || "7"), 10) || 7)
    : undefined;
  const vipDays = vip
    ? Math.max(1, parseInt(String(formData.get("vip_days") || "7"), 10) || 7)
    : undefined;
  const mediaUrls = parseMediaUrls(formData);
  const focalPointsRaw = String(formData.get("media_focal_points") ?? "");
  const focalPoints = focalPointsRaw
    .split(/\r?\n/)
    .map((s) => s.trim() || "50% 50%");

  if (!name || !location || !suburb || !fullDescription || !phone || !whatsapp) {
    return { error: "Missing required fields" };
  }
  if (!zimbabweCities.includes(location as (typeof zimbabweCities)[number])) {
    return { error: "Invalid city" };
  }
  const allowedSuburbs = getSuburbsForCity(location);
  if (!allowedSuburbs.includes(suburb)) {
    return { error: "Invalid suburb for selected city" };
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
    suburb,
    gender,
    bodyType,
    shortDescription: fullDescription.slice(0, 280),
    fullDescription,
    phone,
    whatsapp,
    email,
    expiryDays,
    premium,
    vip,
    premiumDays,
    vipDays,
    mediaUrls,
    focalPoints,
  };
}

export async function createAdvertAction(
  formData: FormData
): Promise<{ ok: true; id: string } | { error: string }> {
  const input = buildInput(formData);
  if ("error" in input) return { error: input.error };

  if (input.premium && input.premiumDays && typeof input.expiryDays === "number") {
    input.premiumDays = Math.min(input.premiumDays, input.expiryDays);
  }
  if (input.vip && input.vipDays && typeof input.expiryDays === "number") {
    input.vipDays = Math.min(input.vipDays, input.expiryDays);
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
  const parsed = buildInput(formData);
  if ("error" in parsed) return { error: parsed.error };
  const input: AdvertInput = parsed;

  async function capTierDays(days: number | undefined): Promise<number | undefined> {
    if (days === undefined) return undefined;
    let cap = input.expiryDays;
    if (typeof cap !== "number") {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();
      const { data } = await supabase.from("adverts").select("expiry_date").eq("id", advertId).maybeSingle();
      const untilIso = (data as { expiry_date?: string } | null)?.expiry_date;
      if (untilIso) {
        const ms = new Date(untilIso).getTime() - Date.now();
        cap = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
      }
    }
    if (typeof cap === "number") return Math.min(days, cap);
    return days;
  }

  if (input.premium && input.premiumDays) {
    input.premiumDays = await capTierDays(input.premiumDays);
  }
  if (input.vip && input.vipDays) {
    input.vipDays = await capTierDays(input.vipDays);
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
