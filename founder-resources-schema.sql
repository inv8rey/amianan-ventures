-- Founder Resources feature
-- Run this manually in the Supabase SQL Editor.
-- 1. Catalog table for admin-uploaded resources (templates, guides, etc.)
-- 2. Lead-capture table recording the email a visitor enters before downloading
-- 3. Public storage bucket for the resource files themselves

-- ============================================================
-- 1. Resource catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.founder_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'Startup Planning',
  format          TEXT NOT NULL DEFAULT 'PDF',
  editable        BOOLEAN NOT NULL DEFAULT false,
  file_url        TEXT,
  status          TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'coming_soon')),
  featured        BOOLEAN NOT NULL DEFAULT false,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  download_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS set_founder_resources_updated_at ON public.founder_resources;
CREATE TRIGGER set_founder_resources_updated_at
  BEFORE UPDATE ON public.founder_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.founder_resources ENABLE ROW LEVEL SECURITY;

-- Public can only see published resources; logged-in admin can do everything
-- (same pattern as articles/events — see supabase-schema.sql).
DROP POLICY IF EXISTS "founder_resources_public_read" ON public.founder_resources;
CREATE POLICY "founder_resources_public_read" ON public.founder_resources
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "founder_resources_admin_all" ON public.founder_resources;
CREATE POLICY "founder_resources_admin_all" ON public.founder_resources
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 2. Email-gated download leads
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id  UUID REFERENCES public.founder_resources(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;
-- No public policies — only the service-role download API route reads/writes this table.

-- ============================================================
-- 3. Storage bucket for resource files (public read; admin-only upload via service role)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('founder-resources', 'founder-resources', true)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public read founder resource files" ON storage.objects;
CREATE POLICY "Public read founder resource files" ON storage.objects
  FOR SELECT USING (bucket_id = 'founder-resources');

DROP POLICY IF EXISTS "Authenticated upload founder resource files" ON storage.objects;
CREATE POLICY "Authenticated upload founder resource files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'founder-resources' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated delete founder resource files" ON storage.objects;
CREATE POLICY "Authenticated delete founder resource files" ON storage.objects
  FOR DELETE USING (bucket_id = 'founder-resources' AND auth.role() = 'authenticated');
