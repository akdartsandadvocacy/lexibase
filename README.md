# LexiBase

A small translation term glossary app built on **Next.js 15** and **Supabase**.

Manage source terms, translations across languages, clients, and translation projects — with row-level security so each user only sees their own data.

## Features

- **Glossary** — add, search, and edit source terms with definitions, part of speech, and domain
- **Translations** — attach one translation per target language per term, with context and example sentences
- **Clients & projects** — track who you work for and language-pair jobs
- **Auth** — email/password sign-up and sign-in via Supabase Auth

## Quick start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Open **SQL Editor** and run the full contents of `supabase/schema.sql`.
3. In **Authentication → Providers**, ensure Email is enabled.
4. Copy your **Project URL** and **anon public key** from **Project Settings → API**.

### 2. Configure the app

```bash
cd Projects/lexibase
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start adding terms.

## Project structure

```
app/
  (app)/          # Authenticated pages (terms, projects, clients)
  login/          # Sign in
  signup/         # Sign up
  actions.ts      # Server actions for CRUD
lib/
  supabase/       # Browser + server Supabase clients
  types.ts        # Shared TypeScript types
supabase/
  schema.sql      # Database schema + RLS + seed languages
```

## Schema notes

The schema uses `gen_random_uuid()` (pgcrypto), enforces unique terms per user/language, and includes fixed RLS policies so users can only link their own terms to their own projects.

## Next steps (ideas)

- Link terms to projects via `project_terms`
- CSV import/export for glossaries
- Full-text / fuzzy search with `pg_trgm`
- Dark mode
