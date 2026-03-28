"use client";

import { useEffect, useState } from "react";

type MetallicBadgeProps = {
  variant: "vip" | "premium";
  children: React.ReactNode;
  className?: string;
};

/** Scroll up → shine sweeps left→right; scroll down → right→left. */
export function MetallicBadge({ variant, children, className = "" }: MetallicBadgeProps) {
  const [shine, setShine] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? window.scrollY : 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY - 2) setShine("ltr");
      else if (y > lastY + 2) setShine("rtl");
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isVip = variant === "vip";
  const frame = isVip
    ? "bg-gradient-to-br from-amber-900 via-amber-500 to-amber-200"
    : "bg-gradient-to-br from-orange-900 via-orange-500 to-amber-300";

  return (
    <span
      className={`relative inline-flex items-center gap-1 overflow-hidden rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide shadow-md ring-1 ring-black/10 pointer-events-none ${frame} ${className}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 opacity-90 ${
          shine === "ltr" ? "animate-metallic-shine-ltr" : "animate-metallic-shine-rtl"
        }`}
        style={{
          background:
            "linear-gradient(105deg, transparent 0%, transparent 35%, rgba(255,255,255,0.75) 50%, transparent 65%, transparent 100%)",
          backgroundSize: "220% 100%",
        }}
      />
      <span className="relative z-[1] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{children}</span>
    </span>
  );
}
