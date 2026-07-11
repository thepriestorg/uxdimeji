create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  description text,
  image_url text not null,
  live_url text,
  figma_url text,
  is_visible boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.landing_pages enable row level security;

create policy "Landing pages are publicly readable"
  on public.landing_pages for select using (true);

create policy "Authenticated users can insert landing pages"
  on public.landing_pages for insert to authenticated with check (true);

create policy "Authenticated users can update landing pages"
  on public.landing_pages for update to authenticated using (true) with check (true);

create policy "Authenticated users can delete landing pages"
  on public.landing_pages for delete to authenticated using (true);

