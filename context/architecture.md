# Hook Architecture

Frontend:
Next.js 14 (App Router)
React
Tailwind CSS

Backend:
Supabase

Services used from Supabase:
- PostgreSQL database
- Supabase Storage (for images/videos/gifs)
- Supabase Auth (admin login)

Hosting:
Vercel

Media handling:
Adverts support:
- images
- gifs
- videos

If multiple media items exist they must display as a slideshow.

Media must be stored in Supabase Storage and referenced in the database.

The frontend must load media efficiently and prioritize images visually.