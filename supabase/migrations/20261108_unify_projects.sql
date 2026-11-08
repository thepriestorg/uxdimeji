-- Unify projects: case studies, built-by-me projects and landing pages live in one table.
--
-- Additive on purpose: the deployed site still reads `projects.is_featured`, `vibe_projects` and
-- `landing_pages`, so nothing old is dropped or changes meaning here. Copied rows are inserted with
-- is_featured = false so the old homepage never shows them as case studies. The old tables and
-- columns are removed in a later migration once the new code is live.
-- Safe to run more than once.

-- 1. New columns -----------------------------------------------------------------------------

alter table public.projects
  add column if not exists kind text not null default 'product',
  add column if not exists made_for text,
  add column if not exists client_name text,
  add column if not exists has_case_study boolean not null default true,
  add column if not exists live_url text,
  add column if not exists figma_url text,
  add column if not exists summary text,
  add column if not exists role text,
  add column if not exists metrics jsonb not null default '[]'::jsonb,
  add column if not exists tags text[] not null default '{}',
  add column if not exists status text,
  add column if not exists accent text,
  add column if not exists is_published boolean;

-- Existing case studies keep their visibility: whatever showed on the site stays published.
update public.projects set is_published = is_featured where is_published is null;
alter table public.projects alter column is_published set default true;
alter table public.projects alter column is_published set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_kind_check') then
    alter table public.projects add constraint projects_kind_check
      check (kind in ('product', 'web_app', 'mobile_app', 'website', 'landing_page', 'other'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'projects_made_for_check') then
    alter table public.projects add constraint projects_made_for_check
      check (made_for is null or made_for in ('client', 'personal'));
  end if;
end $$;

comment on column public.projects.kind is 'What the project is; shown as the card label.';
comment on column public.projects.made_for is 'client or personal; null shows no label.';
comment on column public.projects.has_case_study is 'When true the card opens /projects/[slug]; otherwise it only links out.';
comment on column public.projects.is_published is 'Shows the project on the site. Replaces is_featured, which old code still reads.';
comment on column public.projects.metrics is 'Bold stats for the card, as [{"value": "1,000+", "label": "downloads"}].';

-- 2. Copy built-by-me projects ----------------------------------------------------------------

insert into public.projects (
  title, slug, category, year, featured_image, color, content, is_featured, "order", created_at, updated_at,
  kind, made_for, has_case_study, live_url, summary, tags, status, accent, is_published
)
select
  v.title,
  trim(both '-' from regexp_replace(lower(v.title), '[^a-z0-9]+', '-', 'g')),
  case when v.url ilike '%play.google.com%' or v.url ilike '%apps.apple.com%' then 'Mobile app' else 'Web app' end,
  to_char(v.created_at, 'YYYY'),
  v.image,
  'bg-indigo-950',
  '""'::jsonb,
  false,                         -- hidden from the old homepage
  100 + coalesce(v."order", 0),  -- after the case studies, as today
  v.created_at,
  now(),
  case when v.url ilike '%play.google.com%' or v.url ilike '%apps.apple.com%' then 'mobile_app' else 'web_app' end,
  'personal',
  false,
  v.url,
  v.description,
  coalesce(v.tags, '{}'),
  v.status,
  v.accent,
  coalesce(v.is_featured, true)
from public.vibe_projects v
where not exists (
  select 1 from public.projects p
  where p.slug = trim(both '-' from regexp_replace(lower(v.title), '[^a-z0-9]+', '-', 'g'))
);

-- 3. Copy landing pages -----------------------------------------------------------------------

insert into public.projects (
  title, slug, category, year, featured_image, color, content, is_featured, "order", created_at, updated_at,
  kind, made_for, has_case_study, live_url, figma_url, summary, status, is_published
)
select
  l.title,
  trim(both '-' from regexp_replace(lower(l.title), '[^a-z0-9]+', '-', 'g')),
  l.category,
  to_char(l.created_at, 'YYYY'),
  l.image_url,
  'bg-indigo-950',
  '""'::jsonb,
  false,
  200 + coalesce(l.display_order, 0),
  l.created_at,
  now(),
  'landing_page',
  'personal',
  false,
  l.live_url,
  l.figma_url,
  l.description,
  'Live',
  l.is_visible
from public.landing_pages l
where not exists (
  select 1 from public.projects p
  where p.slug = trim(both '-' from regexp_replace(lower(l.title), '[^a-z0-9]+', '-', 'g'))
);
