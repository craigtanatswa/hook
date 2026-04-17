/** Canonical public URL for an advert detail page (uses NEXT_PUBLIC_SITE_URL when set). */
export function publicSiteBase(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : "";
}

export function buildAdvertPageUrl(advertId: string, originFallback: string): string | null {
  const base = publicSiteBase() || originFallback;
  if (!base) return null;
  return `${base}/adverts/${advertId}`;
}
