import { getRequiredDashboardContext } from "../../../lib/dashboard-context";
import { AddGroupModal } from "./add-group-modal";
import { GroupsTable } from "./groups-table";

type GroupsPageProps = {
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
  }>;
};

type GroupRow = {
  id: string;
  name: string;
  group_type: string;
  status: string;
  leader_person_id: string | null;
};

export default async function GroupsPage({ searchParams }: GroupsPageProps) {
  const params = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(params.tenant ?? null);

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const [groupsResult, peopleResult, memberCountsResult] = await Promise.all([
    context.supabase
      .from("groups")
      .select("id, name, group_type, status, leader_person_id")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true }),
    context.supabase
      .from("people")
      .select("id, first_name, last_name")
      .eq("tenant_id", tenantId)
      .order("first_name", { ascending: true }),
    context.supabase
      .from("group_members")
      .select("group_id, person_id")
      .eq("tenant_id", tenantId)
  ]);

  const groups = (groupsResult.data ?? []) as GroupRow[];
  const people = (peopleResult.data ?? []) as Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  const memberCounts = (memberCountsResult.data ?? []) as Array<{
    group_id: string;
    person_id: string;
  }>;

  const peopleById = new Map(
    people.map((person) => [person.id, `${person.first_name} ${person.last_name}`])
  );
  const memberCountByGroup = new Map<string, number>();

  for (const member of memberCounts) {
    memberCountByGroup.set(member.group_id, (memberCountByGroup.get(member.group_id) ?? 0) + 1);
  }

  const tableRows = groups.map((group) => ({
    ...group,
    memberCount: memberCountByGroup.get(group.id) ?? 0,
    leaderName: group.leader_person_id ? peopleById.get(group.leader_person_id) ?? null : null
  }));

  const activeCount = tableRows.filter((group) => group.status === "active").length;
  const archivedCount = tableRows.filter((group) => group.status !== "active").length;
  const withLeaderCount = tableRows.filter((group) => group.leaderName).length;
  const totalMembers = tableRows.reduce((sum, group) => sum + group.memberCount, 0);

  return (
    <section className="people-module">
      <article className="panel-card people-panel">
        <div className="panel-header people-panel-header">
          <div>
            <h2>Groups Directory</h2>
            <p className="panel-copy">Track ministries, classes, and teams inside the active tenant.</p>
          </div>
          <AddGroupModal
            tenantName={context.access.activeMembership.tenant.name}
            tenantSlug={context.access.activeMembership.tenant.slug}
            people={people}
          />
        </div>

        {params.error ? <p className="people-form-error">{params.error}</p> : null}
        {params.message ? <p className="people-form-message">{params.message}</p> : null}

        <div className="people-stats">
          <div className="people-stat-pill">
            <strong>{tableRows.length}</strong>
            <span>Total groups</span>
          </div>
          <div className="people-stat-pill">
            <strong>{activeCount}</strong>
            <span>Active</span>
          </div>
          <div className="people-stat-pill">
            <strong>{withLeaderCount}</strong>
            <span>With leader</span>
          </div>
          <div className="people-stat-pill">
            <strong>{totalMembers}</strong>
            <span>Total members</span>
          </div>
        </div>

        <div className="people-toolbar">
          <div className="people-toolbar-copy">
            <strong>{tableRows.length}</strong>
            <span>groups displayed</span>
          </div>

          <div className="groups-toolbar-summary">
            <span>{archivedCount} archived</span>
          </div>
        </div>

        {groupsResult.error ? (
          <div className="people-empty-state">
            <p>{groupsResult.error.message}</p>
          </div>
        ) : tableRows.length === 0 ? (
          <div className="people-empty-state">
            <h3>No groups yet</h3>
            <p>Create your first group to start organizing ministries, classes, or teams.</p>
          </div>
        ) : (
          <GroupsTable groups={tableRows} />
        )}
      </article>
    </section>
  );
}
