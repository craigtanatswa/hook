# Hook Database (Supabase)

## Tables

### `adverts`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| name, age, location, gender, body_type, category | text/int | Listing fields |
| short_description, full_description | text | short = teaser; full = body |
| phone, whatsapp, email | text | Contact |
| expiry_date | timestamptz | Listing expiry |
| status | text | `active` \| `expired` |
| featured | boolean | Hero strip |
| created_at, updated_at | timestamptz | |

### `advert_media`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| advert_id | uuid | FK → adverts ON DELETE CASCADE |
| media_url | text | **HTTPS URL only** — Supabase Storage public URL or external |
| media_type | text | `image` \| `gif` \| `video` |
| order_index | int | Slideshow order |

**No binary in the app or in Postgres** — media is **stored elsewhere** (e.g. Supabase Storage); the DB only stores URLs. Admin create/edit **replaces** `advert_media` rows for that advert.

## Migration

Run in Supabase SQL Editor:

`supabase/migrations/001_adverts_and_media.sql`

## App behaviour

- **Public feed & detail**: `/api/adverts` and detail page load from DB when rows exist; otherwise fallback to static `lib/data.ts` (existing images under `/public/images` stay as-is; not deleted).
- **Admin create/edit**: Server Actions use **service role** — insert/update `adverts` + `advert_media`; **no file upload** in the UI — paste URLs only.
- **Admin delete**: Deletes advert row; media rows cascade.

## Env (server only)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public reads (RLS)
- `SUPABASE_SERVICE_ROLE_KEY` — Server Actions only; never client-exposed
