"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";

function buildSettingsRedirect(message: string, kind: "error" | "message" = "error") {
  return `/dashboard/settings?${kind}=${encodeURIComponent(message)}`;
}

export async function updateProfileSettings(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const avatarUrl = String(formData.get("avatar_url") ?? "").trim();

  const context = await getRequiredDashboardContext(tenant || null);

  if (!context.supabase || !context.access?.user) {
    redirect(buildSettingsRedirect("No active user was found for this request."));
  }

  const updateResult = await context.supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      avatar_url: avatarUrl || null
    } as never)
    .eq("id", context.access.user.id);

  if (updateResult.error) {
    redirect(buildSettingsRedirect(updateResult.error.message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect(buildSettingsRedirect("Profile settings updated.", "message"));
}

export async function updateWorkspaceSettings(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const tenantName = String(formData.get("tenant_name") ?? "").trim();
  const tenantSlug = String(formData.get("tenant_slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!tenant || !tenantName || !tenantSlug) {
    redirect(buildSettingsRedirect("Workspace name and slug are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildSettingsRedirect("No active tenant was found for this request."));
  }

  const canManageTenant = await (context.supabase.rpc as any)("has_tenant_permission", {
    target_tenant_id: context.access.activeMembership.tenant.id,
    target_permission_code: "tenant.manage"
  });

  if (canManageTenant.error || !canManageTenant.data) {
    redirect(buildSettingsRedirect("You do not have permission to manage workspace settings."));
  }

  const updateResult = await context.supabase
    .from("tenants")
    .update({
      name: tenantName,
      slug: tenantSlug
    } as never)
    .eq("id", context.access.activeMembership.tenant.id);

  if (updateResult.error) {
    redirect(buildSettingsRedirect(updateResult.error.message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect(buildSettingsRedirect("Workspace settings updated.", "message"));
}
