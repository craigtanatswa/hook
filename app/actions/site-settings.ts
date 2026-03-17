"use server";

import { setMaintenanceMode, isMaintenanceMode } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";

export async function toggleMaintenanceAction(formData: FormData) {
  const enable = formData.get("maintenance") === "1";
  const result = await setMaintenanceMode(enable);
  if ("error" in result) throw new Error(result.error);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { maintenance: enable };
}

export async function getMaintenanceStatusAction() {
  return isMaintenanceMode();
}
