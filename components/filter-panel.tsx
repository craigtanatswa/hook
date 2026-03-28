"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { genders, bodyTypes, zimbabweCities, zimbabweCitySuburbs, type ZimbabweCity } from "@/lib/data";

const CITY_PREVIEW_COUNT = 5;

type FilterPanelProps = {
  locationQuery: string;
  onLocationQueryChange: (v: string) => void;
  cityFilter: string;
  onCityFilterChange: (v: string) => void;
  suburbFilter: string;
  onSuburbFilterChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
  bodyType: string;
  onBodyTypeChange: (v: string) => void;
  onClearAll: () => void;
  resultCount: number;
  compact?: boolean;
};

export function FilterPanel({
  locationQuery,
  onLocationQueryChange,
  cityFilter,
  onCityFilterChange,
  suburbFilter,
  onSuburbFilterChange,
  gender,
  onGenderChange,
  bodyType,
  onBodyTypeChange,
  onClearAll,
  resultCount,
  compact = false,
}: FilterPanelProps) {
  const [citiesExpanded, setCitiesExpanded] = useState(false);

  useEffect(() => {
    const idx = zimbabweCities.findIndex((c) => c === cityFilter);
    if (idx >= CITY_PREVIEW_COUNT) {
      setCitiesExpanded(true);
    }
  }, [cityFilter]);

  const hasMoreCities = zimbabweCities.length > CITY_PREVIEW_COUNT;
  const visibleCities = citiesExpanded
    ? zimbabweCities
    : zimbabweCities.slice(0, CITY_PREVIEW_COUNT);

  const suburbList = cityFilter
    ? [...(zimbabweCitySuburbs[cityFilter as ZimbabweCity] ?? [])]
    : [];

  const hasActive =
    Boolean(locationQuery.trim()) ||
    Boolean(cityFilter) ||
    Boolean(suburbFilter) ||
    gender !== "All" ||
    bodyType !== "All";

  const btnBase =
    "w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors";
  const btnActive = "bg-primary text-primary-foreground";
  const btnIdle = "bg-muted/80 text-muted-foreground hover:bg-accent hover:text-foreground";

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Filters</h2>
        {hasActive && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location: search + cities + suburbs */}
      <div>
        <label htmlFor="filter-location" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Location
        </label>
        <div className="relative mb-2">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="filter-location"
            type="search"
            value={locationQuery}
            onChange={(e) => onLocationQueryChange(e.target.value)}
            placeholder="Search suburb or city…"
            autoComplete="off"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <span className="text-xs font-semibold text-muted-foreground mb-2 block">Cities</span>
        <div
          className={`flex flex-col gap-1.5 ${compact && citiesExpanded ? "max-h-48 overflow-y-auto pr-1 -mr-1" : ""}`}
        >
          <button
            type="button"
            onClick={() => {
              onCityFilterChange("");
              onSuburbFilterChange("");
            }}
            className={`${btnBase} ${!cityFilter ? btnActive : btnIdle}`}
          >
            All cities
          </button>
          {visibleCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                onCityFilterChange(city);
                onSuburbFilterChange("");
              }}
              className={`${btnBase} ${cityFilter === city ? btnActive : btnIdle}`}
            >
              {city}
            </button>
          ))}
          {hasMoreCities && (
            <button
              type="button"
              onClick={() => {
                setCitiesExpanded((expanded) => {
                  if (expanded) {
                    const idx = zimbabweCities.findIndex((c) => c === cityFilter);
                    if (idx >= CITY_PREVIEW_COUNT) return true;
                  }
                  return !expanded;
                });
              }}
              className={`${btnBase} ${btnIdle} inline-flex items-center justify-center gap-1`}
            >
              {citiesExpanded ? (
                <>
                  Show fewer
                  <ChevronUp className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                </>
              ) : (
                <>
                  Show more ({zimbabweCities.length - CITY_PREVIEW_COUNT})
                  <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                </>
              )}
            </button>
          )}
        </div>

        {cityFilter && suburbList.length > 0 && (
          <>
            <span className="text-xs font-semibold text-muted-foreground mb-2 mt-4 block">
              Suburbs in {cityFilter}
            </span>
            <div
              className={`flex flex-col gap-1.5 ${compact ? "max-h-40 overflow-y-auto pr-1 -mr-1" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSuburbFilterChange("")}
                className={`${btnBase} ${!suburbFilter ? btnActive : btnIdle}`}
              >
                All suburbs
              </button>
              {suburbList.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSuburbFilterChange(sub)}
                  className={`${btnBase} ${suburbFilter === sub ? btnActive : btnIdle}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Gender */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground mb-2 block">Gender</span>
        <div className="flex flex-col gap-1.5">
          {genders.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onGenderChange(g)}
              className={`${btnBase} ${gender === g ? btnActive : btnIdle}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Body type */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground mb-2 block">Body type</span>
        <div className="flex flex-col gap-1.5">
          {bodyTypes.map((bt) => (
            <button
              key={bt}
              type="button"
              onClick={() => onBodyTypeChange(bt)}
              className={`${btnBase} ${bodyType === bt ? btnActive : btnIdle}`}
            >
              {bt}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "escort" : "escorts"} match
        </p>
      </div>
    </div>
  );
}
