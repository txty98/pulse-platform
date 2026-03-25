import type { createClient } from "./supabase/server";

export interface DashboardMetric {
  label: string;
  value: number | null;
}

export interface DashboardSnapshot {
  metrics: DashboardMetric[];
  warning: string | null;
}

export async function getDashboardSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tenantId: string
): Promise<DashboardSnapshot> {
  const [peopleResult, familiesResult, groupsResult, attendanceResult] = await Promise.all([
    supabase.from("people").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("families").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("groups").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase
      .from("attendance_events")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
  ]);

  const warning =
    peopleResult.error?.message ??
    familiesResult.error?.message ??
    groupsResult.error?.message ??
    attendanceResult.error?.message ??
    null;

  return {
    warning,
    metrics: [
      { label: "People", value: peopleResult.count ?? null },
      { label: "Families", value: familiesResult.count ?? null },
      { label: "Groups", value: groupsResult.count ?? null },
      { label: "Attendance Events", value: attendanceResult.count ?? null }
    ]
  };
}
