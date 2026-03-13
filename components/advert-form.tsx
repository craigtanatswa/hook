"use client";

import { useState } from "react";
import { genders, bodyTypes, categories } from "@/lib/data";
import { MediaUploader } from "@/components/media-uploader";

type AdvertFormProps = {
  advertId?: string;
  defaultValues?: {
    name?: string;
    age?: string;
    location?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    description?: string;
    gender?: string;
    bodyType?: string;
    category?: string;
    expiry?: string;
    featured?: string;
    mediaUrls?: string;
  };
  /** Server Action for create or update */
  action?: (formData: FormData) => void | Promise<void>;
  submitLabel?: string;
};

export function AdvertForm({
  advertId,
  defaultValues = {},
  action,
  submitLabel = "Publish listing",
}: AdvertFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  return (
    <form
      action={
        action
          ? async (formData) => {
              await action(formData);
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 3000);
            }
          : undefined
      }
      onSubmit={(e) => {
        if (!action) {
          e.preventDefault();
          return;
        }
        const fd = new FormData(e.currentTarget);
        const urls = String(fd.get("media_urls") ?? "").trim();
        if (!urls) {
          e.preventDefault();
          setMediaError("Please add at least one photo before publishing.");
          return;
        }
        setMediaError(null);
      }}
      className="space-y-6"
    >
      {advertId && <input type="hidden" name="advert_id" value={advertId} />}

      <MediaUploader defaultUrls={defaultValues.mediaUrls} error={mediaError} />

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

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-semibold text-foreground mb-1.5">
          Location *
        </label>
        <input
          id="location"
          name="location"
          type="text"
          required
          placeholder="e.g. Sandton, Johannesburg"
          defaultValue={defaultValues.location}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-1.5">
          Vibe / category *
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue={defaultValues.category || "Soft & slow"}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {categories.filter((c) => c !== "All").map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
            placeholder="+27 82 123 4567"
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
            placeholder="27821234567"
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
          placeholder="Sell the vibe—boundaries, areas, availability..."
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
          defaultValue={defaultValues.expiry || "30"}
          className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="1">1 day</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
        </select>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-accent/30 p-4">
        <input
          id="featured"
          name="featured"
          type="checkbox"
          defaultChecked={defaultValues.featured === "true"}
          className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer"
        />
        <div>
          <label htmlFor="featured" className="text-sm font-semibold text-foreground cursor-pointer">
            Feature this listing
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Featured profiles hit the hero strip first.
          </p>
        </div>
      </div>

      <button
        type={action ? "submit" : "button"}
        disabled={!action}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitted ? "Saved." : submitLabel}
      </button>
    </form>
  );
}
