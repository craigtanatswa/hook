import { fetchExpiredAdvertsWithMedia } from "@/lib/adverts-db";
import { ExpiredAdvertsClient } from "./client";

export default async function ExpiredAdvertsPage() {
  const adverts = await fetchExpiredAdvertsWithMedia();
  return <ExpiredAdvertsClient adverts={adverts} />;
}
