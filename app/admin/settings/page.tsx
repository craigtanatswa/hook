import { isMaintenanceMode } from "@/lib/site-settings";
import { SettingsClient } from "./client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const maintenance = await isMaintenanceMode();
  return <SettingsClient maintenanceMode={maintenance} />;
}
