-- Adverts + media stored in DB; media URLs point to Supabase Storage or any HTTPS URL.
-- Run in Supabase SQL Editor if migrations CLI not used.

create table if not exists public.adverts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age int not null check (age >= 18),
  location text not null,
  gender text not null,
  body_type text not null,
  category text not null,
  short_description text not null,
  full_description text not null,
  phone text not null,
  whatsapp text not null,
  email text,
  expiry_date timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired')),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advert_media (
  id uuid primary key default gen_random_uuid(),
  advert_id uuid not null references public.adverts(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'gif', 'video')),
  order_index int not null default 0
);

create index if not exists advert_media_advert_id_idx on public.advert_media(advert_id);
create index if not exists adverts_status_expiry_idx on public.adverts(status, expiry_date);
create index if not exists adverts_featured_idx on public.adverts(featured) where featured = true;

-- RLS: public read for active unexpired; admin writes via service role (bypass RLS) or policies
alter table public.adverts enable row level security;
alter table public.advert_media enable row level security;

-- Anonymous can read active adverts
create policy "Public read active adverts"
  on public.adverts for select
  using (status = 'active' and expiry_date > now());

-- Media readable for adverts that are active (join would need policy on advert_media - simpler: allow select all media if advert is active via subquery not supported easily; allow read all for anon and filter in app, or)
create policy "Public read advert_media"
  on public.advert_media for select
  using (
    exists (
      select 1 from public.adverts a
      where a.id = advert_id and a.status = 'active' and a.expiry_date > now()
    )
  );

-- No insert/update/delete for anon — use service role on server only

comment on table public.adverts is 'Hook listings; media URLs live in advert_media';
comment on table public.advert_media is 'Ordered media URLs (Storage or external); no binary in DB';
