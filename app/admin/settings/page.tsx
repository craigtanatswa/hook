"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const labelClass = "block text-sm font-semibold text-foreground mb-1.5";
  const inputClass =
    "w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow";

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your Hook platform settings</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">Platform Settings</h2>
          <div>
            <label htmlFor="site-name" className={labelClass}>Platform Name</label>
            <input id="site-name" type="text" defaultValue="Hook" className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass}>Admin Contact Email</label>
            <input id="contact-email" type="email" defaultValue="admin@hook.co.za" className={inputClass} />
          </div>
          <div>
            <label htmlFor="default-expiry" className={labelClass}>Default Advert Expiry</label>
            <select id="default-expiry" defaultValue="30" className={inputClass}>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">Moderation</h2>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Require approval before publishing</p>
              <p className="text-xs text-muted-foreground mt-0.5">New adverts go into a review queue before going live</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 active:scale-95 transition-all"
        >
          {saved ? "Settings Saved!" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
