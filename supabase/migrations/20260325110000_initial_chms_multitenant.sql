create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug = lower(slug)),
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (id, slug)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.permissions (
  code text primary key,
  label text not null,
  description text not null
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended')),
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, user_id),
  unique (tenant_id, id)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, key),
  unique (tenant_id, id)
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_code text not null references public.permissions (code) on delete cascade,
  primary key (role_id, permission_code)
);

create table if not exists public.membership_roles (
  tenant_id uuid not null,
  membership_id uuid not null,
  role_id uuid not null,
  primary key (membership_id, role_id),
  foreign key (tenant_id, membership_id)
    references public.tenant_memberships (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, role_id)
    references public.roles (tenant_id, id)
    on delete cascade
);

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  household_name text not null,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, id)
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  preferred_name text,
  email text,
  phone text,
  birth_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, id)
);

create table if not exists public.family_members (
  tenant_id uuid not null,
  family_id uuid not null,
  person_id uuid not null,
  relationship_to_family text,
  is_primary_contact boolean not null default false,
  primary key (family_id, person_id),
  foreign key (tenant_id, family_id)
    references public.families (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete cascade
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  group_type text not null default 'group',
  status text not null default 'active' check (status in ('active', 'archived')),
  leader_person_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, id),
  foreign key (tenant_id, leader_person_id)
    references public.people (tenant_id, id)
    on delete set null
);

create table if not exists public.group_members (
  tenant_id uuid not null,
  group_id uuid not null,
  person_id uuid not null,
  status text not null default 'active',
  member_role text,
  joined_at date,
  primary key (group_id, person_id),
  foreign key (tenant_id, group_id)
    references public.groups (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete cascade
);

create table if not exists public.attendance_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  group_id uuid,
  name text not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, id),
  foreign key (tenant_id, group_id)
    references public.groups (tenant_id, id)
    on delete set null
);

