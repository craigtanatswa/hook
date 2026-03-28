-- Per-city suburbs for escort listings (city remains in `location`).
alter table public.adverts
  add column if not exists suburb text;

comment on column public.adverts.suburb is 'Suburb within the city stored in `location` (Zimbabwe).';
