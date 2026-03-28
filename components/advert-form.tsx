"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { genders, bodyTypes, zimbabweCities, zimbabweCitySuburbs, type ZimbabweCity } from "@/lib/data";
import { MediaUploader } from "@/components/media-uploader";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

type ActionResult = { ok: true; id?: string } | { error: string } | void;

type AdvertFormProps = {
  advertId?: string;
  defaultValues?: {
    name?: string;
    age?: string;
    location?: string;
    suburb?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    description?: string;
    gender?: string;
    bodyType?: string;
    expiry?: string;
    expiresAt?: string;
    /** "true" when Premium boost is enabled in the form */
    premium?: string;
    /** "true" when VIP badge is enabled */
    vip?: string;
    premiumDays?: string;
    vipDays?: string;
    mediaUrls?: string;
    mediaFocalPoints?: string;
  };
  action?: (formData: FormData) => Promise<ActionResult>;
  submitLabel?: string;
};

export function AdvertForm({
  advertId,
  defaultValues = {},
  action,
  submitLabel = "Publish listing",
}: AdvertFormProps) {
  const router = useRouter();
  const isEdit = Boolean(advertId);

  const [pending, setPending] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [expiryChoice, setExpiryChoice] = useState(isEdit ? "keep" : (defaultValues.expiry || "30"));
  const [customDays, setCustomDays] = useState("14");
  const defaultPremiumDays = useMemo(() => {
    const v = parseInt(String(defaultValues.premiumDays || "7"), 10);
    return Number.isFinite(v) && v > 0 ? String(v) : "7";
  }, [defaultValues.premiumDays]);
  const defaultVipDays = useMemo(() => {
    const v = parseInt(String(defaultValues.vipDays || "7"), 10);
    return Number.isFinite(v) && v > 0 ? String(v) : "7";
  }, [defaultValues.vipDays]);
  const [premiumDays, setPremiumDays] = useState(defaultPremiumDays);
  const [vipDays, setVipDays] = useState(defaultVipDays);
  const [premiumOn, setPremiumOn] = useState(defaultValues.premium === "true");
  const [vipOn, setVipOn] = useState(defaultValues.vip === "true");

  const initialCity = zimbabweCities.includes(defaultValues.location as (typeof zimbabweCities)[number])
    ? defaultValues.location!
    : "Harare";
  const [city, setCity] = useState(initialCity);
  const [suburb, setSuburb] = useState(() => {
    const subs = [...zimbabweCitySuburbs[initialCity as ZimbabweCity]];
    const saved = defaultValues.suburb?.trim();
    if (saved && subs.some((x) => x === saved)) return saved;
    return subs[0] ?? "";
  });

  useEffect(() => {
    const c = zimbabweCities.includes(defaultValues.location as (typeof zimbabweCities)[number])
      ? defaultValues.location!
      : "Harare";
    setCity(c);
    const subs = [...zimbabweCitySuburbs[c as ZimbabweCity]];
    const saved = defaultValues.suburb?.trim();
    if (saved && subs.some((x) => x === saved)) setSuburb(saved);
    else setSuburb(subs[0] ?? "");
  }, [defaultValues.location, defaultValues.suburb]);

  const maxTierDays = useMemo(() => {
    if (!isEdit) {
      if (expiryChoice === "custom") {
        const d = parseInt(customDays, 10);
        return Number.isFinite(d) && d > 0 ? d : 365;
      }
      const d = parseInt(expiryChoice, 10);
      return Number.isFinite(d) && d > 0 ? d : 365;
    }

    // Edit mode: if admin chooses a new duration, cap to that; if keeping, cap to remaining days.
    if (expiryChoice === "custom") {
      const d = parseInt(customDays, 10);
      return Number.isFinite(d) && d > 0 ? d : 365;
    }
    if (expiryChoice !== "keep") {
      const d = parseInt(expiryChoice, 10);
      return Number.isFinite(d) && d > 0 ? d : 365;
    }
    if (defaultValues.expiresAt) {
      const until = new Date(defaultValues.expiresAt);
      const now = new Date();
      const days = Math.ceil((until.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      return Math.max(1, days);
    }
    return 365;
  }, [customDays, defaultValues.expiresAt, expiryChoice, isEdit]);

  useEffect(() => {
    setPremiumDays(defaultPremiumDays);
  }, [defaultPremiumDays]);

  useEffect(() => {
    setVipDays(defaultVipDays);
  }, [defaultVipDays]);

  useEffect(() => {
    if (defaultValues.premium !== undefined) setPremiumOn(defaultValues.premium === "true");
  }, [defaultValues.premium]);

  useEffect(() => {
    if (defaultValues.vip !== undefined) setVipOn(defaultValues.vip === "true");
  }, [defaultValues.vip]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!action || pending) return;

    const fd = new FormData(e.currentTarget);

    // Client-side media validation
    const urls = String(fd.get("media_urls") ?? "").trim();
    if (!urls) {
      setMediaError("Please add at least one photo before publishing.");
      return;
    }
    setMediaError(null);
    setServerError(null);
    setPending(true);

    try {
      const result = await action(fd);
      if (result && "error" in result) {
        setServerError(result.error);
        setPending(false);
        return;
      }
      // Success — show modal then navigate
      const name = String(fd.get("name") || "").trim() || "Listing";
      setSuccessName(name);
      setTimeout(() => router.push("/admin/active"), 2800);
    } catch {
      setServerError("Something went wrong — please try again.");
      setPending(false);
    }
  };

  return (
    <>
      {/* ── Success modal ──────────────────────────────────────────── */}
      {successName && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-8 flex flex-col items-center text-center gap-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-primary" strokeWidth={1.75} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-foreground">
                {isEdit ? "Changes saved!" : "Listing published!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? `${successName}'s profile has been updated.`
                  : `${successName} is now live on Hook.`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Taking you to Live Profiles…
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/active")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Go to Live Profiles →
            </button>
          </div>
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {advertId && <input type="hidden" name="advert_id" value={advertId} />}
        <input type="hidden" name="is_edit" value={isEdit ? "1" : "0"} />

        <MediaUploader
          defaultUrls={defaultValues.mediaUrls}
          defaultFocalPoints={defaultValues.mediaFocalPoints}
          error={mediaError}
        />

        {/* Server error banner */}
        {serverError && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-destructive">{serverError}</p>
          </div>
        )}

        {/* Name & Age */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1.5">
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Sarah Dlamini"
              defaultValue={defaultValues.name}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="age" className="block text-sm font-semibold text-foreground mb-1.5">
              Age *
            </label>
            <input
              id="age"
              name="age"
              type="number"
              required
              min={18}
              max={99}
              placeholder="e.g. 32"
              defaultValue={defaultValues.age}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* City & suburb */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-1.5">
              City *
            </label>
            <select
              id="location"
              name="location"
              required
              value={city}
              onChange={(e) => {
                const next = e.target.value;
                setCity(next);
                const subs = zimbabweCitySuburbs[next as ZimbabweCity];
                setSuburb(subs[0] ?? "");
              }}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {zimbabweCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="suburb" className="block text-sm font-semibold text-foreground mb-1.5">
              Suburb *
            </label>
            <select
              id="suburb"
              name="suburb"
              required
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {zimbabweCitySuburbs[city as ZimbabweCity].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Gender & body type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-foreground mb-1.5">
              Gender *
            </label>
            <select
              id="gender"
              name="gender"
              required
              defaultValue={defaultValues.gender || "Female"}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {genders.filter((g) => g !== "All").map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bodyType" className="block text-sm font-semibold text-foreground mb-1.5">
              Body type *
            </label>
            <select
              id="bodyType"
              name="bodyType"
              required
              defaultValue={defaultValues.bodyType || "Average"}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {bodyTypes.filter((b) => b !== "All").map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-1.5">
              Phone *
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              placeholder="0712345678 or +263 77 123 4567"
              defaultValue={defaultValues.phone}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-foreground mb-1.5">
              WhatsApp *
            </label>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              required
              placeholder="0712345678 or +263771234567"
              defaultValue={defaultValues.whatsapp}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
            Email <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            defaultValue={defaultValues.email}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-1.5">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            placeholder="Sell the fantasy—services, limits, areas, rates mindset..."
            defaultValue={defaultValues.description}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label htmlFor="expiry" className="block text-sm font-semibold text-foreground mb-1.5">
            Listing duration *
          </label>
          <select
            id="expiry"
            name="expiry"
            required
            value={expiryChoice}
            onChange={(e) => setExpiryChoice(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {isEdit && <option value="keep">Keep current time left</option>}
            <option value="1">1 day</option>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="custom">Custom — I&apos;ll choose</option>
          </select>
          {expiryChoice === "custom" && (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                name="custom_expiry_days"
                min={1}
                max={365}
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                className="w-28 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-sm text-muted-foreground">day(s)</span>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Listing boost</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Turn on Premium, VIP, or both. Premium adds the hero strip and feed priority; VIP adds the gold badge.
              Leave both off for normal placement.
            </p>
          </div>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="premium"
                id="premium"
                checked={premiumOn}
                onChange={(e) => setPremiumOn(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
              />
              <span className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">Premium</span>
                <span className="block text-xs text-muted-foreground">
                  Hero strip + orange metallic badge + sorted first in the feed.
                </span>
                {premiumOn && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="premium_days">
                      Premium for
                    </label>
                    <input
                      id="premium_days"
                      name="premium_days"
                      type="number"
                      min={1}
                      max={maxTierDays}
                      value={premiumDays}
                      onChange={(e) => setPremiumDays(e.target.value)}
                      className="w-24 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">day(s)</span>
                  </div>
                )}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="vip"
                id="vip"
                checked={vipOn}
                onChange={(e) => setVipOn(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-primary"
              />
              <span className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">VIP</span>
                <span className="block text-xs text-muted-foreground">
                  Gold metallic badge on the card (can combine with Premium).
                </span>
                {vipOn && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-xs font-semibold text-muted-foreground" htmlFor="vip_days">
                      VIP for
                    </label>
                    <input
                      id="vip_days"
                      name="vip_days"
                      type="number"
                      min={1}
                      max={maxTierDays}
                      value={vipDays}
                      onChange={(e) => setVipDays(e.target.value)}
                      className="w-24 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">day(s)</span>
                  </div>
                )}
              </span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={!action || pending}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? (isEdit ? "Saving…" : "Publishing…") : submitLabel}
        </button>
      </form>
    </>
  );
}
