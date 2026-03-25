import type { User } from "@supabase/supabase-js";
import type { Database, MembershipStatus, PermissionCode } from "./database";

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
}

export interface RoleSummary {
  id: string;
  key: string;
  name: string;
}

export interface ProfileSummary {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface TenantMembershipSummary {
  id: string;
  isPrimary: boolean;
  status: MembershipStatus;
  tenant: TenantSummary;
  roles: RoleSummary[];
}

export interface TenantAccessContext {
  activeMembership: TenantMembershipSummary | null;
  memberships: TenantMembershipSummary[];
  profile: ProfileSummary | null;
  user: User | null;
}

type TenantAccessClient = {
  auth: {
    getUser(): Promise<{
      data: {
        user: User | null;
      };
    }>;
  };
  from(table: string): any;
};

type MembershipQueryRow = {
  id: string;
  is_primary: boolean;
  status: MembershipStatus;
  tenant: TenantSummary | TenantSummary[] | null;
};

type MembershipRoleQueryRow = {
  membership_id: string;
  role: RoleSummary | RoleSummary[] | null;
};

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function resolveActiveMembership(
  memberships: TenantMembershipSummary[],
  preferredTenantSlug?: string | null
) {
  const activeMemberships = memberships.filter((membership) => membership.status === "active");

  if (preferredTenantSlug) {
    const matchedMembership = activeMemberships.find(
      (membership) => membership.tenant.slug === preferredTenantSlug
    );

    if (matchedMembership) {
      return matchedMembership;
    }
  }

  return activeMemberships.find((membership) => membership.isPrimary) ?? activeMemberships[0] ?? null;
}

export async function listTenantMembershipsForUser(
  supabase: TenantAccessClient,
  userId: string
) {
  const membershipResult = await supabase
    .from("tenant_memberships")
    .select("id, is_primary, status, tenant:tenants(id, name, slug)")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (membershipResult.error) {
    throw membershipResult.error;
  }

  const membershipRows = (membershipResult.data ?? []) as MembershipQueryRow[];
  const membershipIds = membershipRows.map((membership) => membership.id);

  const rolesByMembership = new Map<string, RoleSummary[]>();

  if (membershipIds.length > 0) {
    const roleResult = await supabase
      .from("membership_roles")
      .select("membership_id, role:roles(id, key, name)")
      .in("membership_id", membershipIds);

    if (roleResult.error) {
      throw roleResult.error;
    }

    for (const row of (roleResult.data ?? []) as MembershipRoleQueryRow[]) {
      const role = firstRelation(row.role);

      if (!role) {
        continue;
      }

      const roles = rolesByMembership.get(row.membership_id) ?? [];
      roles.push(role);
      rolesByMembership.set(row.membership_id, roles);
    }
  }

  return membershipRows
    .map((membership) => {
      const tenant = firstRelation(membership.tenant);

      if (!tenant) {
        return null;
      }

      return {
        id: membership.id,
        isPrimary: membership.is_primary,
        status: membership.status,
        tenant,
        roles: rolesByMembership.get(membership.id) ?? []
      } satisfies TenantMembershipSummary;
    })
    .filter((membership): membership is TenantMembershipSummary => membership !== null);
}

export async function getTenantAccessContext(
  supabase: TenantAccessClient,
  preferredTenantSlug?: string | null
): Promise<TenantAccessContext> {
  const userResult = await supabase.auth.getUser();
  const user = userResult.data.user;

  if (!user) {
    return {
      user: null,
      profile: null,
      memberships: [],
      activeMembership: null
    };
  }

  const [profileResult, memberships] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    listTenantMembershipsForUser(supabase, user.id)
  ]);

  if (profileResult.error) {
    throw profileResult.error;
  }

  const profile = profileResult.data as ProfileRow | null;

  return {
    user,
    profile: profile
      ? {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url
        }
      : null,
    memberships,
    activeMembership: resolveActiveMembership(memberships, preferredTenantSlug)
  };
}

export const permissionCatalog: PermissionCode[] = [
  "tenant.manage",
  "tenant.memberships.manage",
  "roles.read",
  "roles.write",
  "people.read",
  "people.write",
  "people.notes.read",
  "people.notes.write",
  "families.read",
  "families.write",
  "groups.read",
  "groups.write",
  "attendance.read",
  "attendance.write"
];
