import { getActiveAdverts } from "@/lib/data";
import { fetchAllAdvertsWithMediaForAdmin } from "@/lib/adverts-db";
import { ActiveAdvertsClient } from "./client";

export default async function ActiveAdvertsPage() {
  const all = await fetchAllAdvertsWithMediaForAdmin();
  const adverts =
    all.length > 0 ? all.filter((a) => a.status === "active") : getActiveAdverts();

  return <ActiveAdvertsClient adverts={adverts} />;
}
