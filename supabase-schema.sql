-- =============================================
-- Amianan Ventures - Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================

-- Articles table
create table if not exists public.articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null check (category in ('news', 'founder-stories')),
  location text check (location in ('cordillera', 'cagayan-valley', 'ilocos-region', 'pangasinan', 'national')),
  author text not null default 'Amianan Ventures',
  cover_image text,
  tags text[] default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ⚠️  If you already ran the schema, add the location column with this migration:
-- alter table public.articles add column if not exists location text
--   check (location in ('cordillera', 'cagayan-valley', 'ilocos-region', 'pangasinan', 'national'));

-- Directory table
create table if not exists public.directory (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('startup', 'incubator', 'government', 'university', 'community')),
  sector text,
  city text,
  logo_url text,
  website text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ⚠️  Migrations (run if table already exists):
-- alter table public.directory add column if not exists featured boolean not null default false;
-- alter table public.events rename column location_url to event_url;
-- (or): alter table public.events add column if not exists event_url text;

-- Events table
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  description text not null,
  content text not null default '',
  date timestamptz not null,
  end_date timestamptz,
  location text not null,
  event_url text,
  cover_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on public.articles
  for each row execute function update_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.articles enable row level security;
alter table public.events enable row level security;

-- Public can read published content
create policy "Public read published articles"
  on public.articles for select
  using (status = 'published');

create policy "Public read published events"
  on public.events for select
  using (status = 'published');

-- Authenticated users (admin) can do everything
create policy "Admin full access articles"
  on public.articles for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Admin full access events"
  on public.events for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage bucket for article images
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict do nothing;

create policy "Public read article images"
  on storage.objects for select
  using (bucket_id = 'article-images');

create policy "Authenticated upload article images"
  on storage.objects for insert
  with check (bucket_id = 'article-images' and auth.role() = 'authenticated');

create policy "Authenticated delete article images"
  on storage.objects for delete
  using (bucket_id = 'article-images' and auth.role() = 'authenticated');

-- =============================================
-- Newsletter Subscribers
-- =============================================
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone can subscribe (anon insert)
create policy "Public subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only authenticated admin can read/update
create policy "Admin read newsletter"
  on public.newsletter_subscribers for select
  using (auth.role() = 'authenticated');

create policy "Admin update newsletter"
  on public.newsletter_subscribers for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- Form Submissions
-- =============================================
create table if not exists public.form_submissions (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('startup', 'partner', 'founder-story')),
  name text not null,
  email text not null,
  organization text,
  message text not null,
  extra_data jsonb,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.form_submissions enable row level security;

-- Anyone can submit a form (anon insert)
create policy "Public submit forms"
  on public.form_submissions for insert
  with check (true);

-- Only authenticated admin can read/update
create policy "Admin read submissions"
  on public.form_submissions for select
  using (auth.role() = 'authenticated');

create policy "Admin update submissions"
  on public.form_submissions for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- =============================================
-- Featured Listings
-- =============================================
create table if not exists public.featured_listings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  tagline text,
  description text,
  image_url text,
  cta_url text,
  sponsor_label text not null default 'Sponsored',
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger featured_listings_updated_at
  before update on public.featured_listings
  for each row execute function update_updated_at();

alter table public.featured_listings enable row level security;

create policy "Public read published featured listings"
  on public.featured_listings for select
  using (status = 'published');

create policy "Admin full access featured listings"
  on public.featured_listings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
