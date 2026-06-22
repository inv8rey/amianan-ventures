-- Lets applicants cancel their own Get Featured application. The status
-- CHECK constraint needs to allow the new 'cancelled' value.
ALTER TABLE public.spotlight_applications DROP CONSTRAINT IF EXISTS spotlight_applications_status_check;
ALTER TABLE public.spotlight_applications ADD CONSTRAINT spotlight_applications_status_check CHECK (status IN (
  'draft','submitted','under_review','approved','rejected',
  'awaiting_payment','payment_submitted','paid','in_production','published','cancelled'
));
