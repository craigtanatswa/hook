"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Pencil, Eye, Trash2, PauseCircle, Search, Star, X } from "lucide-react";
import { deleteAdvertAction, deactivateAdvertAction } from "@/app/actions/adverts";
import { zimbabweCities } from "@/lib/data";

function isUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

interface Advert {
  id: string;
  name: string;
  location: string;
  category: string;
  expiresAt: string;
  images: string[];
  profileImage: string;
  featured?: boolean;
  status?: string;
}

interface Props {
  adverts: Advert[];
}

export function ActiveAdvertsClient({ adverts }: Props) {
  const [query, setQuery] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "standard">("all");
  const [locationFilter, setLocationFilter] = useState("");

  const filtered = useMemo(() => {
    return adverts.filter((a) => {
      const q = query.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && a.featured) ||
        (featuredFilter === "standard" && !a.featured);

      const matchesLocation =
        !locationFilter ||
        a.location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesFeatured && matchesLocation;
    });
  }, [adverts, query, featuredFilter, locationFilter]);

  const hasFilters = query || featuredFilter !== "all" || locationFilter;
  const clearAll = () => {
    setQuery("");
    setFeaturedFilter("all");
    setLocationFilter("");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Live profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {adverts.length}{" "}
            {adverts.length === 1 ? "cuddler" : "cuddlers"} shown
          </p>
        </div>
        <Link
          href="/admin/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          + New listing
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name, location or category…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Featured filter */}
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value as "all" | "featured" | "standard")}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All listings</option>
              <option value="featured">Featured only</option>
              <option value="standard">Standard only</option>
            </select>
          </div>

          {/* Location filter */}
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All cities</option>
              {zimbabweCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Clear all */}
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((advert) => {
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
                          action={async () => { await deactivateAdvertAction(advert.id); }}
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
                          action={async () => { await deleteAdvertAction(advert.id); }}
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
          {hasFilters ? (
            <>
              <p className="font-semibold text-foreground">No results match your filters</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Try widening your search or clearing filters.</p>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Clear all filters
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
