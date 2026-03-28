-- Premium (hero strip, replaces "featured") + VIP badge-only tier with separate expiry windows.

ALTER TABLE public.adverts RENAME COLUMN featured TO premium;
ALTER TABLE public.adverts RENAME COLUMN featured_until TO premium_until;

ALTER TABLE public.adverts ADD COLUMN vip boolean NOT NULL DEFAULT false;
ALTER TABLE public.adverts ADD COLUMN vip_until timestamp with time zone;

DROP INDEX IF EXISTS public.adverts_featured_idx;
CREATE INDEX adverts_premium_idx ON public.adverts USING btree (premium);
