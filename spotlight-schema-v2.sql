-- ============================================================
-- Get Featured / Spotlight Applications — align fields with
-- the public /founder-story submission form
-- Run this in Supabase Dashboard → SQL Editor (after spotlight-schema.sql)
-- ============================================================

ALTER TABLE public.spotlight_applications
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS social_link TEXT,
  ADD COLUMN IF NOT EXISTS story_answers JSONB,
  ADD COLUMN IF NOT EXISTS founder_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS startup_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS product_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS promo TEXT;

-- Superseded by story_answers (q1–q8, same questions as /founder-story)
ALTER TABLE public.spotlight_applications
  DROP COLUMN IF EXISTS what_you_do,
  DROP COLUMN IF EXISTS problem,
  DROP COLUMN IF EXISTS impact,
  DROP COLUMN IF EXISTS why_feature;
