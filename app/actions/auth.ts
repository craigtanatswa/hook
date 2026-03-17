"use server";

import { redirect } from "next/navigation";
import { createSessionClient, createServiceClient } from "@/lib/supabase/server";

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | never> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const service = createServiceClient();
  const { data: adminUser, error: dbError } = await service
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .single();

  if (dbError || !adminUser) {
    return { error: "You don't have admin access." };
  }

  const supabase = await createSessionClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}

export async function logoutAction() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
