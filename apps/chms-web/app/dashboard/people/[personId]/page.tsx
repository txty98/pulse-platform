import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequiredDashboardContext } from "../../../../lib/dashboard-context";
import { AccountAccessForm } from "../account-access-form";
import { AddNoteModal } from "../add-note-modal";
import { EditPersonModal } from "../edit-person-modal";
import { FamilyActions } from "../family-actions";

type PersonProfilePageProps = {
  params: Promise<{
    personId: string;
  }>;
  searchParams?: Promise<{
    tenant?: string;
    error?: string;
    message?: string;
    tab?: string;
  }>;
};

function buildTabHref(personId: string, tab: string) {
  const params = new URLSearchParams();
  params.set("tab", tab);
  return `/dashboard/people/${personId}?${params.toString()}`;
}

function formatPersonName(person: {
  first_name: string;
  last_name: string;
  preferred_name: string | null;
}) {
  return `${person.first_name} ${person.last_name}`;
}

function getAgeLabel(birthDate: string | null) {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return `${age} yrs (${formatPrettyDate(birthDate)})`;
}

function formatPrettyDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function ProfileActionIcon({ name }: { name: "send" | "document" | "message" | "download" | "edit" }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "send":
      return (
        <svg {...sharedProps}>
          <path d="m22 2-7 20-4-9-9-4 20-7Z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "document":
      return (
        <svg {...sharedProps}>
          <path d="M7 3h7l5 5v13H7z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "message":
      return (
        <svg {...sharedProps}>
          <path d="M4 5h16v11H7l-3 3V5Z" />
        </svg>
      );
    case "download":
      return (
        <svg {...sharedProps}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "edit":
      return (
        <svg {...sharedProps}>
          <path d="m4 20 4.5-1 9.9-9.9a1.4 1.4 0 0 0 0-2l-1.5-1.5a1.4 1.4 0 0 0-2 0L5 15.5 4 20Z" />
          <path d="M13.5 6.5 17.5 10.5" />
        </svg>
      );
  }
}

export default async function PersonProfilePage({
  params,
  searchParams
}: PersonProfilePageProps) {
  const routeParams = await params;
  const queryParams = (await searchParams) ?? {};
  const context = await getRequiredDashboardContext(queryParams.tenant ?? null);
  const errorMessage = typeof queryParams.error === "string" ? queryParams.error : null;
  const successMessage = typeof queryParams.message === "string" ? queryParams.message : null;
  const activeTab =
    queryParams.tab === "family" || queryParams.tab === "account" || queryParams.tab === "timeline"
      ? queryParams.tab
      : "profile";

  if (!context.supabase || !context.access?.activeMembership) {
    return null;
  }

  const tenantId = context.access.activeMembership.tenant.id;

  const personResult = await context.supabase
    .from("people")
    .select("id, first_name, last_name, preferred_name, email, phone, birth_date, is_active, created_at, updated_at")
    .eq("tenant_id", tenantId)
    .eq("id", routeParams.personId)
    .maybeSingle();

  if (personResult.error || !personResult.data) {
    notFound();
  }

  const person = personResult.data as {
    id: string;
    first_name: string;
    last_name: string;
    preferred_name: string | null;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };

  const familyMembershipResult = await context.supabase
    .from("family_members")
    .select("family_id, relationship_to_family, is_primary_contact")
    .eq("tenant_id", tenantId)
    .eq("person_id", person.id);

  const familyMemberships = (familyMembershipResult.data ?? []) as Array<{
    family_id: string;
    relationship_to_family: string | null;
    is_primary_contact: boolean;
  }>;
  const familyIds = familyMemberships.map((membership) => membership.family_id);

  const familiesResult =
    familyIds.length > 0
      ? await context.supabase
          .from("families")
          .select("id, household_name")
          .eq("tenant_id", tenantId)
          .in("id", familyIds)
      : { data: [], error: null };

  const families = (familiesResult.data ?? []) as Array<{
    id: string;
    household_name: string;
  }>;

  const relatedFamilyMembersResult =
    familyIds.length > 0
      ? await context.supabase
          .from("family_members")
          .select("family_id, person_id, relationship_to_family, is_primary_contact")
          .eq("tenant_id", tenantId)
          .in("family_id", familyIds)
      : { data: [], error: null };

  const relatedFamilyMembers = (relatedFamilyMembersResult.data ?? []) as Array<{
    family_id: string;
    person_id: string;
    relationship_to_family: string | null;
    is_primary_contact: boolean;
  }>;

  const relatedPersonIds = Array.from(new Set(relatedFamilyMembers.map((member) => member.person_id)));

  const familyPeopleResult =
    relatedPersonIds.length > 0
      ? await context.supabase
          .from("people")
          .select("id, first_name, last_name, preferred_name, birth_date")
          .eq("tenant_id", tenantId)
          .in("id", relatedPersonIds)
      : { data: [], error: null };

  const familyPeople = (familyPeopleResult.data ?? []) as Array<{
    id: string;
    first_name: string;
    last_name: string;
    preferred_name: string | null;
    birth_date: string | null;
  }>;

  const groupMembershipsResult = await context.supabase
    .from("group_members")
    .select("group_id, status, member_role, joined_at")
    .eq("tenant_id", tenantId)
    .eq("person_id", person.id);

  const groupMemberships = (groupMembershipsResult.data ?? []) as Array<{
    group_id: string;
    status: string;
    member_role: string | null;
    joined_at: string | null;
  }>;
  const groupIds = groupMemberships.map((membership) => membership.group_id);

  const groupsResult =
    groupIds.length > 0
      ? await context.supabase
          .from("groups")
          .select("id, name, group_type, status")
          .eq("tenant_id", tenantId)
          .in("id", groupIds)
      : { data: [], error: null };

  const groups = (groupsResult.data ?? []) as Array<{
    id: string;
    name: string;
    group_type: string;
    status: string;
  }>;

  const attendanceEntriesResult = await context.supabase
    .from("attendance_entries")
    .select("event_id, status")
    .eq("tenant_id", tenantId)
    .eq("person_id", person.id);

  const attendanceEntries = (attendanceEntriesResult.data ?? []) as Array<{
    event_id: string;
    status: string;
  }>;
  const attendanceEventIds = attendanceEntries.map((entry) => entry.event_id);

  const attendanceEventsResult =
    attendanceEventIds.length > 0
      ? await context.supabase
          .from("attendance_events")
          .select("id, name, occurred_at, group_id")
          .eq("tenant_id", tenantId)
          .in("id", attendanceEventIds)
      : { data: [], error: null };

  const attendanceEvents = (attendanceEventsResult.data ?? []) as Array<{
    id: string;
    name: string;
    occurred_at: string;
    group_id: string | null;
  }>;

  const attendanceGroupIds = Array.from(
    new Set(attendanceEvents.map((event) => event.group_id).filter((groupId): groupId is string => Boolean(groupId)))
  );

  const attendanceGroupsResult =
    attendanceGroupIds.length > 0
      ? await context.supabase
          .from("groups")
          .select("id, name")
          .eq("tenant_id", tenantId)
          .in("id", attendanceGroupIds)
      : { data: [], error: null };

  const attendanceGroups = (attendanceGroupsResult.data ?? []) as Array<{
    id: string;
    name: string;
  }>;

  const allFamiliesResult = await context.supabase
    .from("families")
    .select("id, household_name")
    .eq("tenant_id", tenantId)
    .order("household_name");

  const allFamilies = (allFamiliesResult.data ?? []) as Array<{
    id: string;
    household_name: string;
  }>;

  const allPeopleResult = await context.supabase
    .from("people")
    .select("id, first_name, last_name")
    .eq("tenant_id", tenantId)
    .neq("id", person.id)
    .order("first_name");

  const allPeople = (allPeopleResult.data ?? []) as Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;

  const allFamilyMembersResult = await context.supabase
    .from("family_members")
    .select("person_id")
    .eq("tenant_id", tenantId);

  const assignedFamilyPersonIds = new Set(
    ((allFamilyMembersResult.data ?? []) as Array<{ person_id: string }>).map((member) => member.person_id)
  );

  const primaryFamily = familyIds[0]
    ? {
        details: families.find((family) => family.id === familyIds[0]) ?? null,
        members: relatedFamilyMembers
          .filter((member) => member.family_id === familyIds[0])
          .map((member) => ({
            relationship: member.relationship_to_family,
            isPrimaryContact: member.is_primary_contact,
            person: familyPeople.find((familyPerson) => familyPerson.id === member.person_id) ?? null
          }))
          .filter(
            (member): member is {
              relationship: string | null;
              isPrimaryContact: boolean;
              person: {
                id: string;
                first_name: string;
                last_name: string;
                preferred_name: string | null;
                birth_date: string | null;
              };
            } => member.person !== null
          )
      }
    : null;

  const rolesResult = await context.supabase
    .from("roles")
    .select("id, key, name, description")
    .eq("tenant_id", tenantId)
    .order("is_system", { ascending: false })
    .order("name");

  const roles = (rolesResult.data ?? []) as Array<{
    id: string;
    key: string;
    name: string;
    description: string | null;
  }>;

  const rolePermissionsResult =
    roles.length > 0
      ? await context.supabase
          .from("role_permissions")
          .select("role_id, permission:permissions(code, label)")
          .in("role_id", roles.map((role) => role.id))
      : { data: [], error: null };

  const permissionsByRole = new Map<
    string,
    Array<{
      code: string;
      label: string;
    }>
  >();

  for (const row of (rolePermissionsResult.data ?? []) as Array<{
    role_id: string;
    permission:
      | {
          code: string;
          label: string;
        }
      | Array<{
          code: string;
          label: string;
        }>
      | null;
  }>) {
    const permission = Array.isArray(row.permission) ? (row.permission[0] ?? null) : row.permission;

    if (!permission) {
      continue;
    }

    const existingPermissions = permissionsByRole.get(row.role_id) ?? [];
    existingPermissions.push(permission);
    permissionsByRole.set(row.role_id, existingPermissions);
  }

  const membershipForPersonResult = await context.supabase
    .from("tenant_memberships")
    .select("id, user_id, status, person_id")
    .eq("tenant_id", tenantId)
    .eq("person_id", person.id)
    .maybeSingle();

  const membershipForPerson = (membershipForPersonResult.data ?? null) as
    | {
        id: string;
        user_id: string;
        status: string;
        person_id: string | null;
      }
    | null;

  const membershipRolesResult =
    membershipForPerson?.id
      ? await context.supabase
          .from("membership_roles")
          .select("role:roles(id, key, name)")
          .eq("membership_id", membershipForPerson.id)
      : { data: [], error: null };

  const membershipRole = ((membershipRolesResult.data ?? []) as Array<{
    role:
      | {
          id: string;
          key: string;
          name: string;
        }
      | Array<{
          id: string;
          key: string;
          name: string;
        }>
      | null;
  }>)
    .map((row) => (Array.isArray(row.role) ? (row.role[0] ?? null) : row.role))
    .find((role): role is { id: string; key: string; name: string } => role !== null) ?? null;

  const linkedProfileResult =
    membershipForPerson?.user_id
      ? await context.supabase
          .from("profiles")
          .select("email")
          .eq("id", membershipForPerson.user_id)
          .maybeSingle()
      : { data: null, error: null };

  const linkedProfileEmail =
    (linkedProfileResult.data as {
      email: string | null;
    } | null)?.email ?? null;

  const invitationResult = await context.supabase
    .from("tenant_invitations")
    .select("id, email, status, role_id, invited_at, accepted_at")
    .eq("tenant_id", tenantId)
    .eq("person_id", person.id)
    .maybeSingle();

  const invitation = (invitationResult.data ?? null) as
    | {
        id: string;
        email: string;
        status: string;
        role_id: string;
        invited_at: string;
        accepted_at: string | null;
      }
    | null;

  const [canReadNotesResult, canWriteNotesResult] = await Promise.all([
    (context.supabase.rpc as any)("has_tenant_permission", {
      target_tenant_id: tenantId,
      target_permission_code: "people.notes.read"
    }),
    (context.supabase.rpc as any)("has_tenant_permission", {
      target_tenant_id: tenantId,
      target_permission_code: "people.notes.write"
    })
  ]);

  const canReadNotes = Boolean(canReadNotesResult.data);
  const canWriteNotes = Boolean(canWriteNotesResult.data);

  const personNotesResult = canReadNotes
    ? await context.supabase
        .from("person_notes")
        .select("id, title, body, created_at")
        .eq("tenant_id", tenantId)
        .eq("person_id", person.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  const personNotes = (personNotesResult.data ?? []) as Array<{
    id: string;
    title: string | null;
    body: string;
    created_at: string;
  }>;

  const attendanceCount = attendanceEntries.filter((entry) => entry.status === "present").length;

  const familyRows = primaryFamily
    ? primaryFamily.members.map((member) => ({
        id: member.person.id,
        name: formatPersonName(member.person),
        relationship: member.relationship ?? (member.isPrimaryContact ? "Primary Contact" : "Family Member"),
        age: getAgeLabel(member.person.birth_date) ?? "Birth date not recorded",
        isPrimaryContact: member.isPrimaryContact
      }))
    : [];

  const roleOptions = roles.map((role) => ({
    ...role,
    permissions: permissionsByRole.get(role.id) ?? []
  }));

  const defaultRoleId =
    membershipRole?.id ?? invitation?.role_id ?? roleOptions.find((role) => role.key === "admin")?.id ?? roleOptions[0]?.id ?? "";

  const timelineItems = [
    {
      id: `person-created-${person.id}`,
      date: person.created_at,
      title: "Profile created",
      detail: `${formatPersonName(person)} was added to ${context.access.activeMembership.tenant.name}.`,
      tone: "blue"
    },
    ...groupMemberships.map((membership) => {
      const group = groups.find((groupItem) => groupItem.id === membership.group_id);

      return {
        id: `group-${membership.group_id}`,
        date: membership.joined_at ?? person.updated_at,
        title: "Joined group",
        detail: group
          ? `${formatPersonName(person)} was added to ${group.name}${membership.member_role ? ` as ${membership.member_role}` : ""}.`
          : "A group membership was added.",
        tone: "green"
      };
    }),
    ...(primaryFamily?.details
      ? [
          {
            id: `family-${primaryFamily.details.id}`,
            date: person.updated_at,
            title: "Family connected",
            detail: `${formatPersonName(person)} is connected to ${primaryFamily.details.household_name}.`,
            tone: "mint"
          }
        ]
      : []),
    ...attendanceEntries.map((entry) => {
      const event = attendanceEvents.find((attendanceEvent) => attendanceEvent.id === entry.event_id);
      const group = event?.group_id
        ? attendanceGroups.find((attendanceGroup) => attendanceGroup.id === event.group_id) ?? null
        : null;

      return {
        id: `attendance-${entry.event_id}`,
        date: event?.occurred_at ?? person.updated_at,
        title: "Attendance recorded",
        detail: event
          ? `${formatPersonName(person)} was marked ${entry.status} for ${event.name}${group ? ` in ${group.name}` : ""}.`
          : `Attendance was marked ${entry.status}.`,
        tone: entry.status === "present" ? "green" : "blue"
      };
    }),
    ...(invitation
      ? [
          {
            id: `invite-${invitation.id}`,
            date: invitation.invited_at,
            title: invitation.status === "accepted" ? "Tenant account linked" : "Tenant invitation created",
            detail:
              invitation.status === "accepted"
                ? `${invitation.email} now has tenant access${membershipRole?.name ? ` as ${membershipRole.name}` : ""}.`
                : `${invitation.email} has a pending tenant invitation${roleOptions.find((role) => role.id === invitation.role_id)?.name ? ` as ${roleOptions.find((role) => role.id === invitation.role_id)?.name}` : ""}.`,
            tone: invitation.status === "accepted" ? "green" : "blue"
          }
        ]
      : []),
    ...(person.updated_at !== person.created_at
      ? [
          {
            id: `person-updated-${person.id}`,
            date: person.updated_at,
            title: "Profile updated",
            detail: "Core profile details were updated.",
            tone: "blue"
          }
        ]
      : [])
  ]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime());

  return (
    <section className="person-profile-page">
      {errorMessage ? <p className="form-error person-profile-feedback">{errorMessage}</p> : null}
      {successMessage ? <p className="form-note person-profile-feedback">{successMessage}</p> : null}

      <div className="person-profile-topbar">
        <div>
          <h2>{formatPersonName(person)}</h2>
        </div>

        <div className="person-profile-actions">
          <button className="person-profile-action" type="button" aria-label="Send">
            <ProfileActionIcon name="send" />
          </button>
          <button className="person-profile-action" type="button" aria-label="Document">
            <ProfileActionIcon name="document" />
          </button>
          <button className="person-profile-action" type="button" aria-label="Message">
            <ProfileActionIcon name="message" />
          </button>
          <button className="person-profile-action" type="button" aria-label="Download">
            <ProfileActionIcon name="download" />
          </button>
          <EditPersonModal tenantSlug={context.access.activeMembership.tenant.slug} person={person} />
        </div>
      </div>

      <div className="person-profile-tabs">
        <Link className={activeTab === "profile" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(person.id, "profile")}>
          Profile
        </Link>
        <Link className={activeTab === "family" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(person.id, "family")}>
          Family
        </Link>
        <Link className={activeTab === "timeline" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(person.id, "timeline")}>
          Timeline
        </Link>
        <span className="person-profile-tab">Giving</span>
        <Link className={activeTab === "account" ? "person-profile-tab is-active" : "person-profile-tab"} href={buildTabHref(person.id, "account")}>
          Account
        </Link>
      </div>

      {activeTab === "profile" ? (
        <div className="person-profile-layout">
          <div className="person-profile-left">
            <article className="panel-card person-summary-card">
              <div className="person-summary-header">
                <div className="person-summary-hero">
                  <span className="person-profile-avatar">
                    {person.first_name.charAt(0)}
                    {person.last_name.charAt(0)}
                  </span>
                  <div>
                    <h3>{formatPersonName(person)}</h3>
                    <p>{person.id}</p>
                    <p>{getAgeLabel(person.birth_date) ?? "Birth date not recorded"}</p>
                  </div>
                </div>

                <span className={person.is_active ? "person-status is-active" : "person-status"}>
                  {person.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="person-summary-footer">
                <div className="person-summary-stat">
                  <strong>{groupMemberships.length}</strong>
                  <span>Groups</span>
                </div>
                <div className="person-summary-stat">
                  <strong>{familyMemberships.length > 0 ? familyMemberships.length : 0}</strong>
                  <span>Family Links</span>
                </div>
                <div className="person-summary-stat">
                  <strong>{attendanceCount}</strong>
                  <span>Present Marks</span>
                </div>
              </div>
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <h2>Contact Info</h2>
              </div>

              <dl className="person-profile-list">
                <div>
                  <dt>Phone</dt>
                  <dd>{person.phone ?? "No phone on file"}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{person.email ?? "No email on file"}</dd>
                </div>
                <div>
                  <dt>Birth Date</dt>
                  <dd>{person.birth_date ?? "Not recorded"}</dd>
                </div>
              </dl>
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <h2>Record Details</h2>
              </div>

              <dl className="person-profile-list">
                <div>
                  <dt>Created</dt>
                  <dd>{formatPrettyDate(person.created_at)}</dd>
                </div>
                <div>
                  <dt>Last Updated</dt>
                  <dd>{formatPrettyDate(person.updated_at)}</dd>
                </div>
                <div>
                  <dt>Tenant</dt>
                  <dd>{context.access.activeMembership.tenant.name}</dd>
                </div>
              </dl>
            </article>
          </div>

          <div className="person-profile-right">
            <article className="panel-card person-section-card">
              <div className="panel-header">
                <div>
                  <h2>Family</h2>
                  {primaryFamily?.details?.household_name ? (
                    <p className="person-section-subtitle">{primaryFamily?.details?.household_name}</p>
                  ) : null}
                </div>

                <FamilyActions
                  activeTab={activeTab}
                  tenantSlug={context.access.activeMembership.tenant.slug}
                  profilePerson={{
                    id: person.id,
                    first_name: person.first_name,
                    last_name: person.last_name
                  }}
                  existingFamily={primaryFamily?.details ?? null}
                  availableFamilies={allFamilies.filter((family) => family.id !== primaryFamily?.details?.id)}
                  availablePeople={allPeople.filter(
                    (candidate) =>
                      !assignedFamilyPersonIds.has(candidate.id) &&
                      !primaryFamily?.members.some((member) => member.person.id === candidate.id)
                  )}
                />
              </div>

              {primaryFamily && primaryFamily.details ? (
                <div className="person-family-grid">
                  {primaryFamily.members.map((member) => (
                    <article className="family-member-card" key={member.person.id}>
                      <span className="family-member-avatar">
                        {member.person.first_name.charAt(0)}
                        {member.person.last_name.charAt(0)}
                      </span>
                      <div>
                        <span className="family-member-label">
                          {member.relationship ?? (member.isPrimaryContact ? "Primary" : "Family")}
                        </span>
                        <strong>{formatPersonName(member.person)}</strong>
                        <p>{getAgeLabel(member.person.birth_date) ?? "Birth date not recorded"}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="person-section-empty">
                  <p>No family relationships are connected to this person yet.</p>
                </div>
              )}
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <h2>Groups</h2>
              </div>

              {groups.length > 0 ? (
                <div className="person-group-list">
                  {groupMemberships.map((membership) => {
                    const group = groups.find((groupItem) => groupItem.id === membership.group_id);

                    if (!group) {
                      return null;
                    }

                    return (
                      <article className="person-group-row" key={group.id}>
                        <div>
                          <strong>{group.name}</strong>
                          <p>
                            {group.group_type} {membership.member_role ? `• ${membership.member_role}` : ""}
                          </p>
                        </div>
                        <span>{membership.joined_at ? formatPrettyDate(membership.joined_at) : group.status}</span>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="person-section-empty">
                  <p>No group memberships are in the system for this person yet.</p>
                </div>
              )}
            </article>

            <article className="panel-card person-section-card">
              <div className="panel-header">
                <div>
                  <h2>Notes</h2>
                  <p className="person-section-subtitle">Sensitive internal notes for authorized admins.</p>
                </div>
                {canWriteNotes ? (
                  <AddNoteModal
                    activeTab={activeTab}
                    personId={person.id}
                    tenantSlug={context.access.activeMembership.tenant.slug}
                  />
                ) : null}
              </div>

              {canReadNotes ? (
                personNotes.length > 0 ? (
                  <div className="person-note-list">
                    {personNotes.map((note) => (
                      <article className="person-note-card" key={note.id}>
                        <div className="person-note-header">
                          <strong>{note.title ?? "Internal note"}</strong>
                          <span>{formatPrettyDate(note.created_at)}</span>
                        </div>
                        <p>{note.body}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="person-section-empty">
                    <p>No internal notes are stored for this person yet.</p>
                  </div>
                )
              ) : (
                <div className="person-section-empty">
                  <p>Notes are restricted to elevated tenant roles and are hidden on this account.</p>
                </div>
              )}
            </article>
          </div>
        </div>
      ) : activeTab === "family" ? (
        <div className="person-family-view">
          <article className="panel-card person-section-card">
            <div className="panel-header">
              <div>
                <h2>Family</h2>
                {primaryFamily?.details?.household_name ? (
                  <p className="person-section-subtitle">{primaryFamily.details.household_name}</p>
                ) : (
                  <p className="person-section-subtitle">No family unit is connected to this person yet.</p>
                )}
              </div>

              <FamilyActions
                activeTab={activeTab}
                tenantSlug={context.access.activeMembership.tenant.slug}
                profilePerson={{
                  id: person.id,
                  first_name: person.first_name,
                  last_name: person.last_name
                }}
                existingFamily={primaryFamily?.details ?? null}
                availableFamilies={allFamilies.filter((family) => family.id !== primaryFamily?.details?.id)}
                availablePeople={allPeople.filter(
                  (candidate) =>
                    !assignedFamilyPersonIds.has(candidate.id) &&
                    !primaryFamily?.members.some((member) => member.person.id === candidate.id)
                )}
              />
            </div>

            {primaryFamily && primaryFamily.details ? (
              <div className="person-family-table-wrap">
                <table className="person-family-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Relationship</th>
                      <th>Age</th>
                      <th>Primary Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyRows.map((member) => (
                      <tr key={member.id}>
                        <td>
                          <Link className="person-family-link" href={buildTabHref(member.id, "profile")}>
                            {member.name}
                          </Link>
                        </td>
                        <td>{member.relationship}</td>
                        <td>{member.age}</td>
                        <td>{member.isPrimaryContact ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="person-section-empty">
                <p>No family relationships are connected to this person yet.</p>
              </div>
            )}
          </article>
        </div>
      ) : activeTab === "timeline" ? (
        <div className="person-family-view">
          <article className="panel-card person-section-card">
            <div className="panel-header">
              <div>
                <h2>Timeline</h2>
                <p className="person-section-subtitle">Attendance, account access, and profile activity for this person.</p>
              </div>
            </div>

            <div className="timeline-data-card">
              <strong>Giving</strong>
              <p>Giving data is not connected in the system yet, so there are no contribution events to show here.</p>
            </div>

            {timelineItems.length > 0 ? (
              <div className="person-timeline">
                {timelineItems.map((item) => (
                  <article className={`person-timeline-item tone-${item.tone}`} key={item.id}>
                    <div className="person-timeline-marker" aria-hidden="true" />
                    <div className="person-timeline-card">
                      <span className="person-timeline-date">{formatPrettyDate(item.date)}</span>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="person-section-empty">
                <p>No profile activity has been recorded for this person yet.</p>
              </div>
            )}
          </article>
        </div>
      ) : (
        <div className="person-family-view">
          <AccountAccessForm
            tenantSlug={context.access.activeMembership.tenant.slug}
            personId={person.id}
            initialEmail={invitation?.email ?? linkedProfileEmail ?? person.email ?? ""}
            initialRoleId={defaultRoleId}
            roles={roleOptions}
            linkedAccount={
              membershipForPerson
                ? {
                    email: linkedProfileEmail ?? person.email,
                    status: membershipForPerson.status,
                    roleName: membershipRole?.name ?? null
                  }
                : null
            }
            pendingInvitation={
              invitation && invitation.status === "pending"
                ? {
                    email: invitation.email,
                    status: invitation.status,
                    invitedAt: invitation.invited_at,
                    roleName: roleOptions.find((role) => role.id === invitation.role_id)?.name ?? null
                  }
                : null
            }
          />
        </div>
      )}

      <Link className="person-profile-back" href="/dashboard/people">
        ← Back to People
      </Link>
    </section>
  );
}
