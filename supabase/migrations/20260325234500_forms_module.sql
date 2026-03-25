create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  schema jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  form_id uuid not null references public.forms (id) on delete cascade,
  payload jsonb not null,
  submitted_at timestamptz not null default timezone('utc', now()),
  submitter_ip text,
  user_agent text
);

create index if not exists idx_forms_tenant_id on public.forms (tenant_id);
create index if not exists idx_form_submissions_form_id on public.form_submissions (form_id, submitted_at desc);

drop trigger if exists set_forms_updated_at on public.forms;
create trigger set_forms_updated_at
before update on public.forms
for each row execute procedure public.set_updated_at();

alter table public.forms enable row level security;
alter table public.form_submissions enable row level security;

create policy "tenant members can read forms"
on public.forms
for select
using (public.is_tenant_member(tenant_id) or status = 'published');

create policy "form managers can manage forms"
on public.forms
for all
using (public.has_tenant_permission(tenant_id, 'people.write'))
with check (public.has_tenant_permission(tenant_id, 'people.write'));

create policy "tenant managers can read form submissions"
on public.form_submissions
for select
using (public.has_tenant_permission(tenant_id, 'people.write'));

create policy "public can submit published forms"
on public.form_submissions
for insert
with check (
  exists (
    select 1
    from public.forms form
    where form.id = form_submissions.form_id
      and form.tenant_id = form_submissions.tenant_id
      and form.status = 'published'
  )
);
