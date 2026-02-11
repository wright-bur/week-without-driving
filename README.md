# Week Without Driving Confessional

A mobile-first, reflective 7-day challenge that turns daily entries into curated anonymous confessional cards. Built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill in Supabase credentials and admin emails in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ADMIN_EMAILS=moderator@email.com

# SUPABASE_ANON_KEY should match NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Supabase schema

Run the SQL in `supabase/schema.sql` using the Supabase SQL editor or migrations.

Notes:
- RLS is enabled on all tables.
- Public reads for the scroll are limited to `approved` cards.
- All write operations in the app go through server routes using the service role key.

## Seed demo cards

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed.mjs
```

## Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Tests

```bash
npm test
```

## Deploy (Vercel)

1. Import the project in Vercel.
2. Add the environment variables from `.env.local`.
3. Deploy. Next.js build settings are automatic.

## Moderation

- Admin login is via Supabase email/password or magic link.
- Only emails listed in `ADMIN_EMAILS` can access admin APIs.
- The admin queue supports approve/reject, tag edits, and minor text edits.

## Safety

- No GPS, no location capture, no public profiles.
- Publish consent is explicit and off by default.
- PII redaction removes email and phone patterns; address/school/employer cues flag a card for review.
