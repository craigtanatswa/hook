"use client";

import { Star } from "lucide-react";

type Props = {
  value: number; // 0..5
  count?: number;
  showText?: boolean;
  className?: string;
  starClassName?: string;
};

export function RatingStars({
  value,
  count,
  showText = true,
  className,
  starClassName,
}: Props) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  const rounded = Math.round(safe * 10) / 10;
  const full = Math.floor(rounded);
  const frac = rounded - full;

  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <div className="inline-flex items-center">
        {Array.from({ length: 5 }, (_, i) => {
          const idx = i + 1;
          const isFull = idx <= full;
          const isHalf = !isFull && idx === full + 1 && frac >= 0.25 && frac < 0.75;
          const isAlmostFull = !isFull && idx === full + 1 && frac >= 0.75;

          const fillPercent = isFull || isAlmostFull ? 100 : isHalf ? 50 : 0;

          return (
            <span key={idx} className="relative inline-block h-4 w-4">
              <Star className={`h-4 w-4 text-muted-foreground/40 ${starClassName ?? ""}`} />
              {fillPercent > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <Star className={`h-4 w-4 text-primary fill-primary ${starClassName ?? ""}`} />
                </span>
              )}
            </span>
          );
        })}
      </div>

      {showText && (
        <span className="text-xs font-semibold text-muted-foreground">
          {count && count > 0 ? `${rounded.toFixed(1)} (${count})` : "No ratings yet"}
        </span>
      )}
    </div>
  );
}

