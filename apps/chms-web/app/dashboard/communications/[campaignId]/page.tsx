import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequiredDashboardContext } from "../../../../lib/dashboard-context";
import { EmailDesigner } from "./email-designer";

type CampaignEditorPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
  }>;
};

export default async function CampaignEditorPage({ params, searchParams }: CampaignEditorPageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(queryParams.tenant ?? null);

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const campaignResult = await context.supabase
    .from("email_campaigns")
    .select("id, name, subject, preview_text, status, design, audience")
    .eq("tenant_id", context.access.activeMembership.tenant.id)
    .eq("id", routeParams.campaignId)
    .maybeSingle();

  if (campaignResult.error || !campaignResult.data) {
    notFound();
  }

  const [groupsResult, peopleResult, groupMembersResult] = await Promise.all([
    context.supabase
      .from("groups")
      .select("id, name")
      .eq("tenant_id", context.access.activeMembership.tenant.id)
      .order("name", { ascending: true }),
    context.supabase
      .from("people")
      .select("id, first_name, last_name, email")
      .eq("tenant_id", context.access.activeMembership.tenant.id)
      .order("first_name", { ascending: true }),
    context.supabase
      .from("group_members")
      .select("group_id, person_id")
      .eq("tenant_id", context.access.activeMembership.tenant.id)
  ]);

  const campaign = campaignResult.data as {
    id: string;
    name: string;
    subject: string;
    preview_text: string | null;
    status: string;
    audience:
      | {
          type?: string;
          group_ids?: string[];
          person_ids?: string[];
        }
      | null;
    design: Array<{
      id: string;
      type: "heading" | "text" | "button" | "divider" | "image" | "columns-2" | "columns-3";
      content?: string;
      buttonLabel?: string;
      buttonUrl?: string;
      imageUrl?: string;
      columns?: Array<{
        id: string;
        heading: string;
        text: string;
        buttonLabel?: string;
        buttonUrl?: string;
      }>;
    }>;
  };
  const groups = (groupsResult.data ?? []) as Array<{
    id: string;
    name: string;
  }>;
  const people = (peopleResult.data ?? []) as Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  }>;
  const groupMembers = (groupMembersResult.data ?? []) as Array<{
    group_id: string;
    person_id: string;
  }>;

  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header">
          <div>
            <h2>{campaign.name}</h2>
            <p className="panel-copy">
              {campaign.status === "ready"
                ? "This campaign is prepared for delivery once Resend is connected."
                : "This campaign is currently in draft."}
            </p>
          </div>
          <Link className="section-action-button is-secondary" href="/dashboard/communications">
            Back to Communications
          </Link>
        </div>

        {queryParams.error ? <p className="people-form-error">{queryParams.error}</p> : null}
        {queryParams.message ? <p className="people-form-message">{queryParams.message}</p> : null}

        <EmailDesigner
          campaign={campaign}
          groups={groups}
          groupMembers={groupMembers}
          people={people}
          tenantSlug={context.access.activeMembership.tenant.slug}
        />
      </article>
    </section>
  );
}
