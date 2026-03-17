import { redirect } from "next/navigation";
import { createSessionClient, createServiceClient } from "@/lib/supabase/server";
import { ManageAdminsClient } from "./client";

export default async function ManageAdminsPage() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const service = createServiceClient();

  const { data: currentAdmin } = await service
    .from("admin_users")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (currentAdmin?.role !== "super_admin") redirect("/admin");

  const { data: admins } = await service
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <ManageAdminsClient
      admins={admins ?? []}
      currentUserEmail={user.email!}
    />
  );
}
