create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  name text not null,
  subject text not null,
  preview_text text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'sent')),
  design jsonb not null default '[]'::jsonb,
  audience jsonb not null default '{}'::jsonb,
  provider text,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_email_campaigns_tenant_id
on public.email_campaigns (tenant_id, updated_at desc);

drop trigger if exists set_email_campaigns_updated_at on public.email_campaigns;
create trigger set_email_campaigns_updated_at
before update on public.email_campaigns
for each row execute procedure public.set_updated_at();

alter table public.email_campaigns enable row level security;

create policy "tenant members can read email campaigns"
on public.email_campaigns
for select
using (public.is_tenant_member(tenant_id));

create policy "communication managers can manage email campaigns"
on public.email_campaigns
for all
using (public.has_tenant_permission(tenant_id, 'people.write'))
with check (public.has_tenant_permission(tenant_id, 'people.write'));
