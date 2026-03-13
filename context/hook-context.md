# Hook — Application Context

## App name

**Hook**

## Purpose

Hook is a **moderated listings platform** for **platonic, in-home cuddle sessions**. Profiles showcase people who travel to the client’s space to offer **consent-first contact**: spooning, movie-night cuddles, deep rest, big-spoon energy—**always bounded and non-sexual** in scope.

Customers **browse profiles** (media-first), then **contact directly** via WhatsApp, phone, or optional email to arrange time and boundaries.

Listings are **admin-controlled** for safety and tone.

## Tech stack

- Next.js (App Router), React, Tailwind
- Supabase (Postgres, Storage, Auth)
- Vercel

## Design philosophy

- **Media-first** — photos sell the vibe; text is secondary.
- **Theme**: primary orange, white/black, modern, minimal, mobile-first, soft shadows, large touch targets.
- **UX**: browse → feel it → click → **message immediately**.

## Public feed rules

- Only **active** (approved + unexpired) listings appear.
- **Featured** profiles get the hero strip and badge.
- Categories describe **cuddle style** (e.g. Soft & slow, Big spoon energy, Movie night), not trades.

## Contact flow

Sticky / prominent **WhatsApp** (primary), **Call**, **Email** optional — same as before; copy is flirt-forward but **platonic-only** in positioning.

## Admin

Same routes; labels in-app use “listing” / “cuddler” where it helps. Moderation copy reflects keeping the feed **safe and on-brand**.
