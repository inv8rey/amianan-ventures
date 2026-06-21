-- Add click tracking to featured_listings
-- Run this in Supabase Dashboard → SQL Editor.

ALTER TABLE public.featured_listings
  ADD COLUMN IF NOT EXISTS clicks INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_featured_listing_clicks(listing_id UUID)
RETURNS void AS $$
  UPDATE public.featured_listings SET clicks = clicks + 1 WHERE id = listing_id;
$$ LANGUAGE sql;
