"use client";

import { useState, useTransition } from "react";
import { toggleMaintenanceAction } from "@/app/actions/site-settings";
import { Power } from "lucide-react";

interface Props {
  maintenanceMode: boolean;
}

export function SettingsClient({ maintenanceMode }: Props) {
  const [maintenance, setMaintenance] = useState(maintenanceMode);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [confirmingDeactivate, setConfirmingDeactivate] = useState(false);

  const handleMaintenanceToggle = (enable: boolean) => {
    if (enable && !confirmingDeactivate) {
      setConfirmingDeactivate(true);
      return;
    }
    setConfirmingDeactivate(false);

    const fd = new FormData();
    fd.set("maintenance", enable ? "1" : "0");

    startTransition(async () => {
      await toggleMaintenanceAction(fd);
      setMaintenance(enable);
    });
  };

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
        <p className="text-sm text-muted-foreground mt-1">
          Tune Hook before the escorts melt the servers
        </p>
      </div>

      {/* Maintenance mode card */}
      <div
        className={`mb-6 rounded-2xl border-2 p-5 space-y-3 transition-colors ${
          maintenance
            ? "border-destructive bg-destructive/5"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
              maintenance ? "bg-destructive/10" : "bg-muted"
            }`}
          >
            <Power
              className={`h-5 w-5 ${
                maintenance ? "text-destructive" : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-foreground">
              Site Status
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {maintenance
                ? "Hook is currently offline. Only admins can access the site."
                : "Hook is live and accessible to the public."}
            </p>
          </div>
          <div className="shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                maintenance
                  ? "bg-destructive/10 text-destructive"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  maintenance ? "bg-destructive" : "bg-emerald-500"
                }`}
              />
              {maintenance ? "Offline" : "Live"}
            </span>
          </div>
        </div>

        {confirmingDeactivate ? (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-destructive">
              Take Hook offline?
            </p>
            <p className="text-xs text-destructive/80">
              All public pages will be unreachable until you turn the site back
              on. Admin pages remain accessible.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMaintenanceToggle(true)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isPending ? "Deactivating..." : "Yes, take offline"}
              </button>
              <button
                onClick={() => setConfirmingDeactivate(false)}
                className="px-4 py-2 rounded-lg bg-background border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : maintenance ? (
          <button
            onClick={() => handleMaintenanceToggle(false)}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {isPending ? "Activating..." : "Bring Hook back online"}
          </button>
        ) : (
          <button
            onClick={() => handleMaintenanceToggle(true)}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-bold text-sm hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            Take Hook offline
          </button>
        )}
      </div>

      {/* General settings form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">
            Platform Settings
          </h2>
          <div>
            <label htmlFor="site-name" className={labelClass}>
              Platform Name
            </label>
            <input
              id="site-name"
              type="text"
              defaultValue="Hook"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contact-email" className={labelClass}>
              Admin Contact Email
            </label>
            <input
              id="contact-email"
              type="email"
              defaultValue="admin@hook.co.za"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="default-expiry" className={labelClass}>
              Default listing expiry
            </label>
            <select
              id="default-expiry"
              defaultValue="30"
              className={inputClass}
            >
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
              <p className="text-sm font-semibold text-foreground">
                Require approval before publishing
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                New listings hit review first—keep the feed safe and thirsty in
                the right way
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="sr-only peer"
              />
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
