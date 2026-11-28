-- Amianan Intelligence MVP: run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.intelligence_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  source_type text not null check (source_type in ('rss','gdelt','philgeps','official')),
  stream text not null default 'news',
  region text not null default 'Northern Luzon',
  reliability smallint not null default 7 check (reliability between 1 and 10),
  enabled boolean not null default true,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.intelligence_items (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.intelligence_sources(id) on delete set null,
  source_url text not null unique,
  source_title text not null,
  source_excerpt text,
  title text not null,
  summary text not null default '',
  stream text not null check (stream in ('client','funding','program','news','partnership')),
  region text not null default 'Philippines',
  organization text,
  location text,
  published_at timestamptz,
  deadline_at timestamptz,
  deadline_text text,
  relevance_score smallint not null default 0 check (relevance_score between 0 and 100),
  confidence_score smallint not null default 0 check (confidence_score between 0 and 100),
  recommended_action text not null default 'MONITOR' check (recommended_action in ('CONTACT','APPLY','PARTNER','PUBLISH','MONITOR','IGNORE')),
  evidence text,
  inference text,
  tags text[] not null default '{}',
  review_status text not null default 'new' check (review_status in ('new','saved','in_progress','actioned','dismissed')),
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists intelligence_items_stream_idx on public.intelligence_items(stream);
create index if not exists intelligence_items_score_idx on public.intelligence_items(relevance_score desc);
create index if not exists intelligence_items_deadline_idx on public.intelligence_items(deadline_at);
create index if not exists intelligence_items_review_idx on public.intelligence_items(review_status);

create table if not exists public.intelligence_scan_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('running','completed','failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  sources_checked integer not null default 0,
  items_collected integer not null default 0,
  items_added integer not null default 0,
  error text
);

create table if not exists public.intelligence_review_activity (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.intelligence_items(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.intelligence_sources enable row level security;
alter table public.intelligence_items enable row level security;
alter table public.intelligence_scan_runs enable row level security;
alter table public.intelligence_review_activity enable row level security;

do $$ declare t text; begin
  foreach t in array array['intelligence_sources','intelligence_items','intelligence_scan_runs','intelligence_review_activity'] loop
    execute format('drop policy if exists "Admins manage %s" on public.%I', t, t);
    execute format('create policy "Admins manage %s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end $$;

grant select, insert, update, delete on public.intelligence_sources, public.intelligence_items, public.intelligence_scan_runs, public.intelligence_review_activity to authenticated;

insert into public.intelligence_sources (name,url,source_type,stream,region,reliability) values
('Startup Philippines','https://startup.gov.ph/','official','program','Philippines',8),
('Department of Science and Technology','https://www.dost.gov.ph/','official','funding','Philippines',9),
('Department of Information and Communications Technology','https://dict.gov.ph/','official','program','Philippines',9),
('Department of Trade and Industry','https://www.dti.gov.ph/','official','client','Philippines',9),
('PhilGEPS Open Data','https://philgeps.ebizolution.net/open-data','philgeps','client','Philippines',10),
('GDELT — Northern Luzon innovation','https://api.gdeltproject.org/api/v2/doc/doc?query=(startup%20OR%20innovation)%20(Northern%20Luzon%20OR%20Baguio)&mode=ArtList&format=rss&maxrecords=50&sort=DateDesc','gdelt','news','Northern Luzon',5)
on conflict (url) do nothing;
