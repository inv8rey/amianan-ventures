-- Storage hardening. Run in the Supabase SQL Editor. Safe to run more than once.
-- 1. Contributors can only change their own profile photos and covers (admins can manage all).
-- 2. Public upload folders only accept images up to 5 MB.

-- Profile photos are saved as avatars/<user id>-<time>.<ext>
DROP POLICY IF EXISTS "contributor_photo_upload" ON storage.objects;
CREATE POLICY "contributor_photo_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contributor-photos'
              AND (name LIKE 'avatars/' || auth.uid()::text || '-%' OR public.is_admin()));

DROP POLICY IF EXISTS "contributor_photo_delete" ON storage.objects;
CREATE POLICY "contributor_photo_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'contributor-photos'
         AND (name LIKE 'avatars/' || auth.uid()::text || '-%' OR public.is_admin()));

-- Covers are saved as <user id>/<time>.<ext>
DROP POLICY IF EXISTS "cover_upload" ON storage.objects;
CREATE POLICY "cover_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'contributor-covers'
              AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

DROP POLICY IF EXISTS "cover_delete" ON storage.objects;
CREATE POLICY "cover_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'contributor-covers'
         AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin()));

-- Images only, 5 MB max, for the folders the public and contributors upload to
UPDATE storage.buckets
   SET file_size_limit = 5 * 1024 * 1024,
       allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
 WHERE id IN ('submission-assets', 'contributor-photos', 'contributor-covers', 'payment-proofs');

-- Check: should list the four rules above and the four bucket limits
SELECT 'rule' AS kind, policyname AS name, cmd || ' | ' || coalesce(qual, with_check) AS detail
  FROM pg_policies
 WHERE schemaname = 'storage' AND policyname IN ('contributor_photo_upload', 'contributor_photo_delete', 'cover_upload', 'cover_delete')
UNION ALL
SELECT 'bucket', id, coalesce(file_size_limit::text, 'no limit') || ' bytes | ' || coalesce(array_to_string(allowed_mime_types, ', '), 'any type')
  FROM storage.buckets
 WHERE id IN ('submission-assets', 'contributor-photos', 'contributor-covers', 'payment-proofs')
ORDER BY 1, 2;
