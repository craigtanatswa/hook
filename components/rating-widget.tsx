"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";

type Props = {
  advertId: string;
  initialAvg?: number;
  initialCount?: number;
};

const LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function RatingWidget({ advertId, initialAvg, initialCount }: Props) {
  const storageKey = useMemo(() => `hook_rated_${advertId}`, [advertId]);
  const [avg, setAvg] = useState<number>(initialAvg ?? 0);
  const [count, setCount] = useState<number>(initialCount ?? 0);
  const [ratedValue, setRatedValue] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [justRated, setJustRated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(storageKey);
      if (v) setRatedValue(Number(v));
    } catch {}
  }, [storageKey]);

  const submit = async (value: number) => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advertId, rating: value }),
      });
      const data = (await res.json()) as
        | { ok: true; summary?: { avg: number; count: number } }
        | { error: string };

      if (!res.ok || "error" in data) {
        setError("error" in data ? data.error : "Failed to submit rating");
        return;
      }
      setAvg(data.summary?.avg ?? avg);
      setCount(data.summary?.count ?? count);
      setRatedValue(value);
      setJustRated(true);
      setTimeout(() => setJustRated(false), 1200);
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  const displayValue = hoverValue ?? ratedValue ?? 0;
  const activeLabel = hoverValue
    ? LABELS[hoverValue]
    : ratedValue
    ? LABELS[ratedValue]
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">Rate this advertiser</p>
          <p className="text-xs text-muted-foreground mt-0.5 h-4">
            {loading
              ? "Saving…"
              : activeLabel
              ? activeLabel
              : ratedValue
              ? "Thanks — you can update your rating any time."
              : "Tap a star to leave a rating."}
          </p>
        </div>
        <RatingStars value={avg} count={count} showText />
      </div>

      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: 5 }, (_, i) => {
          const v = i + 1;
          const isFilled = v <= displayValue;
          const isHovered = hoverValue !== null && v === hoverValue;
          const isInRange = hoverValue !== null && v < hoverValue;
          const isJustRated = justRated && v === ratedValue;

          const scaleClass = isHovered
            ? "scale-125"
            : isInRange
            ? "scale-110"
            : "scale-100";

          return (
            <button
              key={v}
              type="button"
              disabled={loading}
              onMouseEnter={() => setHoverValue(v)}
              onFocus={() => setHoverValue(v)}
              onBlur={() => setHoverValue(null)}
              onClick={() => submit(v)}
              aria-label={`Rate ${v} out of 5 — ${LABELS[v]}`}
              className={`p-1 rounded-md transition-all duration-150 ease-out disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isHovered ? "bg-primary/10" : ""
              }`}
            >
              <Star
                className={[
                  "h-6 w-6 transition-all duration-150 ease-out",
                  scaleClass,
                  isFilled
                    ? "text-primary fill-primary drop-shadow-[0_0_4px_hsl(var(--primary)/0.5)]"
                    : "text-muted-foreground/30",
                  isJustRated ? "animate-bounce" : "",
                ].join(" ")}
              />
            </button>
          );
        })}

        {ratedValue && !loading && !hoverValue && (
          <span className="ml-2 text-xs font-semibold text-primary">
            {ratedValue}/5
          </span>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}
