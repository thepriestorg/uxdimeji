alter table public.vibe_projects
add column if not exists is_featured boolean not null default true;

comment on column public.vibe_projects.is_featured is
'Controls whether the built project appears in the portfolio homepage selected-work section.';
