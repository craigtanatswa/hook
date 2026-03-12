"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";

type AdvertFormProps = {
  defaultValues?: {
    name?: string;
    age?: string;
    location?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    description?: string;
    expiry?: string;
    featured?: string;
  };
  onSubmit?: (data: Record<string, string>) => void;
  submitLabel?: string;
};

export function AdvertForm({ defaultValues = {}, onSubmit, submitLabel = "Post Advert" }: AdvertFormProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removePreview = (i: number) => {
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      data[key] = value as string;
    });
    if (onSubmit) {
      onSubmit(data);
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";
  const inputClass =
    "w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Photo upload */}
      <div>
        <label className={labelClass}>Photos</label>
        <label
          htmlFor="photo-upload"
          className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-2xl py-8 px-4 cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors"
        >
          <Upload className="h-7 w-7 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Click to upload photos</span>
          <span className="text-xs text-muted-foreground/70">JPG, PNG, WEBP — max 5 photos</span>
          <input
            id="photo-upload"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={handleFiles}
          />
        </label>

        {previews.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Name & Age */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>Full Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="e.g. Sarah Dlamini"
            defaultValue={defaultValues.name}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="age" className={labelClass}>Age *</label>
          <input
            id="age"
            name="age"
            type="number"
            required
            min={18}
            max={99}
            placeholder="e.g. 32"
            defaultValue={defaultValues.age}
            className={inputClass}
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className={labelClass}>Location *</label>
        <input
          id="location"
          name="location"
          type="text"
          required
          placeholder="e.g. Sandton, Johannesburg"
          defaultValue={defaultValues.location}
          className={inputClass}
        />
      </div>

      {/* Phone & WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="+27 82 123 4567"
            defaultValue={defaultValues.phone}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelClass}>WhatsApp Number *</label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            placeholder="27821234567"
            defaultValue={defaultValues.whatsapp}
            className={inputClass}
          />
        </div>
      </div>

      {/* Email (optional) */}
      <div>
        <label htmlFor="email" className={labelClass}>
          Email <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          defaultValue={defaultValues.email}
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Description *</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="Describe the service you offer, your experience, availability, and area covered..."
          defaultValue={defaultValues.description}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Expiry */}
      <div>
        <label htmlFor="expiry" className={labelClass}>Advert Duration *</label>
        <select
          id="expiry"
          name="expiry"
          required
          defaultValue={defaultValues.expiry || "30"}
          className={inputClass}
        >
          <option value="1">1 day</option>
          <option value="7">7 days</option>
          <option value="30">30 days</option>
        </select>
      </div>

      {/* Featured toggle */}
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
            Feature this advert
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Featured adverts are pinned to the top of the listing and marked with a badge.
          </p>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 active:scale-95 transition-all"
      >
        {submitted ? "Advert Posted!" : submitLabel}
      </button>
    </form>
  );
}
