import Link from "next/link";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";
import { createForm } from "./actions";

type FormsPageProps = {
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function FormsPage({ searchParams }: FormsPageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const formsResult = await context.supabase
    .from("forms")
    .select("id, name, slug, description, status, updated_at")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .order("updated_at", { ascending: false });

  const forms = (formsResult.data ?? []) as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    updated_at: string;
  }>;

  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header people-panel-header">
          <div>
            <h2>Forms</h2>
            <p className="panel-copy">Create drag-and-drop forms, publish them, and share a public URL.</p>
          </div>
        </div>

        {params.error ? <p className="people-form-error">{params.error}</p> : null}
        {params.message ? <p className="people-form-message">{params.message}</p> : null}

        <form action={createForm} className="people-form forms-create-form">
          <input name="tenant" type="hidden" value={context.access.activeMembership.tenant.slug} />
          <label className="field">
            <span>New Form Name</span>
            <input name="name" type="text" placeholder="Guest Connect Form" required />
          </label>
          <div className="people-modal-actions">
            <button className="primary-button" type="submit">
              Create Form
            </button>
          </div>
        </form>

        {forms.length > 0 ? (
          <div className="people-table-wrap">
            <table className="people-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Public URL</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <Link className="person-family-link" href={`/dashboard/forms/${form.id}`}>
                        {form.name}
                      </Link>
                    </td>
                    <td>
                      <span className={form.status === "published" ? "person-status is-active" : "person-status"}>
                        {form.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>{form.status === "published" ? `/forms/${form.slug}` : "Not published"}</td>
                    <td>{new Date(form.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="people-empty-state">
            <h3>No forms yet</h3>
            <p>Create your first form to start collecting submissions without requiring login.</p>
          </div>
        )}
      </article>
    </section>
  );
}