create table if not exists public.attendance_entries (
  tenant_id uuid not null,
  event_id uuid not null,
  person_id uuid not null,
  status text not null default 'present' check (status in ('present', 'absent', 'excused', 'guest')),
  notes text,
  primary key (event_id, person_id),
  foreign key (tenant_id, event_id)
    references public.attendance_events (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete cascade
);

create index if not exists idx_tenant_memberships_user_id on public.tenant_memberships (user_id);
create index if not exists idx_tenant_memberships_tenant_id on public.tenant_memberships (tenant_id);
create index if not exists idx_roles_tenant_id on public.roles (tenant_id);
create index if not exists idx_people_tenant_id on public.people (tenant_id);
create index if not exists idx_families_tenant_id on public.families (tenant_id);
create index if not exists idx_groups_tenant_id on public.groups (tenant_id);
create index if not exists idx_attendance_events_tenant_id on public.attendance_events (tenant_id);
create index if not exists idx_attendance_entries_tenant_id on public.attendance_entries (tenant_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships membership
    where membership.tenant_id = target_tenant_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
  );
$$;

create or replace function public.has_tenant_permission(
  target_tenant_id uuid,
  target_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships membership
    join public.membership_roles membership_role
      on membership_role.tenant_id = membership.tenant_id
     and membership_role.membership_id = membership.id
    join public.role_permissions role_permission
      on role_permission.role_id = membership_role.role_id
    where membership.tenant_id = target_tenant_id
      and membership.user_id = auth.uid()
      and membership.status = 'active'
      and role_permission.permission_code = target_permission_code
  );
$$;

insert into public.permissions (code, label, description)
values
  ('tenant.manage', 'Manage tenant', 'Create and manage tenant configuration.'),
  ('tenant.memberships.manage', 'Manage memberships', 'Invite, suspend, and maintain tenant memberships.'),
  ('roles.read', 'Read roles', 'View role and permission assignments.'),
  ('roles.write', 'Manage roles', 'Create and update tenant roles and permissions.'),
  ('people.read', 'Read people', 'View people records inside the tenant.'),
  ('people.write', 'Manage people', 'Create and update people records inside the tenant.'),
  ('families.read', 'Read families', 'View families and household relationships.'),
  ('families.write', 'Manage families', 'Create and update families and household relationships.'),
  ('groups.read', 'Read groups', 'View groups and group membership.'),
  ('groups.write', 'Manage groups', 'Create and update groups and group membership.'),
  ('attendance.read', 'Read attendance', 'View attendance events and entries.'),
  ('attendance.write', 'Manage attendance', 'Create and update attendance events and entries.')
on conflict (code) do update
  set label = excluded.label,
      description = excluded.description;

create or replace function public.seed_default_roles_for_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role_id uuid;
  admin_role_id uuid;
  group_leader_role_id uuid;
begin
  insert into public.roles (tenant_id, key, name, description, is_system)
  values
    (new.id, 'owner', 'Owner', 'Full tenant access.', true),
    (new.id, 'admin', 'Admin', 'Operational administration across the tenant.', true),
    (new.id, 'group_leader', 'Group Leader', 'Manage groups and attendance with read access to people and families.', true)
  on conflict (tenant_id, key) do nothing;

  select id into owner_role_id from public.roles where tenant_id = new.id and key = 'owner';
  select id into admin_role_id from public.roles where tenant_id = new.id and key = 'admin';
  select id into group_leader_role_id from public.roles where tenant_id = new.id and key = 'group_leader';

  insert into public.role_permissions (role_id, permission_code)
  select owner_role_id, permission.code
  from public.permissions permission
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  values
    (admin_role_id, 'tenant.memberships.manage'),
    (admin_role_id, 'roles.read'),
    (admin_role_id, 'roles.write'),
    (admin_role_id, 'people.read'),
    (admin_role_id, 'people.write'),
    (admin_role_id, 'families.read'),
    (admin_role_id, 'families.write'),
    (admin_role_id, 'groups.read'),
    (admin_role_id, 'groups.write'),
    (admin_role_id, 'attendance.read'),
    (admin_role_id, 'attendance.write')
  on conflict do nothing;

  insert into public.role_permissions (role_id, permission_code)
  values
    (group_leader_role_id, 'people.read'),
    (group_leader_role_id, 'families.read'),
    (group_leader_role_id, 'groups.read'),
    (group_leader_role_id, 'groups.write'),
    (group_leader_role_id, 'attendance.read'),
    (group_leader_role_id, 'attendance.write')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_tenant_created_seed_roles on public.tenants;
create trigger on_tenant_created_seed_roles
after insert on public.tenants
for each row execute procedure public.seed_default_roles_for_tenant();

create or replace function public.enforce_single_primary_membership()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.is_primary then
    update public.tenant_memberships
    set is_primary = false,
        updated_at = timezone('utc', now())
    where user_id = new.user_id
      and id <> new.id;
  end if;

  return new;
end;
$$;

drop trigger if exists set_tenants_updated_at on public.tenants;
create trigger set_tenants_updated_at
before update on public.tenants
for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_tenant_memberships_updated_at on public.tenant_memberships;
create trigger set_tenant_memberships_updated_at
before update on public.tenant_memberships
for each row execute procedure public.set_updated_at();

drop trigger if exists set_roles_updated_at on public.roles;
create trigger set_roles_updated_at
before update on public.roles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_families_updated_at on public.families;
create trigger set_families_updated_at
before update on public.families
for each row execute procedure public.set_updated_at();

drop trigger if exists set_people_updated_at on public.people;
create trigger set_people_updated_at
before update on public.people
for each row execute procedure public.set_updated_at();

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
before update on public.groups
for each row execute procedure public.set_updated_at();

drop trigger if exists set_attendance_events_updated_at on public.attendance_events;
create trigger set_attendance_events_updated_at
before update on public.attendance_events
for each row execute procedure public.set_updated_at();

drop trigger if exists one_primary_membership_per_user on public.tenant_memberships;
create trigger one_primary_membership_per_user
before insert or update on public.tenant_memberships
for each row execute procedure public.enforce_single_primary_membership();

alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.membership_roles enable row level security;
alter table public.permissions enable row level security;
alter table public.people enable row level security;
alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.attendance_events enable row level security;
alter table public.attendance_entries enable row level security;

create policy "profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles are updatable by owner"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "permissions readable by authenticated users"
on public.permissions
for select
using (auth.uid() is not null);

create policy "tenant members can read tenants"
on public.tenants
for select
using (public.is_tenant_member(id));

create policy "tenant managers can update tenants"
on public.tenants
for update
using (public.has_tenant_permission(id, 'tenant.manage'))
with check (public.has_tenant_permission(id, 'tenant.manage'));

create policy "tenant members can read memberships"
on public.tenant_memberships
for select
using (public.is_tenant_member(tenant_id));

create policy "tenant managers can manage memberships"
on public.tenant_memberships
for all
using (public.has_tenant_permission(tenant_id, 'tenant.memberships.manage'))
with check (public.has_tenant_permission(tenant_id, 'tenant.memberships.manage'));

create policy "tenant members can read roles"
on public.roles
for select
using (public.is_tenant_member(tenant_id));

create policy "role managers can manage roles"
on public.roles
for all
using (public.has_tenant_permission(tenant_id, 'roles.write'))
with check (public.has_tenant_permission(tenant_id, 'roles.write'));

create policy "tenant members can read role permissions"
on public.role_permissions
for select
using (
  exists (
    select 1
    from public.roles role
    where role.id = role_permissions.role_id
      and public.is_tenant_member(role.tenant_id)
  )
);

create policy "role managers can manage role permissions"
on public.role_permissions
for all
using (
  exists (
    select 1
    from public.roles role
    where role.id = role_permissions.role_id
      and public.has_tenant_permission(role.tenant_id, 'roles.write')
  )
)
with check (
  exists (
    select 1
    from public.roles role
    where role.id = role_permissions.role_id
      and public.has_tenant_permission(role.tenant_id, 'roles.write')
  )
);

create policy "tenant members can read membership roles"
on public.membership_roles
for select
using (public.is_tenant_member(tenant_id));

create policy "role managers can manage membership roles"
on public.membership_roles
for all
using (public.has_tenant_permission(tenant_id, 'roles.write'))
with check (public.has_tenant_permission(tenant_id, 'roles.write'));

create policy "tenant members can read people"
on public.people
for select
using (public.is_tenant_member(tenant_id));

create policy "people managers can manage people"
on public.people
for all
using (public.has_tenant_permission(tenant_id, 'people.write'))
with check (public.has_tenant_permission(tenant_id, 'people.write'));

create policy "tenant members can read families"
on public.families
for select
using (public.is_tenant_member(tenant_id));

create policy "family managers can manage families"
on public.families
for all
using (public.has_tenant_permission(tenant_id, 'families.write'))
with check (public.has_tenant_permission(tenant_id, 'families.write'));

create policy "tenant members can read family members"
on public.family_members
for select
using (public.is_tenant_member(tenant_id));

create policy "family managers can manage family members"
on public.family_members
for all
using (public.has_tenant_permission(tenant_id, 'families.write'))
with check (public.has_tenant_permission(tenant_id, 'families.write'));

create policy "tenant members can read groups"
on public.groups
for select
using (public.is_tenant_member(tenant_id));

create policy "group managers can manage groups"
on public.groups
for all
using (public.has_tenant_permission(tenant_id, 'groups.write'))
with check (public.has_tenant_permission(tenant_id, 'groups.write'));

create policy "tenant members can read group members"
on public.group_members
for select
using (public.is_tenant_member(tenant_id));

create policy "group managers can manage group members"
on public.group_members
for all
using (public.has_tenant_permission(tenant_id, 'groups.write'))
with check (public.has_tenant_permission(tenant_id, 'groups.write'));

create policy "tenant members can read attendance events"
on public.attendance_events
for select
using (public.is_tenant_member(tenant_id));

create policy "attendance managers can manage attendance events"
on public.attendance_events
for all
using (public.has_tenant_permission(tenant_id, 'attendance.write'))
with check (public.has_tenant_permission(tenant_id, 'attendance.write'));

create policy "tenant members can read attendance entries"
on public.attendance_entries
for select
using (public.is_tenant_member(tenant_id));

create policy "attendance managers can manage attendance entries"
on public.attendance_entries
for all
using (public.has_tenant_permission(tenant_id, 'attendance.write'))
with check (public.has_tenant_permission(tenant_id, 'attendance.write'));
