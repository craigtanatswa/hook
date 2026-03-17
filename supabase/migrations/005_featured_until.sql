-- Allow featured listings to expire after N days.
-- If featured_until is NULL, treat the listing as not time-limited (legacy/manual).

ALTER TABLE public.adverts
  ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Optional: keep things consistent for existing featured listings.
-- If you already have featured=true rows and want them to stay featured for 7 days:
-- UPDATE public.adverts
-- SET featured_until = now() + interval '7 days'
-- WHERE featured = true AND featured_until IS NULL;

