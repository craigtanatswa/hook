-- Single-row table for global site settings (e.g. maintenance mode).
-- Only service_role should read/write this table.

CREATE TABLE IF NOT EXISTS public.site_settings (
  id           int  PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  maintenance  boolean NOT NULL DEFAULT false,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Seed the single row
INSERT INTO public.site_settings (id, maintenance)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
