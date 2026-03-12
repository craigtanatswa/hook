"use client";

import { useState } from "react";
import { MapPin, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { getExpiredAdverts, type Advert } from "@/lib/data";

export default function ExpiredAdvertsPage() {
  const initial = getExpiredAdverts();
  const [adverts, setAdverts] = useState<Advert[]>(initial);
  const [reposted, setReposted] = useState<Set<string>>(new Set());

  const handleDelete = (id: string) => {
    setAdverts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRepost = (id: string) => {
    setReposted((prev) => new Set(prev).add(id));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Expired Adverts</h1>
        <p className="text-sm text-muted-foreground mt-1">{adverts.length} expired</p>
      </div>

      {adverts.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border px-4 py-16 text-center">
          <p className="font-semibold text-foreground">No expired adverts</p>
          <p className="text-sm text-muted-foreground mt-1">All adverts are currently active.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {adverts.map((advert) => {
            const expiredDate = new Date(advert.expiresAt).toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const isReposted = reposted.has(advert.id);

            return (
              <div
                key={advert.id}
                className="bg-card rounded-2xl border border-border px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground">{advert.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    <p className="text-xs text-muted-foreground truncate">{advert.location}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="text-destructive font-medium">Expired</span> {expiredDate} · {advert.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRepost(advert.id)}
                    disabled={isReposted}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isReposted
                        ? "bg-primary/20 text-primary cursor-default"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {isReposted ? "Reposted" : "Repost"}
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    aria-label={`Edit ${advert.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(advert.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-colors"
                    aria-label={`Delete ${advert.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
