-- LexiBase: Translation Term Glossary
-- Run this in the Supabase SQL Editor (as postgres / service role)

create extension if not exists "pgcrypto";

-- ============================================
-- LANGUAGES
-- ============================================
create table public.languages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  native_name text,
  created_at timestamptz default now()
);

-- ============================================
-- CLIENTS
-- ============================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  contact_email text,
  contact_phone text,
  date_of_contact date,
  request_type text check (request_type in ('translation','interpretation virtual','interpretation in-person')),
  language_pairs text,
  event_or_due_date date,
  notes text,
  created_at timestamptz default now()
);

create unique index clients_user_name_unique
  on public.clients(user_id, lower(name));

create index idx_clients_user_id on public.clients(user_id);

-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  source_language_id uuid references public.languages(id) not null,
  target_language_id uuid references public.languages(id) not null,
  domain text,
  status text default 'active' check (status in ('active','archived','completed')),
  created_at timestamptz default now(),
  check (source_language_id != target_language_id)
);

create index idx_projects_user_id on public.projects(user_id);

-- ============================================
-- TERMS
-- ============================================
create table public.terms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  source_language_id uuid references public.languages(id) not null,
  source_term text not null,
  definition text,
  part_of_speech text,
  domain text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index terms_user_source_unique
  on public.terms(user_id, source_language_id, lower(source_term));

create index idx_terms_user_id on public.terms(user_id);

-- ============================================
-- TERM TRANSLATIONS
-- ============================================
create table public.term_translations (
  id uuid primary key default gen_random_uuid(),
  term_id uuid references public.terms(id) on delete cascade not null,
  target_language_id uuid references public.languages(id) not null,
  translation text not null,
  context text,
  example_sentence_source text,
  example_sentence_target text,
  created_at timestamptz default now()
);

create unique index translations_term_lang_unique
  on public.term_translations(term_id, target_language_id);

create index idx_term_translations_term_id on public.term_translations(term_id);

-- ============================================
-- PROJECT TERMS
-- ============================================
create table public.project_terms (
  project_id uuid references public.projects(id) on delete cascade,
  term_id uuid references public.terms(id) on delete cascade,
  primary key (project_id, term_id)
);

create index idx_project_terms_term_id on public.project_terms(term_id);

-- ============================================
-- ROW-LEVEL SECURITY
-- ============================================
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.terms enable row level security;
alter table public.term_translations enable row level security;
alter table public.project_terms enable row level security;
alter table public.languages enable row level security;

create or replace function public.current_user_id()
returns uuid language sql stable as $$
  select auth.uid()
$$;

create policy "Users manage own clients"
  on public.clients for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "Users manage own projects"
  on public.projects for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "Users manage own terms"
  on public.terms for all
  using (user_id = current_user_id())
  with check (user_id = current_user_id());

create policy "Users manage own translations"
  on public.term_translations for all
  using (
    term_id in (select id from public.terms where user_id = current_user_id())
  )
  with check (
    term_id in (select id from public.terms where user_id = current_user_id())
  );

create policy "Users manage own project_terms"
  on public.project_terms for all
  using (
    project_id in (select id from public.projects where user_id = current_user_id())
    and term_id in (select id from public.terms where user_id = current_user_id())
  )
  with check (
    project_id in (select id from public.projects where user_id = current_user_id())
    and term_id in (select id from public.terms where user_id = current_user_id())
  );

create policy "Languages are readable by all authenticated users"
  on public.languages for select
  to authenticated using (true);

-- ============================================
-- SEED DATA
-- ============================================
insert into public.languages (code, name, native_name) values
  ('en', 'English', 'English'),
  ('es', 'Spanish', 'Español'),
  ('fr', 'French', 'Français'),
  ('pt', 'Portuguese', 'Português'),
  ('de', 'German', 'Deutsch'),
  ('it', 'Italian', 'Italiano'),
  ('zh', 'Chinese (Mandarin)', '中文'),
  ('ja', 'Japanese', '日本語'),
  ('ko', 'Korean', '한국어'),
  ('ar', 'Arabic', 'العربية'),
  ('ru', 'Russian', 'Русский'),
  ('nl', 'Dutch', 'Nederlands'),
  ('pl', 'Polish', 'Polski'),
  ('tr', 'Turkish', 'Türkçe'),
  ('vi', 'Vietnamese', 'Tiếng Việt')
on conflict (code) do nothing;

-- ============================================
-- TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_term_updated
  before update on public.terms
  for each row execute function public.handle_updated_at();
