-- Public, cookie-based (anonymous) ratings for adverts.
-- One rating per device per advert (enforced via unique (advert_id, rater_id)).

CREATE TABLE IF NOT EXISTS public.advert_ratings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advert_id  uuid NOT NULL REFERENCES public.adverts(id) ON DELETE CASCADE,
  rater_id   text NOT NULL,
  rating     int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS advert_ratings_one_per_rater
  ON public.advert_ratings(advert_id, rater_id);

ALTER TABLE public.advert_ratings ENABLE ROW LEVEL SECURITY;

-- Optional public read/write policies (API route uses service role anyway).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'advert_ratings'
      AND policyname = 'Public can read ratings'
  ) THEN
    CREATE POLICY "Public can read ratings"
      ON public.advert_ratings
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'advert_ratings'
      AND policyname = 'Public can insert ratings'
  ) THEN
    CREATE POLICY "Public can insert ratings"
      ON public.advert_ratings
      FOR INSERT
      WITH CHECK (rating >= 1 AND rating <= 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'advert_ratings'
      AND policyname = 'Public can update own rating'
  ) THEN
    -- Can't truly guarantee ownership without auth; kept permissive for simplicity.
    -- API route enforces device-based identity via rater_id + unique constraint.
    CREATE POLICY "Public can update own rating"
      ON public.advert_ratings
      FOR UPDATE
      USING (true)
      WITH CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

