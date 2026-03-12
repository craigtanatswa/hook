import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Eye } from "lucide-react";
import { getActiveAdverts } from "@/lib/data";

export default function ActiveAdvertsPage() {
  const adverts = getActiveAdverts();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Active Adverts</h1>
        <p className="text-sm text-muted-foreground mt-1">{adverts.length} currently live</p>
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
                {/* Image preview */}
                <div className="relative w-full aspect-square bg-muted overflow-hidden">
                  <Image
                    src={advert.images[0] || advert.profileImage}
                    alt={`${advert.name}'s advert`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-xs font-bold">
                    Active
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-bold text-foreground text-sm mb-1 truncate">
                    {advert.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{advert.location}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {advert.category} · Exp. {expires}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/adverts/${advert.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors text-xs font-medium"
                      aria-label={`View ${advert.name}'s advert`}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/edit/${advert.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-xs font-medium"
                      aria-label={`Edit ${advert.name}'s advert`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted rounded-2xl border border-border">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-foreground">No active adverts yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first advert to get started</p>
          <Link
            href="/admin/create"
            className="inline-flex px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Create Advert
          </Link>
        </div>
      )}
    </div>
  );
}
