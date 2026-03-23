import { Power } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="mx-auto h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Power className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Hook is offline</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We&apos;re performing some maintenance. Sit tight — the heat will be back shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
