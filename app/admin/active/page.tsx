import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Eye, Trash2 } from "lucide-react";
import { getActiveAdverts } from "@/lib/data";
import { fetchAllAdvertsWithMediaForAdmin } from "@/lib/adverts-db";
import { deleteAdvertAction } from "@/app/actions/adverts";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export default async function ActiveAdvertsPage() {
  let adverts = await fetchAllAdvertsWithMediaForAdmin();
  if (adverts.length === 0) {
    adverts = getActiveAdverts();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Live profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {adverts.length} cuddlers — data from database when migrated; otherwise fallback list.
        </p>
      </div>

      {adverts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {adverts.map((advert) => {
            const expires = new Date(advert.expiresAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            return (
              <div
                key={advert.id}
                className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full aspect-square bg-muted overflow-hidden">
                  <Image
                    src={advert.images[0] || advert.profileImage}
                    alt={`${advert.name}'s advert`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold">
                    Active
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-foreground text-sm mb-1 truncate">{advert.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{advert.location}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {advert.category} · Exp. {expires}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/adverts/${advert.id}`}
                      className="flex-1 min-w-[5rem] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/edit/${advert.id}`}
                      className="flex-1 min-w-[5rem] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {isUuid(advert.id) && (
                      <form action={deleteAdvertAction.bind(null, advert.id)} className="flex-1 min-w-[5rem]">
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
      ) : (
        <div className="text-center py-16 bg-muted rounded-2xl border border-border">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-foreground">No live listings yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Publish the first profile — media URLs only, stored in <code className="text-xs bg-background px-1 rounded">advert_media</code>.
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
