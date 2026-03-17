import { fetchAllAdvertsWithMediaForAdmin } from "@/lib/adverts-db";
import { ActiveAdvertsClient } from "./client";

export default async function ActiveAdvertsPage() {
  const all = await fetchAllAdvertsWithMediaForAdmin();
  const adverts = all.filter((a) => a.status === "active");
  return <ActiveAdvertsClient adverts={adverts} />;
}
