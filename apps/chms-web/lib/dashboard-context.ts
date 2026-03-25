import { redirect } from "next/navigation";
import { getSupabaseConfigSnapshot, getTenantAccessContext } from "@pulse/supabase";
import { createClient } from "./supabase/server";

export async function getRequiredDashboardContext(preferredTenantSlug?: string | null) {
  const config = getSupabaseConfigSnapshot();

  if (!config.hasUrl || !config.hasPublicKey) {
    return {
      config,
      supabase: null,
      access: null
    };
  }

  const supabase = await createClient();
  const access = await getTenantAccessContext(supabase, preferredTenantSlug ?? null);

  if (!access.user) {
    redirect("/?redirectedFrom=/dashboard");
  }

  return {
    config,
    supabase,
    access
  };
}
