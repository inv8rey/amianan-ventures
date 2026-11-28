-- Admin lockdown: only the emails listed in public.admin_users can administer the site.
-- Before this, any signed-in account (including contributors) had admin rights.
-- Run in the Supabase SQL Editor. Safe to run more than once.
-- It runs as one transaction: if anything fails, nothing changes.

-- ============================================================
-- STEP 1: The admin list. Add more emails here if needed.
-- Each one must already exist under Authentication > Users.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_users (
  email      TEXT PRIMARY KEY CHECK (email = lower(email)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.admin_users (email) VALUES
  ('amiananventures@gmail.com')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Safety checks, so you cannot lock yourself out
-- ============================================================
DO $$
DECLARE missing TEXT;
BEGIN
  SELECT string_agg(a.email, ', ') INTO missing
    FROM public.admin_users a
   WHERE NOT EXISTS (SELECT 1 FROM auth.users u
                      WHERE lower(u.email) = a.email AND u.email_confirmed_at IS NOT NULL);
  IF NOT EXISTS (SELECT 1 FROM public.admin_users) THEN
    RAISE EXCEPTION 'No admin emails listed. Check STEP 1 and run again. Nothing was changed.';
  END IF;
  IF missing IS NOT NULL THEN
    RAISE EXCEPTION 'No confirmed account for: %. Create it under Authentication > Users (Auto Confirm), or fix the spelling. Nothing was changed.', missing;
  END IF;
END $$;

-- Nobody reads or edits this table through the website; manage it here in the SQL Editor.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon, authenticated;

-- ============================================================
-- 3. The single admin test used by the database and the website
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
      JOIN public.admin_users a ON a.email = lower(u.email)
     WHERE u.id = auth.uid() AND u.email_confirmed_at IS NOT NULL
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ============================================================
-- 4. The directory table had no access rules at all
-- ============================================================
DO $$
BEGIN
  IF to_regclass('public.directory') IS NOT NULL
     AND NOT (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass('public.directory')) THEN
    ALTER TABLE public.directory ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "directory_public_read" ON public.directory FOR SELECT USING (true);
    CREATE POLICY "directory_admin_all" ON public.directory
      FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

-- ============================================================
-- 5. Replace every "any signed-in user" rule with "admins only".
--    Contributor upload folders stay open to signed-in contributors.
-- ============================================================
DO $$
DECLARE
  p        RECORD;
  new_qual TEXT;
  new_chk  TEXT;
  pattern  CONSTANT TEXT :=
    '(\( SELECT auth\.role\(\) AS role\)|auth\.role\(\)) = ''authenticated''::text';
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, roles, qual, with_check
      FROM pg_policies
     WHERE schemaname IN ('public', 'storage')
  LOOP
    -- Policies that contributors need
    IF concat_ws(' ', p.qual, p.with_check) ~ '(contributor-photos|contributor-covers|submission-assets|payment-proofs|auth\.uid\(\))' THEN
      CONTINUE;
    END IF;

    new_qual := regexp_replace(p.qual, pattern, 'public.is_admin()', 'g');
    new_chk  := regexp_replace(p.with_check, pattern, 'public.is_admin()', 'g');

    -- Rules written as "TO authenticated USING (true)"
    IF p.roles = '{authenticated}'::name[] THEN
      IF new_qual = 'true' THEN new_qual := 'public.is_admin()'; END IF;
      IF new_chk  = 'true' THEN new_chk  := 'public.is_admin()'; END IF;
    END IF;

    IF new_qual IS DISTINCT FROM p.qual OR new_chk IS DISTINCT FROM p.with_check THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I', p.policyname, p.schemaname, p.tablename)
        || CASE WHEN new_qual IS NOT NULL THEN format(' USING (%s)', new_qual) ELSE '' END
        || CASE WHEN new_chk  IS NOT NULL THEN format(' WITH CHECK (%s)', new_chk) ELSE '' END;
    END IF;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 6. Report: send this result back for review
-- ============================================================
SELECT 'admin' AS kind, email AS name, '' AS detail FROM public.admin_users
UNION ALL
SELECT 'TABLE WITHOUT RULES', c.relname, 'row level security is off'
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
UNION ALL
SELECT 'rule', schemaname || '.' || tablename || ' : ' || policyname,
       cmd || ' | ' || coalesce(qual, '-') || ' | ' || coalesce(with_check, '-')
  FROM pg_policies WHERE schemaname IN ('public', 'storage')
 ORDER BY 1, 2;
