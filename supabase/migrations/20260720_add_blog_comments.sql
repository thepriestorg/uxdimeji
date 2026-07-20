create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  name text not null check (char_length(name) between 1 and 80),
  body text not null check (char_length(body) between 1 and 1500),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_post_slug_idx on public.blog_comments (post_slug, created_at);
alter table public.blog_comments enable row level security;

create policy "Approved comments are publicly readable" on public.blog_comments for select using (approved = true or auth.role() = 'authenticated');
create policy "Anyone can submit a public comment" on public.blog_comments for insert to anon, authenticated with check (approved = true);
create policy "Authenticated users can moderate comments" on public.blog_comments for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete comments" on public.blog_comments for delete to authenticated using (true);
