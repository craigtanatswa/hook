"use client";

import { useState } from "react";
import { ShieldCheck, Shield, Trash2, UserPlus, Crown } from "lucide-react";
import {
  createAdminUserAction,
  updateAdminRoleAction,
  deleteAdminUserAction,
} from "@/app/actions/admin-users";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  is_bootstrap: boolean;
  created_at: string;
}

interface Props {
  admins: AdminUser[];
  currentUserEmail: string;
}

export function ManageAdminsClient({ admins: initial, currentUserEmail }: Props) {
  const [admins, setAdmins] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError(null);
    setAddLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createAdminUserAction(formData);
    setAddLoading(false);
    if (result && "error" in result) {
      setAddError(result.error);
    } else {
      setShowAdd(false);
      window.location.reload();
    }
  }

  async function handleRoleChange(adminId: string, newRole: string) {
    setActionError(null);
    const fd = new FormData();
    fd.set("role", newRole);
    const result = await updateAdminRoleAction(adminId, fd);
    if (result && "error" in result) {
      setActionError(result.error);
    } else {
      setAdmins((prev) =>
        prev.map((a) => (a.id === adminId ? { ...a, role: newRole } : a))
      );
    }
  }

  async function handleDelete(adminId: string) {
    if (!confirm("Remove this admin? They will lose all access.")) return;
    setActionError(null);
    const result = await deleteAdminUserAction(adminId);
    if (result && "error" in result) {
      setActionError(result.error);
    } else {
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Manage admins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {admins.length} admin{admins.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <UserPlus className="h-4 w-4" />
          Add admin
        </button>
      </div>

      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Add admin form */}
      {showAdd && (
        <div className="mb-6 p-5 bg-card rounded-2xl border border-border shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">New admin account</h2>
          {addError && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm">
              {addError}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Role
              </label>
              <select
                name="role"
                defaultValue="admin"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={addLoading}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {addLoading && (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                )}
                Create account
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddError(null); }}
                className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-accent hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin list */}
      <div className="space-y-3">
        {admins.map((admin) => {
          const isMe = admin.email === currentUserEmail;
          const isBootstrap = admin.is_bootstrap;

          return (
            <div
              key={admin.id}
              className="bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                  {admin.role === "super_admin" ? (
                    <Crown className="h-4 w-4 text-primary" />
                  ) : (
                    <Shield className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {admin.email}
                    </span>
                    {isMe && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        You
                      </span>
                    )}
                    {isBootstrap && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Bootstrap
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Joined{" "}
                    {new Date(admin.created_at).toLocaleDateString("en-ZA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={admin.role}
                  disabled={isBootstrap}
                  onChange={(e) => handleRoleChange(admin.id, e.target.value)}
                  className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super admin</option>
                </select>

                <button
                  onClick={() => handleDelete(admin.id)}
                  disabled={isBootstrap || isMe}
                  title={
                    isBootstrap
                      ? "Cannot delete the bootstrap admin"
                      : isMe
                      ? "Cannot delete yourself"
                      : "Remove admin"
                  }
                  className="p-1.5 rounded-xl text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
