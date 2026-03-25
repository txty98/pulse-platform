alter table public.tenant_memberships
add column if not exists person_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tenant_memberships_person_id_fkey'
  ) then
    alter table public.tenant_memberships
    add constraint tenant_memberships_person_id_fkey
    foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete set null;
  end if;
end
$$;

create unique index if not exists idx_tenant_memberships_one_person_per_tenant
on public.tenant_memberships (tenant_id, person_id)
where person_id is not null;

create table if not exists public.tenant_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  person_id uuid not null,
  email text not null,
  role_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by_membership_id uuid,
  accepted_membership_id uuid,
  invited_at timestamptz not null default timezone('utc', now()),
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (tenant_id, person_id),
  foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, role_id)
    references public.roles (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, invited_by_membership_id)
    references public.tenant_memberships (tenant_id, id)
    on delete set null,
  foreign key (tenant_id, accepted_membership_id)
    references public.tenant_memberships (tenant_id, id)
    on delete set null
);

create unique index if not exists idx_tenant_invitations_unique_email_per_tenant
on public.tenant_invitations (tenant_id, lower(email));

create index if not exists idx_tenant_invitations_tenant_id
on public.tenant_invitations (tenant_id);

drop trigger if exists set_tenant_invitations_updated_at on public.tenant_invitations;
create trigger set_tenant_invitations_updated_at
before update on public.tenant_invitations
for each row execute procedure public.set_updated_at();

create or replace function public.apply_tenant_invitation_to_user(
  target_invitation_id uuid,
  target_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record public.tenant_invitations%rowtype;
  membership_record public.tenant_memberships%rowtype;
begin
  select *
  into invitation_record
  from public.tenant_invitations
  where id = target_invitation_id
    and status = 'pending'
  for update;

  if invitation_record.id is null then
    return null;
  end if;

  insert into public.tenant_memberships (
    tenant_id,
    user_id,
    person_id,
    status,
    is_primary
  )
  values (
    invitation_record.tenant_id,
    target_user_id,
    invitation_record.person_id,
    'active',
    false
  )
  on conflict (tenant_id, user_id) do update
    set person_id = excluded.person_id,
        status = 'active',
        updated_at = timezone('utc', now())
  returning *
  into membership_record;

  delete from public.membership_roles
  where membership_id = membership_record.id;

  insert into public.membership_roles (tenant_id, membership_id, role_id)
  values (invitation_record.tenant_id, membership_record.id, invitation_record.role_id)
  on conflict do nothing;

  update public.tenant_invitations
  set email = lower(email),
      status = 'accepted',
      accepted_membership_id = membership_record.id,
      accepted_at = timezone('utc', now()),
      revoked_at = null,
      updated_at = timezone('utc', now())
  where id = invitation_record.id;

  return membership_record.id;
end;
$$;

create or replace function public.accept_pending_tenant_invitations_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_record record;
begin
  for invitation_record in
    select invitation.id
    from public.tenant_invitations invitation
    where lower(invitation.email) = lower(new.email)
      and invitation.status = 'pending'
  loop
    perform public.apply_tenant_invitation_to_user(invitation_record.id, new.id);
  end loop;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_accept_tenant_invitations on auth.users;
create trigger on_auth_user_created_accept_tenant_invitations
after insert on auth.users
for each row execute procedure public.accept_pending_tenant_invitations_for_user();

create or replace function public.upsert_person_tenant_account_invitation(
  target_tenant_id uuid,
  target_person_id uuid,
  target_email text,
  target_role_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_email text := lower(trim(target_email));
  actor_membership_id uuid;
  existing_user_id uuid;
  invitation_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required.';
  end if;

  if normalized_email = '' then
    raise exception 'Email is required.';
  end if;

  if not public.has_tenant_permission(target_tenant_id, 'tenant.memberships.manage') then
    raise exception 'You do not have permission to manage tenant memberships.';
  end if;

  if not exists (
    select 1
    from public.people person
    where person.tenant_id = target_tenant_id
      and person.id = target_person_id
  ) then
    raise exception 'The selected person does not exist in this tenant.';
  end if;

  select profile.id
  into existing_user_id
  from public.profiles profile
  where lower(coalesce(profile.email, '')) = normalized_email
  limit 1;

  if exists (
    select 1
    from public.tenant_memberships membership
    where membership.tenant_id = target_tenant_id
      and membership.person_id = target_person_id
      and membership.user_id <> coalesce(existing_user_id, membership.user_id)
  ) then
    raise exception 'This person is already linked to a tenant user.';
  end if;

  if not exists (
    select 1
    from public.roles role
    where role.tenant_id = target_tenant_id
      and role.id = target_role_id
  ) then
    raise exception 'The selected role does not belong to this tenant.';
  end if;

  select membership.id
  into actor_membership_id
  from public.tenant_memberships membership
  where membership.tenant_id = target_tenant_id
    and membership.user_id = auth.uid()
    and membership.status = 'active'
  order by membership.is_primary desc, membership.created_at asc
  limit 1;

  insert into public.tenant_invitations (
    tenant_id,
    person_id,
    email,
    role_id,
    status,
    invited_by_membership_id,
    accepted_membership_id,
    invited_at,
    accepted_at,
    revoked_at
  )
  values (
    target_tenant_id,
    target_person_id,
    normalized_email,
    target_role_id,
    case when existing_user_id is null then 'pending' else 'accepted' end,
    actor_membership_id,
    null,
    timezone('utc', now()),
    case when existing_user_id is null then null else timezone('utc', now()) end,
    null
  )
  on conflict (tenant_id, person_id) do update
    set email = excluded.email,
        role_id = excluded.role_id,
        status = case when existing_user_id is null then 'pending' else 'accepted' end,
        invited_by_membership_id = excluded.invited_by_membership_id,
        accepted_membership_id = null,
        invited_at = timezone('utc', now()),
        accepted_at = case when existing_user_id is null then null else timezone('utc', now()) end,
        revoked_at = null,
        updated_at = timezone('utc', now())
  returning id into invitation_id;

  if existing_user_id is not null then
    perform public.apply_tenant_invitation_to_user(invitation_id, existing_user_id);
  end if;

  return invitation_id;
end;
$$;

alter table public.tenant_invitations enable row level security;

create policy "tenant members can read invitations"
on public.tenant_invitations
for select
using (public.is_tenant_member(tenant_id));

create policy "membership managers can manage invitations"
on public.tenant_invitations
for all
using (public.has_tenant_permission(tenant_id, 'tenant.memberships.manage'))
with check (public.has_tenant_permission(tenant_id, 'tenant.memberships.manage'));
