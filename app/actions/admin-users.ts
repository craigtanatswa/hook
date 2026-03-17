"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient, createSessionClient } from "@/lib/supabase/server";

async function requireSuperAdmin() {
  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const service = createServiceClient();
  const { data } = await service
    .from("admin_users")
    .select("role")
    .eq("email", user.email!)
    .single();

  if (!data || data.role !== "super_admin") {
    return { error: "Super admin access required." };
  }

  return { user };
}

export async function createAdminUserAction(formData: FormData) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard;

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "admin");

  if (!email || !password) return { error: "Email and password are required." };

  const service = createServiceClient();

  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return { error: authError.message };

  const { error: dbError } = await service.from("admin_users").insert({
    id: authData.user.id,
    email,
    role,
    is_bootstrap: false,
  });

  if (dbError) {
    await service.auth.admin.deleteUser(authData.user.id);
    return { error: dbError.message };
  }

  revalidatePath("/admin/manage-admins");
  return { ok: true };
}

export async function updateAdminRoleAction(adminId: string, formData: FormData) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard;

  const role = String(formData.get("role") || "admin");
  const service = createServiceClient();

  const { data: target } = await service
    .from("admin_users")
    .select("is_bootstrap")
    .eq("id", adminId)
    .single();

  if (target?.is_bootstrap) return { error: "Cannot modify the bootstrap admin." };

  const { error } = await service
    .from("admin_users")
    .update({ role })
    .eq("id", adminId);

  if (error) return { error: error.message };

  revalidatePath("/admin/manage-admins");
  return { ok: true };
}

export async function deleteAdminUserAction(adminId: string) {
  const guard = await requireSuperAdmin();
  if ("error" in guard) return guard;

  const service = createServiceClient();

  const { data: target } = await service
    .from("admin_users")
    .select("is_bootstrap")
    .eq("id", adminId)
    .single();

  if (target?.is_bootstrap) return { error: "Cannot delete the bootstrap admin." };

  const { error: dbError } = await service
    .from("admin_users")
    .delete()
    .eq("id", adminId);

  if (dbError) return { error: dbError.message };

  await service.auth.admin.deleteUser(adminId);

  revalidatePath("/admin/manage-admins");
  return { ok: true };
}
