"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  CheckCircle2,
  Clock,
  Settings,
  X,
  Menu,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const baseNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/create", label: "New listing", icon: PlusCircle },
  { href: "/admin/active", label: "Live profiles", icon: CheckCircle2 },
  { href: "/admin/expired", label: "Expired listings", icon: Clock },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

interface Props {
  userEmail: string;
  role: string | null;
}

export function AdminSidebar({ userEmail, role }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const navItems =
    role === "super_admin"
      ? [
          ...baseNavItems,
          { href: "/admin/manage-admins", label: "Manage admins", icon: ShieldCheck },
        ]
      : baseNavItems;

  const SidebarContent = () => (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-2xl font-black text-primary tracking-tight">Hook</span>
          <span className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-widest">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <ul className="flex-1 py-4 px-3 space-y-1" role="list">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border space-y-3">
        {/* User info */}
        <div className="px-1">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{userEmail}</p>
          {role && (
            <p className="text-xs text-sidebar-foreground/50 capitalize mt-0.5">
              {role.replace("_", " ")}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <form action={logoutAction} className="flex-1">
            <button
              type="submit"
              className="w-full inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>

          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
            className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar flex items-center justify-between px-4 h-14 border-b border-sidebar-border">
        <Link href="/" className="text-xl font-black text-primary tracking-tight">
          Hook
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="text-sidebar-foreground p-1"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-sidebar transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-sidebar min-h-screen sticky top-0">
        <SidebarContent />
      </aside>
    </>
  );
}
