import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { submitPublicForm } from "./actions";

type PublicFormPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

type PublicField = {
  id: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

export default async function PublicFormPage({ params, searchParams }: PublicFormPageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const supabase = await createClient();

  const formResult = await supabase
    .from("forms")
    .select("id, tenant_id, name, description, schema, status")
    .eq("slug", routeParams.slug)
    .eq("status", "published")
    .maybeSingle();

  if (formResult.error || !formResult.data) {
    notFound();
  }

  const form = formResult.data as {
    id: string;
    tenant_id: string;
    name: string;
    description: string | null;
    schema: PublicField[];
    status: string;
  };

  return (
    <main className="page-shell public-form-shell">
      <section className="auth-panel public-form-panel">
        <div className="auth-form public-form-card">
          <div className="field">
            <span>{form.name}</span>
            <p className="form-note">{form.description ?? "Fill out the form below and submit when ready."}</p>
          </div>

          {queryParams.error ? <p className="form-error">{queryParams.error}</p> : null}
          {queryParams.message ? <p className="form-note">{queryParams.message}</p> : null}

          <form action={submitPublicForm} className="people-form">
            <input name="slug" type="hidden" value={routeParams.slug} />
            <input name="form_id" type="hidden" value={form.id} />
            <input name="tenant_id" type="hidden" value={form.tenant_id} />

            {form.schema.map((field) => (
              <label className="field" key={field.id}>
                <span>{field.label}</span>

                {field.type === "textarea" ? (
                  <textarea
                    className="note-textarea"
                    name={`field:${field.id}`}
                    placeholder={field.placeholder ?? ""}
                    required={field.required}
                    rows={5}
                  />
                ) : field.type === "select" ? (
                  <select className="people-select" name={`field:${field.id}`} required={field.required} defaultValue="">
                    <option value="" disabled>
                      Select an option
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "checkbox" ? (
                  <span className="checkbox-field">
                    <input className="checkbox-input" name={`field:${field.id}`} type="checkbox" />
                    <span>{field.placeholder || "Check if applicable"}</span>
                  </span>
                ) : (
                  <input
                    name={`field:${field.id}`}
                    placeholder={field.placeholder ?? ""}
                    required={field.required}
                    type={field.type}
                  />
                )}
              </label>
            ))}

            <button className="primary-button" type="submit">
              Submit Form
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
