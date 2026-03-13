"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  insertAdvertWithMedia,
  updateAdvertWithMedia,
  deleteAdvert,
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
  const name = String(formData.get("name") || "").trim();
  const age = parseInt(String(formData.get("age") || "0"), 10);
  const location = String(formData.get("location") || "").trim();
  const gender = String(formData.get("gender") || "Female");
  const bodyType = String(formData.get("bodyType") || "Average");
  const category = String(formData.get("category") || "Soft & slow").trim();
  const fullDescription = String(formData.get("description") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const email = String(formData.get("email") || "").trim() || undefined;
  const expiryDays = parseInt(String(formData.get("expiry") || "30"), 10) || 30;
  const featured = formData.get("featured") === "on";
  const mediaUrls = parseMediaUrls(formData);

  if (!name || !location || !fullDescription || !phone || !whatsapp) {
    return { error: "Missing required fields" };
  }
  if (mediaUrls.length === 0) {
    return { error: "Please add at least one photo before publishing." };
  }

  return {
    name,
    age: Number.isFinite(age) ? age : 25,
    location,
    gender,
    bodyType,
    category,
    shortDescription: fullDescription.slice(0, 280),
    fullDescription,
    phone,
    whatsapp,
    email,
    expiryDays,
    featured,
    mediaUrls,
  };
}

export async function createAdvertAction(formData: FormData) {
  const input = buildInput(formData);
  if ("error" in input) return { error: input.error };

  const result = await insertAdvertWithMedia(input);
  if ("error" in result) return result;

  revalidatePath("/");
  revalidatePath("/admin/active");
  redirect(`/admin/active`);
}

export async function updateAdvertAction(advertId: string, formData: FormData) {
  const input = buildInput(formData);
  if ("error" in input) return { error: input.error };

  const result = await updateAdvertWithMedia(advertId, input);
  if ("error" in result) return result;

  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath(`/adverts/${advertId}`);
  redirect(`/admin/active`);
}

export async function deleteAdvertAction(advertId: string) {
  const result = await deleteAdvert(advertId);
  if ("error" in result) return result;
  revalidatePath("/");
  revalidatePath("/admin/active");
  revalidatePath("/admin/expired");
  return { ok: true };
}
