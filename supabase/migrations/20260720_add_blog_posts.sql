create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  category text not null default 'Design',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts enable row level security;
create policy "Published blog posts are publicly readable" on public.blog_posts for select using (published = true or auth.role() = 'authenticated');
create policy "Authenticated users can create blog posts" on public.blog_posts for insert to authenticated with check (true);
create policy "Authenticated users can update blog posts" on public.blog_posts for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete blog posts" on public.blog_posts for delete to authenticated using (true);
