-- ══════════════════════════════════════════════════════════════════════════
-- Migration: Add blog post views & backfill historical views
-- ══════════════════════════════════════════════════════════════════════════

-- 1. Add views column to blog_posts
alter table public.blog_posts 
  add column if not exists views integer not null default 0;

-- 2. Backfill historical views from analytics_events
-- Counts all recorded page_view events matching the post's path
update public.blog_posts p
set views = coalesce((
  select count(*)
  from public.analytics_events e
  where e.event_name = 'page_view'
    and (
      e.path = '/blog/' || p.slug
      or e.path like '/blog/' || p.slug || '?%'
      or e.path like '/blog/' || p.slug || '/%'
    )
), 0);

-- 3. Create atomic increment function callable by public / authenticated clients
create or replace function public.increment_blog_post_views(p_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_views integer;
begin
  update public.blog_posts
  set views = coalesce(views, 0) + 1
  where slug = p_slug
  returning views into v_views;

  return coalesce(v_views, 0);
end;
$$;

revoke all on function public.increment_blog_post_views(text) from public;
grant execute on function public.increment_blog_post_views(text) to anon, authenticated;
