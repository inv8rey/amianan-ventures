-- Lets the admin article editor store a custom focal point for the cover
-- image (CSS object-position value, e.g. "32% 71%") instead of always
-- cropping to center.
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_position TEXT DEFAULT '50% 50%';
