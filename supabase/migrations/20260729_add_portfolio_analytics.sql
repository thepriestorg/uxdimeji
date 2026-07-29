create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_name text not null check (event_name in ('page_view', 'engagement', 'outbound_click', 'file_download')),
  visitor_id uuid not null,
  session_id uuid not null,
  path text not null,
  referrer text,
  referrer_host text,
  country text,
  city text,
  device text,
  browser text,
  os text,
  engagement_seconds integer not null default 0 check (engagement_seconds between 0 and 1800),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists analytics_events_occurred_at_idx on public.analytics_events (occurred_at desc);
create index if not exists analytics_events_event_date_idx on public.analytics_events (event_name, occurred_at desc);
create index if not exists analytics_events_visitor_idx on public.analytics_events (visitor_id, occurred_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id, occurred_at desc);

alter table public.analytics_events enable row level security;

create or replace function public.track_analytics_event(
  p_event_name text,
  p_visitor_id uuid,
  p_session_id uuid,
  p_path text,
  p_referrer text default null,
  p_country text default null,
  p_city text default null,
  p_device text default null,
  p_browser text default null,
  p_os text default null,
  p_engagement_seconds integer default 0,
  p_metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  parsed_referrer_host text;
begin
  if p_event_name not in ('page_view', 'engagement', 'outbound_click', 'file_download')
    or left(p_path, 1) <> '/'
    or p_path like '/admin%'
    or length(p_path) > 500 then
    raise exception 'Invalid analytics event';
  end if;

  if p_referrer is not null then
    parsed_referrer_host := nullif(lower(substring(p_referrer from '^(?:https?://)?([^/?#:]+)')), '');
  end if;

  insert into public.analytics_events (
    event_name, visitor_id, session_id, path, referrer, referrer_host,
    country, city, device, browser, os, engagement_seconds, metadata
  ) values (
    p_event_name, p_visitor_id, p_session_id, left(p_path, 500), left(p_referrer, 1000),
    left(parsed_referrer_host, 255), left(p_country, 8), left(p_city, 120),
    left(p_device, 30), left(p_browser, 30), left(p_os, 30),
    least(greatest(coalesce(p_engagement_seconds, 0), 0), 1800),
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

revoke all on function public.track_analytics_event(text, uuid, uuid, text, text, text, text, text, text, text, integer, jsonb) from public;
grant execute on function public.track_analytics_event(text, uuid, uuid, text, text, text, text, text, text, text, integer, jsonb) to anon, authenticated;

create or replace function public.get_analytics_dashboard(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  range_start timestamptz;
  previous_start timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  p_days := case when p_days in (7, 30, 90) then p_days else 30 end;
  range_start := date_trunc('day', now()) - ((p_days - 1) || ' days')::interval;
  previous_start := range_start - (p_days || ' days')::interval;

  with
  current_views as (
    select * from public.analytics_events
    where event_name = 'page_view' and occurred_at >= range_start
  ),
  previous_views as (
    select * from public.analytics_events
    where event_name = 'page_view' and occurred_at >= previous_start and occurred_at < range_start
  ),
  session_rollup as (
    select session_id,
      count(*) filter (where event_name = 'page_view') as views,
      coalesce(sum(engagement_seconds) filter (where event_name = 'engagement'), 0) as engagement
    from public.analytics_events
    where occurred_at >= range_start
    group by session_id
  )
  select jsonb_build_object(
    'summary', jsonb_build_object(
      'views', (select count(*) from current_views),
      'visitors', (select count(distinct visitor_id) from current_views),
      'sessions', (select count(distinct session_id) from current_views),
      'avg_engagement', coalesce((select round(avg(engagement)) from session_rollup), 0),
      'bounce_rate', coalesce((select round(100.0 * count(*) filter (where views = 1 and engagement < 10) / nullif(count(*), 0), 1) from session_rollup), 0),
      'actions', (select count(*) from public.analytics_events where occurred_at >= range_start and event_name in ('outbound_click', 'file_download'))
    ),
    'previous', jsonb_build_object(
      'views', (select count(*) from previous_views),
      'visitors', (select count(distinct visitor_id) from previous_views),
      'sessions', (select count(distinct session_id) from previous_views)
    ),
    'trend', (
      select coalesce(jsonb_agg(jsonb_build_object('date', to_char(day, 'Mon DD'), 'views', views, 'visitors', visitors) order by day), '[]'::jsonb)
      from (
        select series.day, count(v.id) as views, count(distinct v.visitor_id) as visitors
        from generate_series(date_trunc('day', range_start), date_trunc('day', now()), '1 day') series(day)
        left join current_views v on v.occurred_at >= series.day and v.occurred_at < series.day + interval '1 day'
        group by series.day
      ) daily
    ),
    'top_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('label', path, 'value', value) order by value desc), '[]'::jsonb)
      from (select path, count(*) as value from current_views group by path order by value desc limit 8) ranked
    ),
    'referrers', (
      select coalesce(jsonb_agg(jsonb_build_object('label', source, 'value', value) order by value desc), '[]'::jsonb)
      from (
        select case when referrer_host is null or referrer_host like '%uxdimeji.com' then 'Direct' else referrer_host end as source, count(*) as value
        from current_views group by source order by value desc limit 8
      ) ranked
    ),
    'countries', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(country, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 8) ranked
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(device, 'Unknown') as label, count(*) as value from current_views group by label order by value desc) ranked
    ),
    'browsers', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(browser, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 8) ranked
    ),
    'campaigns', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (
        select coalesce(nullif(metadata->>'utm_campaign', ''), metadata->>'utm_source') as label, count(*) as value
        from current_views
        where nullif(metadata->>'utm_campaign', '') is not null or nullif(metadata->>'utm_source', '') is not null
        group by label order by value desc limit 8
      ) ranked
    ),
    'actions', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (
        select coalesce(nullif(metadata->>'label', ''), event_name) as label, count(*) as value
        from public.analytics_events
        where occurred_at >= range_start and event_name in ('outbound_click', 'file_download')
        group by label order by value desc limit 8
      ) ranked
    ),
    'recent', (
      select coalesce(jsonb_agg(to_jsonb(recent_rows) order by occurred_at desc), '[]'::jsonb)
      from (
        select occurred_at, path, coalesce(country, 'Unknown') as country,
          coalesce(device, 'Unknown') as device, coalesce(browser, 'Unknown') as browser
        from current_views order by occurred_at desc limit 20
      ) recent_rows
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_analytics_dashboard(integer) from public;
grant execute on function public.get_analytics_dashboard(integer) to authenticated;
