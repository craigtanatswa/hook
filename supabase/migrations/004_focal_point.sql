-- Add focal_point column to advert_media so each image can store
-- the admin-chosen CSS object-position (e.g. "60% 30%").
-- Existing rows default to "50% 50%" (centred).

ALTER TABLE public.advert_media
  ADD COLUMN IF NOT EXISTS focal_point text NOT NULL DEFAULT '50% 50%';
