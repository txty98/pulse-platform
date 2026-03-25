"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";

function buildFormsRedirect(message: string, kind: "error" | "message" = "error") {
  return `/dashboard/forms?${kind}=${encodeURIComponent(message)}`;
}

function buildFormRedirect(formId: string, message?: string, kind: "error" | "message" = "error") {
  if (!message) {
    return `/dashboard/forms/${formId}`;
  }

  return `/dashboard/forms/${formId}?${kind}=${encodeURIComponent(message)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createForm(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!tenant || !name) {
    redirect(buildFormsRedirect("Tenant and form name are required."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildFormsRedirect("No active tenant was found for this request."));
  }

  const slugBase = slugify(name) || "form";
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`;

  const insertResult = await context.supabase
    .from("forms")
    .insert({
      tenant_id: context.access.activeMembership.tenant.id,
      name,
      slug,
      description: null,
      status: "draft",
      schema: []
    } as never)
    .select("id")
    .single();

  const createdForm = (insertResult.data ?? null) as { id: string } | null;

  if (insertResult.error || !createdForm) {
    redirect(buildFormsRedirect(insertResult.error?.message ?? "Unable to create form."));
  }

  revalidatePath("/dashboard/forms");
  redirect(buildFormRedirect(createdForm.id));
}

export async function saveFormBuilder(formData: FormData) {
  const tenant = String(formData.get("tenant") ?? "").trim();
  const formId = String(formData.get("form_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "").trim());
  const description = String(formData.get("description") ?? "").trim();
  const intent = String(formData.get("intent") ?? "").trim();
  const schemaRaw = String(formData.get("schema") ?? "[]");

  if (!tenant || !formId || !name || !slug) {
    redirect(buildFormsRedirect("Tenant, form, name, and slug are required."));
  }

  let parsedSchema: unknown;

  try {
    parsedSchema = JSON.parse(schemaRaw);
  } catch {
    redirect(buildFormRedirect(formId, "The form schema could not be parsed."));
  }

  const context = await getRequiredDashboardContext(tenant);

  if (!context.supabase || !context.access?.activeMembership) {
    redirect(buildFormsRedirect("No active tenant was found for this request."));
  }

  const updateResult = await context.supabase
    .from("forms")
    .update({
      name,
      slug,
      description: description || null,
      schema: parsedSchema as never,
      status: intent === "publish" ? "published" : "draft",
      published_at: intent === "publish" ? new Date().toISOString() : null
    } as never)
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", formId);

  if (updateResult.error) {
    redirect(buildFormRedirect(formId, updateResult.error.message));
  }

  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${formId}`);
  redirect(buildFormRedirect(formId, intent === "publish" ? "Form published." : "Form saved.", "message"));
}
