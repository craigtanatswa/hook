import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { fetchExpiredAdvertsWithMedia } from "@/lib/adverts-db";
import { getExpiredAdverts } from "@/lib/data";
import { deleteAdvertAction } from "@/app/actions/adverts";
import { RepostButton } from "@/components/repost-button";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default async function ExpiredAdvertsPage() {
  let adverts = await fetchExpiredAdvertsWithMedia();
  if (adverts.length === 0) {
    adverts = getExpiredAdverts();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Expired listings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {adverts.length} off the feed — repost, edit or delete them below.
        </p>
      </div>

      {adverts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border px-4 py-16 text-center">
          <p className="font-semibold text-foreground">Nothing in the graveyard</p>
          <p className="text-sm text-muted-foreground mt-1">
            Every profile is still live — nice problem to have.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adverts.map((advert) => {
            const expiredDate = new Date(advert.expiresAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const uuid = isUuid(advert.id);

            return (
              <div
                key={advert.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-square bg-muted overflow-hidden shrink-0">
                  <Image
                    src={advert.images[0] || advert.profileImage}
                    alt={`${advert.name}'s listing`}
                    fill
                    className="object-cover opacity-70"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-destructive/90 text-white text-xs font-bold">
                    Expired
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-3 flex-1">
                  {/* Info */}
                  <div>
                    <h3 className="font-bold text-foreground text-sm truncate">{advert.name}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{advert.location}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {advert.category} · Expired {expiredDate}
                    </p>
                  </div>

                  {/* Repost (DB listings only) */}
                  {uuid ? (
                    <RepostButton advertId={advert.id} advertName={advert.name} />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Legacy listing — create a new one to re-publish.
                    </p>
                  )}

                  {/* Edit + Delete row */}
                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/admin/edit/${advert.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {uuid && (
                      <form
                        action={deleteAdvertAction.bind(null, advert.id)}
                        className="flex-1"
                      >
                        <button
                          type="submit"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-medium"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
