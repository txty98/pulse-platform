import Link from "next/link";
import { getRequiredDashboardContext } from "../../../lib/dashboard-context";
import { createCampaign } from "./actions";

type CommunicationsPageProps = {
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function CommunicationsPage({ searchParams }: CommunicationsPageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const campaignsResult = await context.supabase
    .from("email_campaigns")
    .select("id, name, subject, status, updated_at")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .order("updated_at", { ascending: false });

  const campaigns = (campaignsResult.data ?? []) as Array<{
    id: string;
    name: string;
    subject: string;
    status: string;
    updated_at: string;
  }>;

  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header people-panel-header">
          <div>
            <h2>Email Campaigns</h2>
            <p className="panel-copy">Design mass emails with a drag-and-drop editor and prepare them for Resend.</p>
          </div>
        </div>

        {params.error ? <p className="people-form-error">{params.error}</p> : null}
        {params.message ? <p className="people-form-message">{params.message}</p> : null}

        <form action={createCampaign} className="people-form forms-create-form">
          <input name="tenant" type="hidden" value={context.access.activeMembership.tenant.slug} />
          <label className="field">
            <span>Campaign Name</span>
            <input name="name" type="text" placeholder="Easter Weekend Invite" required />
          </label>
          <div className="people-modal-actions">
            <button className="primary-button" type="submit">
              Create Campaign
            </button>
          </div>
        </form>

        {campaigns.length > 0 ? (
          <div className="people-table-wrap">
            <table className="people-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <Link className="person-family-link" href={`/dashboard/communications/${campaign.id}`}>
                        {campaign.name}
                      </Link>
                    </td>
                    <td>{campaign.subject}</td>
                    <td>
                      <span className={campaign.status === "ready" ? "person-status is-active" : "person-status"}>
                        {campaign.status === "ready" ? "Ready" : campaign.status === "sent" ? "Sent" : "Draft"}
                      </span>
                    </td>
                    <td>{new Date(campaign.updated_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="people-empty-state">
            <h3>No campaigns yet</h3>
            <p>Create your first campaign to start designing tenant-wide email communication.</p>
          </div>
        )}
      </article>
    </section>
  );
}
