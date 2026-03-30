"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ADULT_CONTENT_DISCLAIMER } from "@/lib/adult-disclaimer";

const STORAGE_KEY = "hook_age_verified";

export function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
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
      <div className="absolute inset-0 bg-background/70 backdrop-blur-xl" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-8 flex flex-col items-center text-center gap-6">
        <div className="relative h-[4.5rem] w-[4.5rem] sm:h-20 sm:w-20 shrink-0">
          <Image
            src="/logo.png"
            alt="Hook"
            width={160}
            height={160}
            className="h-full w-full object-contain drop-shadow-sm"
            priority
          />
        </div>

        <div className="space-y-4 w-full">
          <h2
            id="age-gate-title"
            className="text-2xl font-black text-foreground tracking-tight"
          >
            Adults only
          </h2>
          <p className="text-base sm:text-lg text-foreground font-medium leading-snug">
            You are about to view sexually explicit listings and imagery only meant for a mature audience.
          </p>
          <p
            id="age-gate-desc"
            className="text-sm sm:text-base text-foreground font-semibold leading-relaxed text-left rounded-2xl border-2 border-primary/40 bg-primary/10 p-5 shadow-inner"
          >
            {ADULT_CONTENT_DISCLAIMER}
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={confirm}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all"
          >
            I am 18+ and I consent — enter Hook
          </button>
          <button
            type="button"
            onClick={exit}
            className="w-full py-3 rounded-xl bg-muted text-muted-foreground font-semibold text-sm hover:bg-accent hover:text-foreground transition-colors"
          >
            Exit — I am under 18 or do not consent
          </button>
        </div>
      </div>
    </div>
  );
}
