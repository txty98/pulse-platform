create or replace function public.slugify(value text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.bootstrap_signup_tenant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  church_name text;
  base_slug text;
  candidate_slug text;
  slug_suffix integer := 0;
  created_tenant_id uuid;
  created_membership_id uuid;
  owner_role_id uuid;
begin
  church_name := nullif(trim(new.raw_user_meta_data ->> 'church_name'), '');

  if church_name is null then
    return new;
  end if;

  base_slug := public.slugify(church_name);

  if base_slug = '' then
    base_slug := 'church';
  end if;

  candidate_slug := base_slug;

  while exists (
    select 1
    from public.tenants tenant
    where tenant.slug = candidate_slug
  ) loop
    slug_suffix := slug_suffix + 1;
    candidate_slug := base_slug || '-' || slug_suffix::text;
  end loop;

  insert into public.tenants (name, slug)
  values (church_name, candidate_slug)
  returning id into created_tenant_id;

  insert into public.tenant_memberships (tenant_id, user_id, status, is_primary)
  values (created_tenant_id, new.id, 'active', true)
  returning id into created_membership_id;

  select role.id
  into owner_role_id
  from public.roles role
  where role.tenant_id = created_tenant_id
    and role.key = 'owner'
  limit 1;

  if owner_role_id is not null then
    insert into public.membership_roles (tenant_id, membership_id, role_id)
    values (created_tenant_id, created_membership_id, owner_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_bootstrap_tenant on auth.users;
create trigger on_auth_user_bootstrap_tenant
after insert on auth.users
for each row execute procedure public.bootstrap_signup_tenant();
