import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Eye, Trash2, PauseCircle } from "lucide-react";
import { getActiveAdverts } from "@/lib/data";
import { fetchAllAdvertsWithMediaForAdmin } from "@/lib/adverts-db";
import { deleteAdvertAction, deactivateAdvertAction } from "@/app/actions/adverts";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default async function ActiveAdvertsPage() {
  const all = await fetchAllAdvertsWithMediaForAdmin();
  const adverts = all.length > 0
    ? all.filter((a) => a.status === "active")
    : getActiveAdverts();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Live profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {adverts.length} {adverts.length === 1 ? "cuddler" : "cuddlers"} currently live
          </p>
        </div>
        <Link
          href="/admin/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + New listing
        </Link>
      </div>

      {adverts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adverts.map((advert) => {
            const expires = new Date(advert.expiresAt).toLocaleDateString("en-ZA", {
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
                    alt={`${advert.name}'s advert`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold">
                      Active
                    </span>
                    {advert.featured && (
                      <span className="px-2 py-1 rounded-lg bg-amber-500/90 text-white text-xs font-bold">
                        Featured
                      </span>
                    )}
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
                      {advert.category} · Exp. {expires}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Link
                      href={`/adverts/${advert.id}`}
                      className="flex-1 min-w-[4.5rem] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/edit/${advert.id}`}
                      className="flex-1 min-w-[4.5rem] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {uuid && (
                      <>
                        <form
                          action={deactivateAdvertAction.bind(null, advert.id)}
                          className="flex-1 min-w-[4.5rem]"
                        >
                          <button
                            type="submit"
                            title="Take off the feed without deleting"
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors text-xs font-medium"
                          >
                            <PauseCircle className="h-3.5 w-3.5" />
                            Deactivate
                          </button>
                        </form>
                        <form
                          action={deleteAdvertAction.bind(null, advert.id)}
                          className="flex-1 min-w-[4.5rem]"
                        >
                          <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors text-xs font-medium"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted rounded-2xl border border-border">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-foreground">No live listings yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Publish the first profile to get started.
          </p>
          <Link
            href="/admin/create"
            className="inline-flex px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            New listing
          </Link>
        </div>
      )}
    </div>
  );
}
