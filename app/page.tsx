"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { AdvertCard } from "@/components/advert-card";
import { FeaturedAdvertsSection } from "@/components/featured-adverts-section";
import { FilterPanel } from "@/components/filter-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getActiveAdverts, getFeaturedAdverts } from "@/lib/data";
import type { Advert } from "@/lib/data";
import Link from "next/link";

const ADVERTS_PER_PAGE = 10;

export default function HomePage() {
  const [allAdverts, setAllAdverts] = useState<Advert[]>(() => getActiveAdverts());
  const [featuredAdverts, setFeaturedAdverts] = useState<Advert[]>(() => getFeaturedAdverts());

  useEffect(() => {
    fetch("/api/adverts")
      .then((r) => r.json())
      .then((d: { adverts?: Advert[] }) => {
        if (d.adverts && d.adverts.length > 0) {
          setAllAdverts(d.adverts);
          setFeaturedAdverts(d.adverts.filter((a) => a.featured));
        }
      })
      .catch(() => {});
  }, []);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");
  const [gender, setGender] = useState("All");
  const [bodyType, setBodyType] = useState("All");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const filtered = allAdverts.filter((a) => {
    const matchSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchLocation =
      !location || a.location.toLowerCase().includes(location.toLowerCase());
    const matchCategory = category === "All" || a.category === category;
    const matchGender = gender === "All" || a.gender === gender;
    const matchBodyType = bodyType === "All" || a.bodyType === bodyType;
    return matchSearch && matchLocation && matchCategory && matchGender && matchBodyType;
  });

  const totalPages = Math.ceil(filtered.length / ADVERTS_PER_PAGE);
  const startIndex = (currentPage - 1) * ADVERTS_PER_PAGE;
  const paginatedAdverts = filtered.slice(startIndex, startIndex + ADVERTS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, location, category, gender, bodyType]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const clearAllFilters = () => {
    setSearch("");
    setLocation("");
    setCategory("All");
    setGender("All");
    setBodyType("All");
  };

  const noExtraFilters =
    !search && !location.trim() && category === "All" && gender === "All" && bodyType === "All";

  const filterActive =
    Boolean(location.trim()) || category !== "All" || gender !== "All" || bodyType !== "All";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar — full width */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
        <div className="h-14 flex items-center gap-3 px-4 lg:pl-6">
          <Link href="/" className="text-2xl font-black text-primary tracking-tight shrink-0">
            Hook
          </Link>

          {/* Search — shared; on lg+ main has margin so this can span */}
          <div className="flex-1 relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, vibe, or area..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors"
            />
          </div>

          {/* Mobile: open left filter sheet */}
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
                location={location}
                onLocationChange={setLocation}
                category={category}
                onCategoryChange={(c) => {
                  setCategory(c);
                  setMobileFiltersOpen(false);
                }}
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

      {/* Body: left control panel + main */}
      <div className="flex flex-1 min-h-0">
        {/* Left filter control panel — desktop only */}
        <aside
          className="hidden lg:flex w-72 shrink-0 flex-col border-r border-border bg-muted/30"
          aria-label="Filter controls"
        >
          <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-5">
            <FilterPanel
              location={location}
              onLocationChange={setLocation}
              category={category}
              onCategoryChange={setCategory}
              gender={gender}
              onGenderChange={setGender}
              bodyType={bodyType}
              onBodyTypeChange={setBodyType}
              onClearAll={clearAllFilters}
              resultCount={filtered.length}
            />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-8 max-w-3xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-foreground text-balance leading-tight">
              Someone sexy, on your sofa, tonight
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-3 leading-relaxed">
              Hook is where consent-first cuddlers come to you—slow spooning, movie-night tangled legs, or deep rest with
              arms that don’t quit. Pick a profile that makes your stomach flip, then message. No middleman, just heat
              (the cozy kind).
            </p>
          </div>

          {filtered.length > 0 ? (
            <>
              {featuredAdverts.length > 0 && currentPage === 1 && noExtraFilters && (
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-foreground mb-3">Tonight’s crush</h2>
                  <FeaturedAdvertsSection adverts={featuredAdverts} />
                </div>
              )}

              {featuredAdverts.length > 0 &&
                !noExtraFilters &&
                filtered.some((a) => a.featured) && (
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-foreground mb-3">Still turning heads in your search</h2>
                    <FeaturedAdvertsSection adverts={filtered.filter((a) => a.featured)} />
                  </div>
                )}

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
                  {filtered.length} {filtered.length === 1 ? "cuddler" : "cuddlers"} — Page {currentPage} of{" "}
                  {totalPages}
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

              <div className="flex flex-col gap-5">
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
          ) : (
            <div className="text-center py-20">
              <p className="font-semibold text-foreground text-xl">Nobody matching that fantasy (yet)</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Widen your area or clear filters—there’s always another pair of arms loading.
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
        </main>
      </div>
    </div>
  );
}
