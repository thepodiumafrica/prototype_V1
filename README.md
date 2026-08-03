# The Podium

A social knowledge platform for African voices — on the continent and in the diaspora.

This is the production rebuild of the `ThePodium_v5.html` browser prototype (kept in
[`reference/`](./reference/) as the source of truth for design, data shapes, and
behaviour — see `reference/ThePodium_ClaudeCode_Brief.docx` for the build plan).

## Stack

Next.js (App Router, TypeScript) · Tailwind CSS · Supabase (Postgres, Auth, Storage).

## Getting started

```bash
cp .env.local.example .env.local   # then fill in your Supabase project values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project layout

- `src/app/` — routes (App Router)
- `src/lib/supabase/client.ts` — Supabase browser client
- `reference/` — the original prototype and project brief; the spec for this build
