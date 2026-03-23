"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ChevronDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState("30");
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const boundAction = useMemo(() => repostAdvertAction.bind(null, advertId), [advertId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setPending(true);
    const fd = new FormData();
    fd.set("days", days);
    try {
      const result = await boundAction(fd);
      if (result && "error" in result) {
        setFeedback({ ok: false, message: result.error });
        setPending(false);
        return;
      }
      setFeedback({
        ok: true,
        message: "Reposted successfully — it will appear at the top of the feed.",
      });
      setPending(false);
      window.setTimeout(() => router.push("/admin/active"), 2000);
    } catch {
      setFeedback({ ok: false, message: "Repost failed. Please try again." });
      setPending(false);
    }
  };

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
    <div
      className={`rounded-xl border border-primary/30 bg-primary/5 p-3 flex flex-col gap-3 w-full ${pending ? "opacity-90" : ""}`}
    >
      <p className="text-xs font-semibold text-foreground">
        How long should <span className="text-primary">{advertName}</span> stay live?
      </p>

      <div className="relative">
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          disabled={pending}
          className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-8 disabled:opacity-60"
        >
          {DURATION_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            aria-busy={pending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity min-h-[2.5rem]"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                Reposting…
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Make it live
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!pending) {
                setOpen(false);
                setFeedback(null);
              }
            }}
            disabled={pending}
            className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-accent hover:text-foreground transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {feedback && (
          <p
            role="status"
            className={`flex items-start gap-2 text-xs font-medium rounded-lg px-2.5 py-2 ${
              feedback.ok
                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            )}
            <span>{feedback.message}</span>
          </p>
        )}
      </form>
    </div>
  );
}
