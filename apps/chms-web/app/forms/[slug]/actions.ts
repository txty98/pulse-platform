"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export async function submitPublicForm(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();
  const formId = String(formData.get("form_id") ?? "").trim();
  const tenantId = String(formData.get("tenant_id") ?? "").trim();

  if (!slug || !formId || !tenantId) {
    redirect(`/forms/${slug}?error=${encodeURIComponent("The form request was incomplete.")}`);
  }

  const supabase = await createClient();
  const formResult = await supabase
    .from("forms")
    .select("schema, status")
    .eq("id", formId)
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();

  const form = (formResult.data ?? null) as
    | {
        schema: Array<{
          id: string;
          label: string;
          type: string;
        }>;
        status: string;
      }
    | null;

  if (formResult.error || !form || form.status !== "published") {
    redirect(`/forms/${slug}?error=${encodeURIComponent("This form is not available.")}`);
  }

  const payload = form.schema.reduce<Record<string, string | boolean>>((accumulator, field) => {
    const inputName = `field:${field.id}`;
    accumulator[field.label] = field.type === "checkbox" ? formData.get(inputName) === "on" : String(formData.get(inputName) ?? "");
    return accumulator;
  }, {});

  const insertResult = await supabase.from("form_submissions").insert({
    tenant_id: tenantId,
    form_id: formId,
    payload
  } as never);

  if (insertResult.error) {
    redirect(`/forms/${slug}?error=${encodeURIComponent(insertResult.error.message)}`);
  }

  redirect(`/forms/${slug}?message=${encodeURIComponent("Thanks, your form was submitted.")}`);
}
