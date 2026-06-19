-- ============================================================
-- Get Featured / Spotlight Applications Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 0. Safety net: the updated_at trigger function should already exist
-- from contributor-portal-schema.sql, but recreate it idempotently in
-- case this script is run on a fresh database.
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 1. Spotlight Applications (linked to contributor_profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.spotlight_applications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id        UUID NOT NULL REFERENCES public.contributor_profiles(id) ON DELETE CASCADE,
  business_name         TEXT NOT NULL,
  contact_name          TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  website               TEXT,
  industry              TEXT,
  region                TEXT,
  what_you_do           TEXT,
  problem               TEXT,
  impact                TEXT,
  why_feature           TEXT,
  package               TEXT NOT NULL DEFAULT 'founding-rate',
  amount_php            NUMERIC NOT NULL DEFAULT 599,
  status                TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','submitted','under_review','approved','rejected',
    'awaiting_payment','payment_submitted','paid','in_production','published'
  )),
  payment_method        TEXT CHECK (payment_method IN ('gcash','maya','bdo','bpi','unionbank')),
  payment_reference     TEXT,
  payment_proof_url     TEXT,
  editor_notes          TEXT,
  published_url         TEXT,
  submitted_at          TIMESTAMPTZ,
  reviewed_at           TIMESTAMPTZ,
  payment_submitted_at  TIMESTAMPTZ,
  paid_at               TIMESTAMPTZ,
  published_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at (reuses the function created by contributor-portal-schema.sql)
DROP TRIGGER IF EXISTS set_spotlight_applications_updated_at ON public.spotlight_applications;
CREATE TRIGGER set_spotlight_applications_updated_at
  BEFORE UPDATE ON public.spotlight_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.spotlight_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spotlight_select_own" ON public.spotlight_applications;
CREATE POLICY "spotlight_select_own" ON public.spotlight_applications
  FOR SELECT USING (contributor_id = auth.uid());

DROP POLICY IF EXISTS "spotlight_insert_own" ON public.spotlight_applications;
CREATE POLICY "spotlight_insert_own" ON public.spotlight_applications
  FOR INSERT WITH CHECK (contributor_id = auth.uid());

-- Editable in every status EXCEPT once admin has locked it for production/publication
DROP POLICY IF EXISTS "spotlight_update_own" ON public.spotlight_applications;
CREATE POLICY "spotlight_update_own" ON public.spotlight_applications
  FOR UPDATE
  USING (contributor_id = auth.uid() AND status NOT IN ('in_production', 'published'))
  WITH CHECK (contributor_id = auth.uid());


-- 2. Storage bucket for payment proof screenshots
-- ============================================================
-- Private bucket; objects are path-scoped per user: {userId}/{filename}
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', false)
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "payment_proof_upload_own" ON storage.objects;
CREATE POLICY "payment_proof_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "payment_proof_read_own" ON storage.objects;
CREATE POLICY "payment_proof_read_own" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);
