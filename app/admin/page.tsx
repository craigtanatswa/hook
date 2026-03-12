import Link from "next/link";
import { adverts, getActiveAdverts, getExpiredAdverts } from "@/lib/data";
import { CheckCircle2, Clock, LayoutGrid, PlusCircle, ArrowRight } from "lucide-react";

export default function AdminDashboard() {
  const active = getActiveAdverts();
  const expired = getExpiredAdverts();
  const total = adverts.length;

  const stats = [
    {
      label: "Total Adverts",
      value: total,
      icon: LayoutGrid,
      color: "text-foreground",
      bg: "bg-card",
    },
    {
      label: "Active Adverts",
      value: active.length,
      icon: CheckCircle2,
      color: "text-primary",
      bg: "bg-primary/5",
    },
    {
      label: "Expired Adverts",
      value: expired.length,
      icon: Clock,
      color: "text-muted-foreground",
      bg: "bg-muted",
    },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of all adverts on Hook</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border border-border p-5 ${bg}`}>
            <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl mb-3 ${bg === "bg-card" ? "bg-muted" : bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-3xl font-black text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/create"
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="flex items-center gap-2.5">
              <PlusCircle className="h-5 w-5" />
              Create New Advert
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/admin/expired"
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Manage Expired
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Recent active adverts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Recent Active Adverts</h2>
          <Link href="/admin/active" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
          {active.slice(0, 5).map((advert) => (
            <div key={advert.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{advert.name}</p>
                <p className="text-xs text-muted-foreground truncate">{advert.location} · {advert.category}</p>
              </div>
              <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                Active
              </span>
            </div>
          ))}
          {active.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No active adverts yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
