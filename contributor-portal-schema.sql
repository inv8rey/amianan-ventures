-- ============================================================
-- Contributor Portal Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Contributor Profiles (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contributor_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  role         TEXT CHECK (role IN ('founder','tbi_staff','student','ecosystem_builder','researcher','other')),
  organization TEXT,
  region       TEXT,
  bio          TEXT CHECK (char_length(bio) <= 300),
  photo_url    TEXT,
  linkedin_url TEXT,
  facebook_url TEXT,
  website_url  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER set_contributor_profiles_updated_at
  BEFORE UPDATE ON public.contributor_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.contributor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contributor_select_own" ON public.contributor_profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "contributor_insert_own" ON public.contributor_profiles
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "contributor_update_own" ON public.contributor_profiles
  FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());


-- 2. Contributor Submissions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contributor_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID NOT NULL REFERENCES public.contributor_profiles(id) ON DELETE CASCADE,
  content_type   TEXT NOT NULL CHECK (content_type IN (
    'founder_story','opinion_essay','program_recap','ecosystem_spotlight','field_notes'
  )),
  headline       TEXT NOT NULL,
  summary        TEXT NOT NULL,
  region         TEXT,
  sector         TEXT,
  draft_type     TEXT NOT NULL DEFAULT 'text' CHECK (draft_type IN ('text','gdocs')),
  draft_content  TEXT,
  gdocs_url      TEXT,
  status         TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted','under_review','revision_requested','approved','rejected','published'
  )),
  revision_notes TEXT,
  editor_notes   TEXT,
  published_url  TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ,
  published_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE TRIGGER set_contributor_submissions_updated_at
  BEFORE UPDATE ON public.contributor_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.contributor_submissions ENABLE ROW LEVEL SECURITY;

-- Contributors can read their own submissions
CREATE POLICY "contributor_select_own_subs" ON public.contributor_submissions
  FOR SELECT USING (contributor_id = auth.uid());

-- Contributors can insert new submissions
CREATE POLICY "contributor_insert_subs" ON public.contributor_submissions
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

-- Contributors can update their own submissions ONLY when status is revision_requested
CREATE POLICY "contributor_update_revision" ON public.contributor_submissions
  FOR UPDATE
  USING (contributor_id = auth.uid() AND status = 'revision_requested')
  WITH CHECK (contributor_id = auth.uid());


-- 3. Storage bucket for contributor profile photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('contributor-photos', 'contributor-photos', true)
ON CONFLICT DO NOTHING;

-- Public can view photos
CREATE POLICY "contributor_photo_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'contributor-photos');

-- Authenticated users can upload photos
CREATE POLICY "contributor_photo_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'contributor-photos' AND auth.role() = 'authenticated');

-- Authenticated users can delete their own photos
CREATE POLICY "contributor_photo_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'contributor-photos' AND auth.role() = 'authenticated');
