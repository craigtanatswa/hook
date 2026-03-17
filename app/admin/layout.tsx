import { AdminSidebar } from "@/components/admin-sidebar";
import { createSessionClient, createServiceClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  let role: string | null = null;

  try {
    const supabase = await createSessionClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      userEmail = user.email;
      const service = createServiceClient();
      const { data } = await service
        .from("admin_users")
        .select("role")
        .eq("email", user.email)
        .single();
      role = data?.role ?? null;
    }
  } catch {
    // Not authenticated — middleware handles redirect
  }

  if (!userEmail) {
    return <div>{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar userEmail={userEmail} role={role} />
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
    </div>
  );
}
