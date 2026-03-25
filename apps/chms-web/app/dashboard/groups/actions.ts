"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";

function buildGroupsRedirect(message: string, kind: "error" | "message" = "error") {
  return `/dashboard/groups?${kind}=${encodeURIComponent(message)}`;
}

export async function createGroup(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const groupType = String(formData.get("group_type") ?? "").trim();
  const leaderPersonId = String(formData.get("leader_person_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!tenant || !name) {
    redirect(buildGroupsRedirect("Tenant and group name are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildGroupsRedirect("No active tenant was found for this request."));
  }

  const insertResult = await context.supabase.from("groups").insert({
    tenant_id: context.access.activeMembership.tenant.id,
    name,
    group_type: groupType || "group",
    leader_person_id: leaderPersonId || null,
    status: status === "archived" ? "archived" : "active"
  } as never);

  if (insertResult.error) {
    redirect(buildGroupsRedirect(insertResult.error.message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/groups");
  redirect(buildGroupsRedirect(`${name} created.`, "message"));
}

function buildGroupRedirect(groupId: string, message?: string, kind: "error" | "message" = "error", tab?: string) {
  const params = new URLSearchParams();

  if (tab) {
    params.set("tab", tab);
  }

  if (message) {
    params.set(kind, message);
  }

  const query = params.toString();
  return query ? `/dashboard/groups/${groupId}?${query}` : `/dashboard/groups/${groupId}`;
}

export async function addGroupMember(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const groupId = String(formData.get("group_id") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const memberRole = String(formData.get("member_role") ?? "").trim();
  const joinedAt = String(formData.get("joined_at") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !groupId || !personId) {
    redirect(buildGroupsRedirect("Tenant, group, and person are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildGroupsRedirect("No active tenant was found for this request."));
  }

  const insertResult = await context.supabase.from("group_members").insert({
    tenant_id: context.access.activeMembership.tenant.id,
    group_id: groupId,
    person_id: personId,
    member_role: memberRole || null,
    joined_at: joinedAt || null
  } as never);

  if (insertResult.error) {
    redirect(buildGroupRedirect(groupId, insertResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/groups");
  revalidatePath(`/dashboard/groups/${groupId}`);
  redirect(buildGroupRedirect(groupId, undefined, "error", returnTab));
}

export async function updateGroup(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const groupId = String(formData.get("group_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const groupType = String(formData.get("group_type") ?? "").trim();
  const leaderPersonId = String(formData.get("leader_person_id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !groupId || !name) {
    redirect(buildGroupsRedirect("Tenant, group, and name are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildGroupsRedirect("No active tenant was found for this request."));
  }

  const updateResult = await context.supabase
    .from("groups")
    .update({
      name,
      group_type: groupType || "group",
      leader_person_id: leaderPersonId || null,
      status: status === "archived" ? "archived" : "active"
    } as never)
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", groupId);

  if (updateResult.error) {
    redirect(buildGroupRedirect(groupId, updateResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/groups");
  revalidatePath(`/dashboard/groups/${groupId}`);
  redirect(buildGroupRedirect(groupId, "Group updated.", "message", returnTab));
}

export async function recordGroupAttendance(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const groupId = String(formData.get("group_id") ?? "").trim();
  const eventName = String(formData.get("event_name") ?? "").trim();
  const occurredOn = String(formData.get("occurred_on") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();
  const personIds = formData.getAll("person_ids").map((value) => String(value));

  if (!tenant || !groupId || !eventName || !occurredOn) {
    redirect(buildGroupsRedirect("Tenant, group, event name, and date are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildGroupsRedirect("No active tenant was found for this request."));
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const eventResult = await context.supabase
    .from("attendance_events")
    .insert({
      tenant_id: tenantId,
      group_id: groupId,
      name: eventName,
      occurred_at: new Date(`${occurredOn}T12:00:00`).toISOString()
    } as never)
    .select("id")
    .single();

  const createdEvent = (eventResult.data ?? null) as { id: string } | null;

  if (eventResult.error || !createdEvent) {
    redirect(buildGroupRedirect(groupId, eventResult.error?.message ?? "Unable to record attendance.", "error", returnTab));
  }

  const attendanceEntries = personIds.map((personId) => ({
    tenant_id: tenantId,
    event_id: createdEvent.id,
    person_id: personId,
    status: String(formData.get(`status:${personId}`) ?? "present"),
    notes: null
  }));

  if (attendanceEntries.length > 0) {
    const entryResult = await context.supabase.from("attendance_entries").insert(attendanceEntries as never);

    if (entryResult.error) {
      redirect(buildGroupRedirect(groupId, entryResult.error.message, "error", returnTab));
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/groups");
  revalidatePath(`/dashboard/groups/${groupId}`);
  redirect(buildGroupRedirect(groupId, "Attendance recorded.", "message", returnTab));
}
