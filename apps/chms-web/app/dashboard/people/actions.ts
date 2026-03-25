"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";

function buildPeopleRedirect(message: string, kind: "error" | "message" = "error") {
  return `/dashboard/people?${kind}=${encodeURIComponent(message)}`;
}

function buildPersonRedirect(
  personId: string,
  message?: string,
  kind: "error" | "message" = "error",
  tab?: string
) {
  const params = new URLSearchParams();

  if (tab) {
    params.set("tab", tab);
  }

  if (message) {
    params.set(kind, message);
  }

  const query = params.toString();
  return query ? `/dashboard/people/${personId}?${query}` : `/dashboard/people/${personId}`;
}

export async function createPerson(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const preferredName = String(formData.get("preferred_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!tenant || !firstName || !lastName) {
    redirect(buildPeopleRedirect("First name, last name, and tenant are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const insertResult = await context.supabase.from("people").insert({
    tenant_id: context.access.activeMembership.tenant.id,
    first_name: firstName,
    last_name: lastName,
    preferred_name: preferredName || null,
    email: email || null,
    phone: phone || null
  } as never);

  if (insertResult.error) {
    redirect(buildPeopleRedirect(insertResult.error.message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  redirect(buildPeopleRedirect(`${firstName} ${lastName} added.`, "message"));
}

export async function updatePerson(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const preferredName = String(formData.get("preferred_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!tenant || !personId || !firstName || !lastName) {
    redirect(buildPeopleRedirect("First name, last name, tenant, and person are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const updateResult = await context.supabase
    .from("people")
    .update({
      first_name: firstName,
      last_name: lastName,
      preferred_name: preferredName || null,
      email: email || null,
      phone: phone || null,
      birth_date: birthDate || null,
      is_active: isActive
    } as never)
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", personId);

  if (updateResult.error) {
    redirect(buildPersonRedirect(personId, updateResult.error.message));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${personId}`);
  redirect(buildPersonRedirect(personId));
}

export async function createFamilyForPerson(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const householdName = String(formData.get("household_name") ?? "").trim();
  const relationship = String(formData.get("relationship_to_family") ?? "").trim();
  const isPrimaryContact = formData.get("is_primary_contact") === "on";
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !personId || !householdName) {
    redirect(buildPeopleRedirect("Tenant, person, and household name are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const existingMembershipResult = await context.supabase
    .from("family_members")
    .select("family_id")
    .eq("tenant_id", tenantId)
    .eq("person_id", personId)
    .maybeSingle();

  if (existingMembershipResult.error) {
    redirect(buildPersonRedirect(personId, existingMembershipResult.error.message, "error", returnTab));
  }

  if (existingMembershipResult.data) {
    redirect(buildPersonRedirect(personId, "This person is already part of a family.", "error", returnTab));
  }

  const familyInsertResult = await context.supabase
    .from("families")
    .insert({
      tenant_id: tenantId,
      household_name: householdName
    } as never)
    .select("id")
    .single();

  const createdFamily = (familyInsertResult.data ?? null) as { id: string } | null;

  if (familyInsertResult.error || !createdFamily) {
    redirect(
      buildPersonRedirect(personId, familyInsertResult.error?.message ?? "Unable to create family.", "error", returnTab)
    );
  }

  const familyId = createdFamily.id;

  const familyMemberInsertResult = await context.supabase.from("family_members").insert({
    tenant_id: tenantId,
    family_id: familyId,
    person_id: personId,
    relationship_to_family: relationship || null,
    is_primary_contact: isPrimaryContact
  } as never);

  if (familyMemberInsertResult.error) {
    redirect(buildPersonRedirect(personId, familyMemberInsertResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${personId}`);
  redirect(buildPersonRedirect(personId, undefined, "error", returnTab));
}

export async function addPersonToFamily(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const familyId = String(formData.get("family_id") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const profilePersonId = String(formData.get("profile_person_id") ?? "").trim() || personId;
  const relationship = String(formData.get("relationship_to_family") ?? "").trim();
  const isPrimaryContact = formData.get("is_primary_contact") === "on";
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !familyId || !personId) {
    redirect(buildPeopleRedirect("Tenant, family, and person are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const existingMembershipResult = await context.supabase
    .from("family_members")
    .select("family_id")
    .eq("tenant_id", tenantId)
    .eq("person_id", personId)
    .maybeSingle();

  if (existingMembershipResult.error) {
    redirect(buildPersonRedirect(profilePersonId, existingMembershipResult.error.message, "error", returnTab));
  }

  if (existingMembershipResult.data) {
    redirect(buildPersonRedirect(profilePersonId, "That person is already assigned to a family.", "error", returnTab));
  }

  const insertResult = await context.supabase.from("family_members").insert({
    tenant_id: tenantId,
    family_id: familyId,
    person_id: personId,
    relationship_to_family: relationship || null,
    is_primary_contact: isPrimaryContact
  } as never);

  if (insertResult.error) {
    redirect(buildPersonRedirect(profilePersonId, insertResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${profilePersonId}`);
  redirect(buildPersonRedirect(profilePersonId, undefined, "error", returnTab));
}

export async function dissolveFamily(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const familyId = String(formData.get("family_id") ?? "").trim();
  const profilePersonId = String(formData.get("profile_person_id") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !familyId || !profilePersonId) {
    redirect(buildPeopleRedirect("Tenant, family, and person are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const deleteResult = await context.supabase
    .from("families")
    .delete()
    .eq("tenant_id", tenantId)
    .eq("id", familyId);

  if (deleteResult.error) {
    redirect(buildPersonRedirect(profilePersonId, deleteResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${profilePersonId}`);
  redirect(buildPersonRedirect(profilePersonId, undefined, "error", returnTab));
}

export async function savePersonAccountAccess(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleId = String(formData.get("role_id") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !personId || !email || !roleId) {
    redirect(buildPeopleRedirect("Tenant, person, email, and role are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const personUpdateResult = await context.supabase
    .from("people")
    .update({
      email
    } as never)
    .eq("tenant_id", tenantId)
    .eq("id", personId);

  if (personUpdateResult.error) {
    redirect(buildPersonRedirect(personId, personUpdateResult.error.message, "error", returnTab));
  }

  const inviteResult = await (context.supabase.rpc as any)("upsert_person_tenant_account_invitation", {
    target_email: email,
    target_person_id: personId,
    target_role_id: roleId,
    target_tenant_id: tenantId
  });

  if (inviteResult.error) {
    redirect(buildPersonRedirect(personId, inviteResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${personId}`);
  redirect(buildPersonRedirect(personId, "Account access updated.", "message", returnTab));
}

export async function createPersonNote(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const personId = String(formData.get("person_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const returnTab = String(formData.get("return_tab") ?? "").trim();

  if (!tenant || !personId || !body) {
    redirect(buildPeopleRedirect("Tenant, person, and note body are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildPeopleRedirect("No active tenant was found for this request."));
  }

  const insertResult = await context.supabase.from("person_notes").insert({
    tenant_id: context.access.activeMembership.tenant.id,
    person_id: personId,
    author_membership_id: context.access.activeMembership.id,
    title: title || null,
    body
  } as never);

  if (insertResult.error) {
    redirect(buildPersonRedirect(personId, insertResult.error.message, "error", returnTab));
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/people");
  revalidatePath(`/dashboard/people/${personId}`);
  redirect(buildPersonRedirect(personId, "Note added.", "message", returnTab));
}
