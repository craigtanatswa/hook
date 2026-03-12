"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal, X, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { AdvertCard } from "@/components/advert-card";
import { getActiveAdverts, categories } from "@/lib/data";
import Link from "next/link";

const ADVERTS_PER_PAGE = 10;

export default function HomePage() {
  const allAdverts = getActiveAdverts();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { resolvedTheme, setTheme } = useTheme();

  const filtered = allAdverts.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchLocation =
      !location || a.location.toLowerCase().includes(location.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    return matchSearch && matchLocation && matchCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / ADVERTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADVERTS_PER_PAGE;
  const paginatedAdverts = filtered.slice(startIndex, startIndex + ADVERTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, location, category]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="text-2xl font-black text-primary tracking-tight shrink-0">
            Hook
          </Link>

          {/* Search bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
            className={`shrink-0 p-2 rounded-xl border transition-colors ${
              showFilters || location || category !== "All"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-foreground hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
            className="shrink-0 p-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="max-w-2xl mx-auto px-4 pb-3 border-t border-border pt-3 space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Filter by location..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              />
              {location && (
                <button
                  onClick={() => setLocation("")}
                  aria-label="Clear location"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Hero tagline */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-foreground text-balance leading-tight">
            Find trusted local service providers
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
            Browse cleaners, plumbers, electricians, tutors and more. Contact them directly via WhatsApp, call, or email.
          </p>
        </div>

        {filtered.length > 0 ? (
          <>
            {/* Top pagination controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>

              <p className="text-xs text-muted-foreground font-medium">
                {filtered.length} {filtered.length === 1 ? "provider" : "providers"} — Page {currentPage} of {totalPages}
              </p>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Single-column list */}
            <div className="flex flex-col gap-5">
              {paginatedAdverts.map((advert) => (
                <AdvertCard key={advert.id} advert={advert} />
              ))}
            </div>

            {/* Bottom pagination — page number list */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-1 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    className={`h-9 min-w-9 px-3 rounded-lg text-sm font-semibold transition-colors ${
                      page === currentPage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="font-semibold text-foreground text-xl">No service providers found</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Try adjusting your search filters or browse all available services.
            </p>
            <button
              onClick={() => { setSearch(""); setLocation(""); setCategory("All"); }}
              className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
