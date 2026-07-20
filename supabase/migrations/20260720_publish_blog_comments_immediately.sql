alter table public.blog_comments alter column approved set default true;

drop policy if exists "Anyone can submit a pending comment" on public.blog_comments;
drop policy if exists "Anyone can submit a public comment" on public.blog_comments;

create policy "Anyone can submit a public comment"
  on public.blog_comments
  for insert
  to anon, authenticated
  with check (approved = true);
