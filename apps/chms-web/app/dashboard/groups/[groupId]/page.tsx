import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequiredDashboardContext } from "../../../../lib/dashboard-context";
import { AddGroupMemberModal } from "../add-group-member-modal";
import { EditGroupModal } from "../edit-group-modal";
import { RecordAttendanceModal } from "../record-attendance-modal";

type GroupProfilePageProps = {
  params: Promise<{
    groupId: string;
  }>;
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
    tab?: string;
  }>;
};

function buildTabHref(groupId: string, tab: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  return `/dashboard/groups/${groupId}?${params.toString()}`;
}

function formatPrettyDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatName(person: { first_name: string; last_name: string }) {
  return `${person.first_name} ${person.last_name}`;
}

export default async function GroupProfilePage({ params, searchParams }: GroupProfilePageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(queryParams.tenant ?? null);
  const activeTab =
    queryParams.tab === "members" || queryParams.tab === "attendance" ? queryParams.tab : "profile";

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const groupResult = await context.supabase
    .from("groups")
    .select("id, name, group_type, status, leader_person_id, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .eq("id", routeParams.groupId)
    .maybeSingle();

  if (groupResult.error || !groupResult.data) {
    notFound();
  }

  const group = groupResult.data as {
    id: string;
    name: string;
    group_type: string;
    status: string;
    leader_person_id: string | null;
    created_at: string;
    updated_at: string;
  };

  const [peopleResult, memberResult] = await Promise.all([
    context.supabase
      .from("people")
      .select("id, first_name, last_name, email")
      .eq("tenant_id", tenantId)
      .order("first_name", { ascending: true }),
    context.supabase
      .from("group_members")
      .select("person_id, member_role, joined_at, status")
      .eq("tenant_id", tenantId)
      .eq("group_id", group.id)
  ]);

  const [attendanceEventsResult, attendanceEntriesResult] = await Promise.all([
    context.supabase
      .from("attendance_events")
      .select("id, name, occurred_at")
      .eq("tenant_id", tenantId)
      .eq("group_id", group.id)
      .order("occurred_at", { ascending: false }),
    context.supabase
      .from("attendance_entries")
      .select("event_id, person_id, status")
      .eq("tenant_id", tenantId)
  ]);

  const people = (peopleResult.data ?? []) as Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
  }>;
  const groupMembers = (memberResult.data ?? []) as Array<{
    person_id: string;
    member_role: string | null;
    joined_at: string | null;
    status: string;
  }>;
  const attendanceEvents = (attendanceEventsResult.data ?? []) as Array<{
    id: string;
    name: string;
    occurred_at: string;
  }>;
  const attendanceEntries = (attendanceEntriesResult.data ?? []) as Array<{
    event_id: string;
    person_id: string;
    status: string;
  }>;

  const memberIds = new Set(groupMembers.map((member) => member.person_id));
  const leader = group.leader_person_id ? people.find((person) => person.id === group.leader_person_id) ?? null : null;
  const availablePeople = people.filter((person) => !memberIds.has(person.id));
  const members = groupMembers
    .map((member) => ({
      ...member,
      person: people.find((person) => person.id === member.person_id) ?? null
    }))
    .filter(
      (member): member is typeof member & {
        person: {
          id: string;
          first_name: string;
          last_name: string;
          email: string | null;
        };
      } => member.person !== null
    );
  const attendanceReports = attendanceEvents.map((event) => {
    const entries = attendanceEntries.filter((entry) => entry.event_id === event.id);
    const presentCount = entries.filter((entry) => entry.status === "present").length;
    const absentCount = entries.filter((entry) => entry.status === "absent").length;
    const excusedCount = entries.filter((entry) => entry.status === "excused").length;
    const guestCount = entries.filter((entry) => entry.status === "guest").length;

    return {
      ...event,
      presentCount,
      absentCount,
      excusedCount,
      guestCount,
      totalCount: entries.length
    };
  });

  return (
    <section className="person-profile-page">
      {queryParams.error ? <p className="form-error person-profile-feedback">{queryParams.error}</p> : null}
      {queryParams.message ? <p className="form-note person-profile-feedback">{queryParams.message}</p> : null}

      <div className="person-profile-topbar">
        <div>
          <h2>{group.name}</h2>
          <p>
            {group.group_type} • {group.status}
          </p>
        </div>

        <div className="person-profile-actions">
          <EditGroupModal
            activeTab={activeTab}
            group={group}
            people={people.map((person) => ({
              id: person.id,
              first_name: person.first_name,
              last_name: person.last_name
            }))}
            tenantSlug={context.access.activeMembership.tenant.slug}
          />
        </div>
      </div>

      <div className="person-profile-tabs">
        <Link className={activeTab === "profile" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(group.id, "profile")}>
          Profile
        </Link>
        <Link className={activeTab === "members" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(group.id, "members")}>
          Members
        </Link>
        <Link className={activeTab === "attendance" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(group.id, "attendance")}>
          Attendance
        </Link>
      </div>

      {activeTab === "profile" ? (
        <div className="person-profile-layout">
          <div className="person-profile-left">
            <article className="panel-card person-summary-card">
              <div className="person-summary-header">
                <div className="person-summary-hero">
                  <span className="person-profile-avatar">
                    {group.name.charAt(0)}
                    {group.group_type.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h3>{group.name}</h3>
                    <p>{group.group_type}</p>
                    <p>{members.length} members</p>
                  </div>
                </div>

                <span className={group.status === "active" ? "person-status is-active" : "person-status"}>
                  {group.status === "active" ? "Active" : "Archived"}
                </span>
              </div>

              <div className="person-summary-footer">
                <div className="person-summary-stat">
                  <strong>{members.length}</strong>
                  <span>Members</span>
                </div>
                <div className="person-summary-stat">
                  <strong>{leader ? "Yes" : "No"}</strong>
                  <span>Leader Assigned</span>
                </div>
                <div className="person-summary-stat">
                  <strong>{group.status === "active" ? "Live" : "Archived"}</strong>
                  <span>State</span>
                </div>
              </div>
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <h2>Group Details</h2>
              </div>

              <dl className="person-profile-list">
                <div>
                  <dt>Type</dt>
                  <dd>{group.group_type}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{group.status}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatPrettyDate(group.created_at)}</dd>
                </div>
                <div>
                  <dt>Last Updated</dt>
                  <dd>{formatPrettyDate(group.updated_at)}</dd>
                </div>
              </dl>
            </article>
          </div>

          <div className="person-profile-right">
            <article className="panel-card person-section-card">
              <div className="panel-header">
                <div>
                  <h2>Leader</h2>
                </div>
              </div>

              {leader ? (
                <div className="person-family-grid">
                  <article className="family-member-card">
                    <span className="family-member-avatar">
                      {leader.first_name.charAt(0)}
                      {leader.last_name.charAt(0)}
                    </span>
                    <div>
                      <span className="family-member-label">Leader</span>
                      <strong>
                        <Link className="person-family-link" href={`/dashboard/people/${leader.id}`}>
                          {formatName(leader)}
                        </Link>
                      </strong>
                      <p>{leader.email ?? "No email on file"}</p>
                    </div>
                  </article>
                </div>
              ) : (
                <div className="person-section-empty">
                  <p>No leader is assigned to this group yet.</p>
                </div>
              )}
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <div>
                  <h2>Members</h2>
                  <p className="person-section-subtitle">{members.length} people currently in this group.</p>
                </div>
                <AddGroupMemberModal
                  activeTab={activeTab}
                  groupId={group.id}
                  people={availablePeople}
                  tenantSlug={context.access.activeMembership.tenant.slug}
                />
              </div>

              {members.length > 0 ? (
                <div className="person-group-list">
                  {members.slice(0, 5).map((member) => (
                    <article className="person-group-row" key={member.person.id}>
                      <div>
                        <strong>
                          <Link className="person-family-link" href={`/dashboard/people/${member.person.id}`}>
                            {formatName(member.person)}
                          </Link>
                        </strong>
                        <p>{member.member_role ?? "Member"}</p>
                      </div>
                      <span>{member.joined_at ? formatPrettyDate(member.joined_at) : member.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="person-section-empty">
                  <p>No people are assigned to this group yet.</p>
                </div>
              )}
            </article>
          </div>
        </div>
      ) : activeTab === "members" ? (
        <div className="person-family-view">
          <article className="panel-card person-section-card">
            <div className="panel-header">
              <div>
                <h2>Group Members</h2>
                <p className="person-section-subtitle">{members.length} members in {group.name}</p>
              </div>
              <AddGroupMemberModal
                activeTab={activeTab}
                groupId={group.id}
                people={availablePeople}
                tenantSlug={context.access.activeMembership.tenant.slug}
              />
            </div>

            {members.length > 0 ? (
              <div className="person-family-table-wrap">
                <table className="person-family-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.person.id}>
                        <td>
                          <Link className="person-family-link" href={`/dashboard/people/${member.person.id}`}>
                            {formatName(member.person)}
                          </Link>
                        </td>
                        <td>{member.member_role ?? "Member"}</td>
                        <td>{member.person.email ?? "No email on file"}</td>
                        <td>{member.joined_at ? formatPrettyDate(member.joined_at) : "Not recorded"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="person-section-empty">
                <p>No people are assigned to this group yet.</p>
              </div>
            )}
          </article>
        </div>
      ) : (
        <div className="person-family-view">
          <article className="panel-card person-section-card">
            <div className="panel-header">
              <div>
                <h2>Attendance Reports</h2>
                <p className="person-section-subtitle">Past attendance records for {group.name}.</p>
              </div>
              <RecordAttendanceModal
                activeTab={activeTab}
                groupId={group.id}
                groupName={group.name}
                members={members.map((member) => ({
                  id: member.person.id,
                  first_name: member.person.first_name,
                  last_name: member.person.last_name
                }))}
                tenantSlug={context.access.activeMembership.tenant.slug}
              />
            </div>

            {attendanceReports.length > 0 ? (
              <div className="person-family-table-wrap">
                <table className="person-family-table">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>Date</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Excused</th>
                      <th>Guests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.name}</td>
                        <td>{formatPrettyDate(report.occurred_at)}</td>
                        <td>{report.presentCount}</td>
                        <td>{report.absentCount}</td>
                        <td>{report.excusedCount}</td>
                        <td>{report.guestCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="person-section-empty">
                <p>No attendance reports have been recorded for this group yet.</p>
              </div>
            )}
          </article>
        </div>
      )}

      <Link className="person-profile-back" href="/dashboard/groups">
        ← Back to Groups
      </Link>
    </section>
  );
}
