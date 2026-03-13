"use client";

import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";

const STORAGE_KEY = "hook_age_verified";

export function AgeGate() {
  // Start hidden to avoid flash; useEffect reveals if unverified
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage blocked (private mode edge case) — show the gate
      setVisible(true);
    }
  }, []);

  const confirm = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const exit = () => {
    window.location.replace("https://www.google.com");
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      aria-describedby="age-gate-desc"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
    >
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-card border border-border shadow-2xl p-8 flex flex-col items-center text-center gap-6">
        {/* Icon */}
        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-8 w-8 text-primary" strokeWidth={1.75} />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h2
            id="age-gate-title"
            className="text-2xl font-black text-foreground tracking-tight"
          >
            Adults only
          </h2>
          <p id="age-gate-desc" className="text-sm text-muted-foreground leading-relaxed">
            Hook is an adult platform. You must be{" "}
            <span className="font-semibold text-foreground">18 years or older</span> to
            enter. By continuing you confirm you meet this requirement and agree to our
            terms of use.
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            I&apos;m 18 or older — enter
          </button>
          <button
            type="button"
            onClick={exit}
            className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-semibold text-sm hover:bg-accent hover:text-foreground transition-colors"
          >
            I&apos;m under 18 — exit
          </button>
        </div>
      </div>
    </div>
  );
}
