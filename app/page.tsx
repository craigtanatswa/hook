"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { AdvertCard } from "@/components/advert-card";
import { FeaturedAdvertsSection } from "@/components/featured-adverts-section";
import { FilterPanel } from "@/components/filter-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { formatAdvertLocation, type Advert } from "@/lib/data";
import Link from "next/link";

const ADVERTS_PER_PAGE = 10;

export default function HomePage() {
  // null = loading; [] = loaded but empty; Advert[] = loaded with results
  const [allAdverts, setAllAdverts] = useState<Advert[] | null>(null);
  const [featuredAdverts, setFeaturedAdverts] = useState<Advert[]>([]);

  useEffect(() => {
    fetch("/api/adverts")
      .then((r) => r.json())
      .then((d: { adverts?: Advert[] }) => {
        const list = d.adverts ?? [];
        setAllAdverts(list);
        setFeaturedAdverts(list.filter((a) => a.featured));
      })
      .catch(() => setAllAdverts([]));
  }, []);

  const [search, setSearch] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [suburbFilter, setSuburbFilter] = useState("");
  const [gender, setGender] = useState("All");
  const [bodyType, setBodyType] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const filtered = (allAdverts ?? []).filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.shortDescription.toLowerCase().includes(search.toLowerCase());
    const q = locationQuery.trim().toLowerCase();
    const formatted = formatAdvertLocation(a).toLowerCase();
    const matchLocationQuery =
      !q ||
      formatted.includes(q) ||
      a.location.toLowerCase().includes(q) ||
      (a.suburb?.toLowerCase().includes(q) ?? false);
    const matchCity = !cityFilter || a.location === cityFilter;
    const matchSuburb = !suburbFilter || a.suburb === suburbFilter;
    const matchGender = gender === "All" || a.gender === gender;
    const matchBodyType = bodyType === "All" || a.bodyType === bodyType;
    return matchSearch && matchLocationQuery && matchCity && matchSuburb && matchGender && matchBodyType;
  });

  const totalPages = Math.ceil(filtered.length / ADVERTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADVERTS_PER_PAGE;
  const paginatedAdverts = filtered.slice(startIndex, startIndex + ADVERTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, locationQuery, cityFilter, suburbFilter, gender, bodyType]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setLocationQuery("");
    setCityFilter("");
    setSuburbFilter("");
    setGender("All");
    setBodyType("All");
  };

  const noExtraFilters =
    !search &&
    !locationQuery.trim() &&
    !cityFilter &&
    !suburbFilter &&
    gender === "All" &&
    bodyType === "All";

  const filterActive =
    Boolean(locationQuery.trim()) ||
    Boolean(cityFilter) ||
    Boolean(suburbFilter) ||
    gender !== "All" ||
    bodyType !== "All";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
        <div className="h-14 flex items-center gap-3 px-4 lg:pl-6">
          <Link href="/" className="text-2xl font-black text-primary tracking-tight shrink-0">
            Hook
          </Link>

          <div className="flex-1 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, fantasy, or area…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
            />
          </div>

          {/* Mobile filter sheet trigger */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open filters"
                className={`lg:hidden shrink-0 p-2 rounded-xl border transition-colors ${
                  filterActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-foreground hover:bg-muted"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-2rem,20rem)] p-5 pt-10">
              <FilterPanel
                locationQuery={locationQuery}
                onLocationQueryChange={setLocationQuery}
                cityFilter={cityFilter}
                onCityFilterChange={setCityFilter}
                suburbFilter={suburbFilter}
                onSuburbFilterChange={setSuburbFilter}
                gender={gender}
                onGenderChange={setGender}
                bodyType={bodyType}
                onBodyTypeChange={setBodyType}
                onClearAll={() => {
                  clearAllFilters();
                  setMobileFiltersOpen(false);
                }}
                resultCount={filtered.length}
                compact
              />
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
            className="shrink-0 p-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* Body: left filter panel + main content */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop filter sidebar */}
        <aside
          className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border bg-muted/30"
          aria-label="Filter controls"
        >
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
            <FilterPanel
              locationQuery={locationQuery}
              onLocationQueryChange={setLocationQuery}
              cityFilter={cityFilter}
              onCityFilterChange={setCityFilter}
              suburbFilter={suburbFilter}
              onSuburbFilterChange={setSuburbFilter}
              gender={gender}
              onGenderChange={setGender}
              bodyType={bodyType}
              onBodyTypeChange={setBodyType}
              onClearAll={clearAllFilters}
              resultCount={filtered.length}
            />
          </div>
        </aside>

        {/* Main listing area */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground text-balance leading-tight">
              Someone sexy, in your sheets, tonight
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
              Why settle for a dream when you can invite it over? Hook is the portal between your deepest desires and your
              front door. Browse explicit, unfiltered profiles that blur the line between art and ecstasy. From whispered
              secrets to full-service nights that never end, just two consenting souls and the beautiful, sexy moments you
              create together. Pure magic, no strings.
            </p>
          </div>

          {/* Loading skeletons */}
          {allAdverts === null && (
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
                  <div className="w-full aspect-[3/4] bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between gap-4">
                      <div className="h-5 bg-muted rounded-lg w-2/5" />
                      <div className="h-5 bg-muted rounded-lg w-1/5" />
                    </div>
                    <div className="h-4 bg-muted rounded-lg w-3/5" />
                    <div className="h-4 bg-muted rounded-lg w-full" />
                    <div className="h-4 bg-muted rounded-lg w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Loaded with results */}
          {allAdverts !== null && filtered.length > 0 && (
            <>
              {featuredAdverts.length > 0 && currentPage === 1 && noExtraFilters && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-foreground mb-3">Tonight&apos;s obsession</h2>
                  <FeaturedAdvertsSection adverts={featuredAdverts} />
                </div>
              )}

              {featuredAdverts.length > 0 && !noExtraFilters && filtered.some((a) => a.featured) && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-foreground mb-3">Still dripping in your search</h2>
                  <FeaturedAdvertsSection adverts={filtered.filter((a) => a.featured)} />
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>

                  <p className="text-xs text-muted-foreground font-medium">
                    {filtered.length} {filtered.length === 1 ? "escort" : "escorts"} — Page {currentPage} of {totalPages}
                  </p>

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Single-column listing — portrait ratio favored */}
              <div className="flex flex-col gap-6">
                {paginatedAdverts.map((advert) => (
                  <AdvertCard key={advert.id} advert={advert} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1 flex-wrap">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
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
          )}

          {/* Loaded — filters return nothing */}
          {allAdverts !== null && allAdverts.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-semibold text-foreground text-xl">Nobody matching that fantasy (yet)</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Loosen your filters — someone new is always about to post.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Loaded — database has no live listings at all */}
          {allAdverts !== null && allAdverts.length === 0 && (
            <div className="text-center py-20">
              <p className="font-semibold text-foreground text-xl">No listings live yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Check back soon — escorts are loading onto the feed.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
