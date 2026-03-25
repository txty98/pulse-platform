create table if not exists public.person_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  person_id uuid not null,
  author_membership_id uuid,
  title text,
  body text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  foreign key (tenant_id, person_id)
    references public.people (tenant_id, id)
    on delete cascade,
  foreign key (tenant_id, author_membership_id)
    references public.tenant_memberships (tenant_id, id)
    on delete set null
);

create index if not exists idx_person_notes_tenant_person
on public.person_notes (tenant_id, person_id, created_at desc);

insert into public.permissions (code, label, description)
values
  ('people.notes.read', 'Read person notes', 'View sensitive internal notes on person records.'),
  ('people.notes.write', 'Manage person notes', 'Create and update sensitive internal notes on person records.')
on conflict (code) do update
  set label = excluded.label,
      description = excluded.description;

insert into public.role_permissions (role_id, permission_code)
select role.id, permission.code
from public.roles role
join public.permissions permission on permission.code in ('people.notes.read', 'people.notes.write')
where role.key = 'owner'
on conflict do nothing;

insert into public.role_permissions (role_id, permission_code)
select role.id, permission.code
from public.roles role
join public.permissions permission on permission.code in ('people.notes.read', 'people.notes.write')
where role.key = 'admin'
on conflict do nothing;

drop trigger if exists set_person_notes_updated_at on public.person_notes;
create trigger set_person_notes_updated_at
before update on public.person_notes
for each row execute procedure public.set_updated_at();

alter table public.person_notes enable row level security;

create policy "note readers can read person notes"
on public.person_notes
for select
using (public.has_tenant_permission(tenant_id, 'people.notes.read'));

create policy "note managers can manage person notes"
on public.person_notes
for all
using (public.has_tenant_permission(tenant_id, 'people.notes.write'))
with check (public.has_tenant_permission(tenant_id, 'people.notes.write'));
