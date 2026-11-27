-- Opportunities feature (homepage sidebar + /opportunities directory)
-- Run this manually in the Supabase SQL Editor.
-- Deadlines are stored as timestamptz; the site renders them in Asia/Manila.

CREATE TABLE IF NOT EXISTS public.opportunities (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  category         TEXT NOT NULL CHECK (category IN (
                     'funding-grants', 'competition', 'program-incubation', 'events', 'partnerships', 'jobs-fellowships'
                   )),
  organization     TEXT NOT NULL,
  summary          TEXT,
  location         TEXT,                 -- geographic coverage, e.g. "Northern Luzon", "Nationwide"
  deadline         TIMESTAMPTZ NOT NULL, -- application deadline
  apply_url        TEXT,                 -- official application / opportunity page
  cover_image      TEXT,
  featured         BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS opportunities_published_deadline_idx
  ON public.opportunities (status, deadline);

-- Own updated_at helper, so this script doesn't depend on functions from other migrations.
CREATE OR REPLACE FUNCTION public.opportunities_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS opportunities_updated_at ON public.opportunities;
CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.opportunities_set_updated_at();

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Public sees published rows only; logged-in admin can do everything
-- (same pattern as articles/events/founder_resources).
DROP POLICY IF EXISTS "opportunities_public_read" ON public.opportunities;
CREATE POLICY "opportunities_public_read" ON public.opportunities
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "opportunities_admin_all" ON public.opportunities;
CREATE POLICY "opportunities_admin_all" ON public.opportunities
  FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Make the new table visible to the API straight away.
NOTIFY pgrst, 'reload schema';
