import { createServiceClient } from "@/lib/supabase/server";

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("site_settings")
      .select("maintenance")
      .eq("id", 1)
      .maybeSingle();
    return Boolean((data as { maintenance?: boolean } | null)?.maintenance);
  } catch {
    return false;
  }
}

export async function setMaintenanceMode(enabled: boolean): Promise<{ ok: true } | { error: string }> {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("site_settings")
      .update({ maintenance: enabled, updated_at: new Date().toISOString() })
      .eq("id", 1);
    if (error) return { error: error.message };
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
