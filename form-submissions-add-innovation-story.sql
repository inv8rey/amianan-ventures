-- Allow the new 'innovation-story' value in form_submissions.type
-- Run this in Supabase Dashboard → SQL Editor.
-- Finds whatever the live CHECK constraint is actually named (Postgres'
-- auto-generated name may differ from the default convention) and replaces it.

DO $$
DECLARE
  c_name TEXT;
BEGIN
  SELECT con.conname INTO c_name
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  WHERE rel.relname = 'form_submissions'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) LIKE '%type%'
  LIMIT 1;

  IF c_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.form_submissions DROP CONSTRAINT %I', c_name);
  END IF;
END $$;

ALTER TABLE public.form_submissions
  ADD CONSTRAINT form_submissions_type_check
  CHECK (type IN ('startup', 'partner', 'founder-story', 'spotlight', 'innovation-story'));
