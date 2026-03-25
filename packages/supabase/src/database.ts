export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MembershipStatus = "invited" | "active" | "suspended";
export type GroupStatus = "active" | "archived";
export type AttendanceStatus = "present" | "absent" | "excused" | "guest";
export type InvitationStatus = "pending" | "accepted" | "revoked";
export type PermissionCode =
  | "tenant.manage"
  | "tenant.memberships.manage"
  | "roles.read"
  | "roles.write"
  | "people.read"
  | "people.write"
  | "people.notes.read"
  | "people.notes.write"
  | "families.read"
  | "families.write"
  | "groups.read"
  | "groups.write"
  | "attendance.read"
  | "attendance.write";

export interface Database {
  public: {
    Tables: {
      attendance_entries: {
        Row: {
          event_id: string;
          notes: string | null;
          person_id: string;
          status: AttendanceStatus;
          tenant_id: string;
        };
        Insert: {
          event_id: string;
          notes?: string | null;
          person_id: string;
          status?: AttendanceStatus;
          tenant_id: string;
        };
        Update: {
          event_id?: string;
          notes?: string | null;
          person_id?: string;
          status?: AttendanceStatus;
          tenant_id?: string;
        };
      };
      attendance_events: {
        Row: {
          created_at: string;
          group_id: string | null;
          id: string;
          name: string;
          occurred_at: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          name: string;
          occurred_at: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          group_id?: string | null;
          id?: string;
          name?: string;
          occurred_at?: string;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      email_campaigns: {
        Row: {
          audience: Json;
          created_at: string;
          design: Json;
          id: string;
          name: string;
          preview_text: string | null;
          provider: string | null;
          sent_at: string | null;
          status: string;
          subject: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          audience?: Json;
          created_at?: string;
          design?: Json;
          id?: string;
          name: string;
          preview_text?: string | null;
          provider?: string | null;
          sent_at?: string | null;
          status?: string;
          subject: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          audience?: Json;
          created_at?: string;
          design?: Json;
          id?: string;
          name?: string;
          preview_text?: string | null;
          provider?: string | null;
          sent_at?: string | null;
          status?: string;
          subject?: string;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          created_at: string;
          household_name: string;
          id: string;
          notes: string | null;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          household_name: string;
          id?: string;
          notes?: string | null;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          household_name?: string;
          id?: string;
          notes?: string | null;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      family_members: {
        Row: {
          family_id: string;
          is_primary_contact: boolean;
          person_id: string;
          relationship_to_family: string | null;
          tenant_id: string;
        };
        Insert: {
          family_id: string;
          is_primary_contact?: boolean;
          person_id: string;
          relationship_to_family?: string | null;
          tenant_id: string;
        };
        Update: {
          family_id?: string;
          is_primary_contact?: boolean;
          person_id?: string;
          relationship_to_family?: string | null;
          tenant_id?: string;
        };
      };
      form_submissions: {
        Row: {
          form_id: string;
          id: string;
          payload: Json;
          submitted_at: string;
          submitter_ip: string | null;
          tenant_id: string;
          user_agent: string | null;
        };
        Insert: {
          form_id: string;
          id?: string;
          payload: Json;
          submitted_at?: string;
          submitter_ip?: string | null;
          tenant_id: string;
          user_agent?: string | null;
        };
        Update: {
          form_id?: string;
          id?: string;
          payload?: Json;
          submitted_at?: string;
          submitter_ip?: string | null;
          tenant_id?: string;
          user_agent?: string | null;
        };
      };
      forms: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          published_at: string | null;
          schema: Json;
          slug: string;
          status: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          published_at?: string | null;
          schema?: Json;
          slug: string;
          status?: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          published_at?: string | null;
          schema?: Json;
          slug?: string;
          status?: string;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          group_id: string;
          joined_at: string | null;
          member_role: string | null;
          person_id: string;
          status: string;
          tenant_id: string;
        };
        Insert: {
          group_id: string;
          joined_at?: string | null;
          member_role?: string | null;
          person_id: string;
          status?: string;
          tenant_id: string;
        };
        Update: {
          group_id?: string;
          joined_at?: string | null;
          member_role?: string | null;
          person_id?: string;
          status?: string;
          tenant_id?: string;
        };
      };
      groups: {
        Row: {
          created_at: string;
          group_type: string;
          id: string;
          leader_person_id: string | null;
          name: string;
          status: GroupStatus;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          group_type?: string;
          id?: string;
          leader_person_id?: string | null;
          name: string;
          status?: GroupStatus;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          group_type?: string;
          id?: string;
          leader_person_id?: string | null;
          name?: string;
          status?: GroupStatus;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      membership_roles: {
        Row: {
          membership_id: string;
          role_id: string;
          tenant_id: string;
        };
        Insert: {
          membership_id: string;
          role_id: string;
          tenant_id: string;
        };
        Update: {
          membership_id?: string;
          role_id?: string;
          tenant_id?: string;
        };
      };
      tenant_invitations: {
        Row: {
          accepted_at: string | null;
          accepted_membership_id: string | null;
          created_at: string;
          email: string;
          id: string;
          invited_at: string;
          invited_by_membership_id: string | null;
          person_id: string;
          revoked_at: string | null;
          role_id: string;
          status: InvitationStatus;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_membership_id?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          invited_at?: string;
          invited_by_membership_id?: string | null;
          person_id: string;
          revoked_at?: string | null;
          role_id: string;
          status?: InvitationStatus;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_membership_id?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          invited_at?: string;
          invited_by_membership_id?: string | null;
          person_id?: string;
          revoked_at?: string | null;
          role_id?: string;
          status?: InvitationStatus;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          birth_date: string | null;
          created_at: string;
          email: string | null;
          first_name: string;
          id: string;
          is_active: boolean;
          last_name: string;
          phone: string | null;
          preferred_name: string | null;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          birth_date?: string | null;
          created_at?: string;
          email?: string | null;
          first_name: string;
          id?: string;
          is_active?: boolean;
          last_name: string;
          phone?: string | null;
          preferred_name?: string | null;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          birth_date?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string;
          id?: string;
          is_active?: boolean;
          last_name?: string;
          phone?: string | null;
          preferred_name?: string | null;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      person_notes: {
        Row: {
          author_membership_id: string | null;
          body: string;
          created_at: string;
          id: string;
          person_id: string;
          tenant_id: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          author_membership_id?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          person_id: string;
          tenant_id: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          author_membership_id?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          person_id?: string;
          tenant_id?: string;
          title?: string | null;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          code: PermissionCode;
          description: string;
          label: string;
        };
        Insert: {
          code: PermissionCode;
          description: string;
          label: string;
        };
        Update: {
          code?: PermissionCode;
          description?: string;
          label?: string;
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
      };
      role_permissions: {
        Row: {
          permission_code: PermissionCode;
          role_id: string;
        };
        Insert: {
          permission_code: PermissionCode;
          role_id: string;
        };
        Update: {
          permission_code?: PermissionCode;
          role_id?: string;
        };
      };
      roles: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_system: boolean;
          key: string;
          name: string;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key: string;
          name: string;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_system?: boolean;
          key?: string;
          name?: string;
          tenant_id?: string;
          updated_at?: string;
        };
      };
      tenant_memberships: {
        Row: {
          created_at: string;
          id: string;
          is_primary: boolean;
          person_id: string | null;
          status: MembershipStatus;
          tenant_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          person_id?: string | null;
          status?: MembershipStatus;
          tenant_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_primary?: boolean;
          person_id?: string | null;
          status?: MembershipStatus;
          tenant_id?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_person_tenant_account_invitation: {
        Args: {
          target_email: string;
          target_person_id: string;
          target_role_id: string;
          target_tenant_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
