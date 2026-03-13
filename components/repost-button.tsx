"use client";

import { useState } from "react";
import { RefreshCw, ChevronDown } from "lucide-react";
import { repostAdvertAction } from "@/app/actions/adverts";

type RepostButtonProps = {
  advertId: string;
  advertName: string;
};

const DURATION_OPTIONS = [
  { value: "1", label: "1 day" },
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
];

export function RepostButton({ advertId, advertName }: RepostButtonProps) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState("30");
  const [pending, setPending] = useState(false);

  const boundAction = repostAdvertAction.bind(null, advertId);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Repost
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 flex flex-col gap-3 w-full">
      <p className="text-xs font-semibold text-foreground">
        How long should <span className="text-primary">{advertName}</span> stay live?
      </p>

      <div className="relative">
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8"
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <form
        action={async (formData) => {
          setPending(true);
          formData.set("days", days);
          await boundAction(formData);
        }}
        className="flex gap-2"
      >
        <button
          type="submit"
          disabled={pending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
          {pending ? "Making live…" : "Make it live →"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
