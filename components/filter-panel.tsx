"use client";

import { MapPin, X } from "lucide-react";
import { categories, genders, bodyTypes } from "@/lib/data";

type FilterPanelProps = {
  location: string;
  onLocationChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  gender: string;
  onGenderChange: (v: string) => void;
  bodyType: string;
  onBodyTypeChange: (v: string) => void;
  onClearAll: () => void;
  resultCount: number;
  compact?: boolean;
};

export function FilterPanel({
  location,
  onLocationChange,
  category,
  onCategoryChange,
  gender,
  onGenderChange,
  bodyType,
  onBodyTypeChange,
  onClearAll,
  resultCount,
  compact = false,
}: FilterPanelProps) {
  const hasActive =
    Boolean(location.trim()) ||
    category !== "All" ||
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

      {/* Location */}
      <div>
        <label htmlFor="filter-location" className="text-xs font-semibold text-muted-foreground mb-1.5 block">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="filter-location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="City, suburb..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {location && (
            <button
              type="button"
              onClick={() => onLocationChange("")}
              aria-label="Clear location"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
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

      {/* Vibe / category */}
      <div>
        <span className="text-xs font-semibold text-muted-foreground mb-2 block">Vibe</span>
        <div className="flex flex-col gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`${btnBase} ${category === cat ? btnActive : btnIdle}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "cuddler" : "cuddlers"} match
        </p>
      </div>
    </div>
  );
}
