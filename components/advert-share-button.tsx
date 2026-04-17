"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { buildAdvertPageUrl } from "@/lib/advert-url";
import { cn } from "@/lib/utils";

type AdvertShareButtonProps = {
  advertId: string;
  advertName: string;
  /** Extra classes for the button (e.g. positioning in overlays). */
  className?: string;
};

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

const baseStyles =
  "shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-xl border-2 border-primary bg-white text-primary shadow-sm hover:bg-primary/10 transition-colors disabled:opacity-50 dark:bg-card dark:border-primary dark:text-primary dark:hover:bg-primary/15";

export function AdvertShareButton({ advertId, advertName, className }: AdvertShareButtonProps) {
  const [originFallback, setOriginFallback] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    setOriginFallback(window.location.origin);
  }, []);

  const url = useMemo(
    () => buildAdvertPageUrl(advertId, originFallback),
    [advertId, originFallback]
  );

  const label =
    status === "copied" ? "Link copied" : status === "error" ? "Could not copy" : "Share listing";

  async function handleClick() {
    if (!url) return;

    setStatus("idle");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${advertName} — Hook`,
          text: `Check out this listing on Hook: ${advertName}`,
          url,
        });
        return;
      } catch (e) {
        const err = e as { name?: string };
        if (err?.name === "AbortError") return;
      }
    }

    const ok = await copyToClipboard(url);
    setStatus(ok ? "copied" : "error");
    if (ok) {
      window.setTimeout(() => setStatus("idle"), 2000);
    } else {
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!url}
      aria-label={label}
      title={label}
      className={cn(baseStyles, className)}
    >
      {status === "copied" ? (
        <Check className="h-4 w-4 text-primary" aria-hidden />
      ) : (
        <Share2 className="h-4 w-4 text-primary" aria-hidden />
      )}
    </button>
  );
}
