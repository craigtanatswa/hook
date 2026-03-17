import { fetchExpiredAdvertsWithMedia } from "@/lib/adverts-db";
import { getExpiredAdverts } from "@/lib/data";
import { ExpiredAdvertsClient } from "./client";

export default async function ExpiredAdvertsPage() {
  let adverts = await fetchExpiredAdvertsWithMedia();
  if (adverts.length === 0) {
    adverts = getExpiredAdverts();
  }

  return <ExpiredAdvertsClient adverts={adverts} />;
}
