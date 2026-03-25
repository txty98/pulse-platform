import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequiredDashboardContext } from "../../../../lib/dashboard-context";
import { FormBuilder } from "./form-builder";

type FormEditorPageProps = {
  params: Promise<{
    formId: string;
  }>;
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
    tab?: string;
  }>;
};

function buildTabHref(formId: string, tab: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  return `/dashboard/forms/${formId}?${params.toString()}`;
}

export default async function FormEditorPage({ params, searchParams }: FormEditorPageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(queryParams.tenant ?? null);
  const activeTab = queryParams.tab === "submissions" ? "submissions" : "builder";

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const formResult = await context.supabase
    .from("forms")
    .select("id, name, slug, description, status, schema")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", routeParams.formId)
    .maybeSingle();

  if (formResult.error || !formResult.data) {
    notFound();
  }

  const form = formResult.data as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    schema: Array<{
      id: string;
      type: "text" | "email" | "textarea" | "select" | "checkbox";
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
    }>;
  };

  const submissionsResult = await context.supabase
    .from("form_submissions")
    .select("id, payload, submitted_at")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("form_id", form.id)
    .order("submitted_at", { ascending: false });

  const submissions = (submissionsResult.data ?? []) as Array<{
    id: string;
    payload: Record<string, string | boolean>;
    submitted_at: string;
  }>;

  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header">
          <div>
            <h2>{form.name}</h2>
            <p className="panel-copy">
              {form.status === "published" ? `Public URL: /forms/${form.slug}` : "This form is currently in draft."}
            </p>
          </div>
          <Link className="section-action-button is-secondary" href="/dashboard/forms">
            Back to Forms
          </Link>
        </div>

        {queryParams.error ? <p className="people-form-error">{queryParams.error}</p> : null}
        {queryParams.message ? <p className="people-form-message">{queryParams.message}</p> : null}

        <div className="person-profile-tabs forms-tabs">
          <Link
            className={activeTab === "builder" ? "person-profile-tab is-active" : "person-profile-tab"}
            href={buildTabHref(form.id, "builder")}
          >
            Builder
          </Link>
          <Link
            className={activeTab === "submissions" ? "person-profile-tab is-active" : "person-profile-tab"}
            href={buildTabHref(form.id, "submissions")}
          >
            Submissions
          </Link>
        </div>

        {activeTab === "builder" ? (
          <FormBuilder tenantSlug={context.access.activeMembership.tenant.slug} form={form} />
        ) : submissions.length > 0 ? (
          <div className="forms-submission-list">
            {submissions.map((submission) => (
              <article className="forms-submission-card" key={submission.id}>
                <div className="forms-submission-header">
                  <strong>Submission</strong>
                  <span>{new Date(submission.submitted_at).toLocaleString()}</span>
                </div>

                <div className="forms-submission-grid">
                  {Object.entries(submission.payload).map(([key, value]) => (
                    <div className="forms-submission-item" key={key}>
                      <span>{key}</span>
                      <strong>{typeof value === "boolean" ? (value ? "Yes" : "No") : value || "—"}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="people-empty-state">
            <h3>No submissions yet</h3>
            <p>Published forms will start showing response data here once someone submits them.</p>
          </div>
        )}
      </article>
    </section>
  );
}
