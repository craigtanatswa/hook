ook Application Context
App Name

Hook

Purpose

Hook is a moderated marketplace platform that allows individuals to advertise services they can perform at a customer's home.

Examples of services include:

cleaning

plumbing

electrical work

tutoring

hairdressing

appliance repair

Customers browse service providers and contact them directly using:

WhatsApp

Phone

Optional email

Adverts are admin-controlled to maintain safety and quality.

Tech Stack

Frontend:

Next.js (App Router)

React

Tailwind CSS

Backend:

Supabase

Services used from Supabase:

PostgreSQL database

Supabase Storage (media)

Supabase Auth (admin login)

Deployment:

Vercel

Design Philosophy

The UI is media-first.

Images, GIFs, and videos uploaded by the service provider are the main focus of each advert.

Text information is secondary.

Each advert must prioritize visual proof of work such as:

photos of work performed

videos demonstrating services

gifs showing the provider working

Theme

Color palette:

Primary:
Orange (#FF6B00)

Background:
White

Text:
Black

UI style:

modern

minimal

mobile-first

rounded corners

soft shadows

large touch-friendly buttons

Homepage Layout

The homepage should contain:

1 Filters Bar

Sticky at the top.

Filters include:

Search

Location

Service Category

2 Featured Adverts Section

Displayed at the top.

Characteristics:

larger advert cards

orange "Featured" badge

image-first layout

Featured adverts are controlled by admin.

3 Advert Feed

Advert cards displayed in a grid or stacked layout.

Newest adverts appear first.

Only show adverts where:

status = 'approved'
expiry_date > now()
Advert Card Design

Each advert card must prioritize media.

Card layout:

Top section (70% of card height):

Media carousel supporting:

images

gifs

videos

If multiple media items exist, show them as a slideshow.

Navigation:

swipe on mobile

arrow buttons

dot indicators

Bottom section:

Text information:

name

age

location

short description

Trust indicators:

verified provider badge

rating placeholder

recently active indicator

Contact buttons:

WhatsApp (primary orange)

Call (black)

Email (optional)

Advert Detail Page

Layout:

Top section:

Large media gallery slideshow.

Supports:

multiple images

gifs

videos

Below media:

Provider details:

name

age

location

full description

trust indicators

Bottom of screen:

Sticky contact bar with:

WhatsApp button

Call button

Email button (optional)

Admin System

Admins manage all adverts.

Admin routes:

/admin/login
/admin/dashboard
/admin/create-advert
/admin/edit-advert
/admin/expired-adverts

Admin features:

create adverts

upload multiple media files

approve or reject adverts

mark adverts as featured

edit adverts

repost expired adverts

delete adverts

bulk create adverts

Media System

Each advert can have multiple media files.

Supported media:

images

gifs

videos

Media files are stored in Supabase Storage.

Media records are stored in the advert_media table.

Each media item has an order_index for slideshow ordering.

Database Schema

Tables:

users

categories

adverts

advert_media

ratings

Adverts Table

Fields include:

id

provider_id

category_id

name

age

location

description

phone

whatsapp

email

expiry_date

status

featured

created_at

updated_at

Advert Media Table

Stores media for adverts.

Fields include:

id

advert_id

media_url

media_type (image/gif/video)

order_index

Ratings Table

Future feature for user reviews.

Fields include:

id

advert_id

user_id

rating

review

created_at

Expiry Logic

Adverts automatically expire after expiry_date.

Expired adverts remain in the database but should not appear in public listings.

Admins can repost expired adverts.

Core UX Goals

The platform must feel:

visual

fast

trustworthy

simple

Users should be able to:

browse → see images → click → contact immediately.

The entire UX is optimized to make contacting the provider extremely easy.