-- Lets admins set an expected publish date while a feature is in
-- production, and track per-deliverable completion (e.g. "Featured
-- Article" posted, "Homepage Feature" live) visible to both admin and
-- the applicant.
ALTER TABLE public.spotlight_applications
  ADD COLUMN IF NOT EXISTS scheduled_publish_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deliverables JSONB;
