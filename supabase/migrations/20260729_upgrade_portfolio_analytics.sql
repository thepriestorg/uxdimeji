create or replace function public.get_analytics_dashboard_v2(
  p_start timestamptz default null,
  p_end timestamptz default null,
  p_path text default null,
  p_country text default null,
  p_device text default null,
  p_source text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
  range_start timestamptz;
  range_end timestamptz;
  previous_start timestamptz;
  previous_end timestamptz;
  bucket_unit text;
  bucket_step interval;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  range_end := least(coalesce(p_end, now()), now());
  range_start := coalesce(
    p_start,
    (select min(occurred_at) from public.analytics_events),
    range_end - interval '30 days'
  );
  if range_start > range_end then
    range_start := range_end - interval '1 day';
  end if;

  previous_end := range_start;
  previous_start := range_start - greatest(range_end - range_start, interval '1 day');

  if range_end - range_start <= interval '2 days' then
    bucket_unit := 'hour';
    bucket_step := interval '1 hour';
  elsif range_end - range_start <= interval '120 days' then
    bucket_unit := 'day';
    bucket_step := interval '1 day';
  elsif range_end - range_start <= interval '730 days' then
    bucket_unit := 'week';
    bucket_step := interval '1 week';
  else
    bucket_unit := 'month';
    bucket_step := interval '1 month';
  end if;

  with
  date_views as (
    select *,
      case
        when referrer_host is null or referrer_host like '%uxdimeji.com' then 'Direct'
        else referrer_host
      end as source
    from public.analytics_events
    where event_name = 'page_view'
      and occurred_at >= range_start and occurred_at <= range_end
  ),
  current_views as (
    select * from date_views
    where (p_path is null or path = p_path)
      and (p_country is null or coalesce(country, 'Unknown') = p_country)
      and (p_device is null or coalesce(device, 'Unknown') = p_device)
      and (p_source is null or source = p_source)
  ),
  current_events as (
    select e.*
    from public.analytics_events e
    where e.occurred_at >= range_start and e.occurred_at <= range_end
      and exists (select 1 from current_views v where v.session_id = e.session_id)
      and (p_path is null or e.path = p_path)
  ),
  prior_date_views as (
    select *,
      case
        when referrer_host is null or referrer_host like '%uxdimeji.com' then 'Direct'
        else referrer_host
      end as source
    from public.analytics_events
    where event_name = 'page_view'
      and occurred_at >= previous_start and occurred_at < previous_end
  ),
  previous_views as (
    select * from prior_date_views
    where (p_path is null or path = p_path)
      and (p_country is null or coalesce(country, 'Unknown') = p_country)
      and (p_device is null or coalesce(device, 'Unknown') = p_device)
      and (p_source is null or source = p_source)
  ),
  previous_events as (
    select e.*
    from public.analytics_events e
    where e.occurred_at >= previous_start and e.occurred_at < previous_end
      and exists (select 1 from previous_views v where v.session_id = e.session_id)
      and (p_path is null or e.path = p_path)
  ),
  session_rollup as (
    select v.session_id, v.views, coalesce(e.engagement, 0) as engagement
    from (
      select session_id, count(*) as views
      from current_views group by session_id
    ) v
    left join (
      select session_id, sum(engagement_seconds) as engagement
      from current_events where event_name = 'engagement' group by session_id
    ) e using (session_id)
  ),
  previous_session_rollup as (
    select v.session_id, v.views, coalesce(e.engagement, 0) as engagement
    from (
      select session_id, count(*) as views
      from previous_views group by session_id
    ) v
    left join (
      select session_id, sum(engagement_seconds) as engagement
      from previous_events where event_name = 'engagement' group by session_id
    ) e using (session_id)
  ),
  visitor_first_seen as (
    select visitor_id, min(occurred_at) as first_seen
    from public.analytics_events
    where event_name = 'page_view'
    group by visitor_id
  ),
  visitor_types as (
    select distinct v.visitor_id,
      case when f.first_seen >= range_start then 'new' else 'returning' end as kind
    from current_views v
    join visitor_first_seen f using (visitor_id)
  ),
  ranked_views as (
    select *,
      row_number() over (partition by session_id order by occurred_at, id) as entrance_rank,
      row_number() over (partition by session_id order by occurred_at desc, id desc) as exit_rank
    from current_views
  ),
  page_engagement as (
    select path, coalesce(round(avg(engagement_seconds) filter (where event_name = 'engagement')), 0) as engagement
    from current_events
    group by path
  )
  select jsonb_build_object(
    'period', jsonb_build_object(
      'start', range_start,
      'end', range_end,
      'label', to_char(range_start at time zone 'Africa/Lagos', 'Mon DD, YYYY') || ' – ' ||
        to_char(range_end at time zone 'Africa/Lagos', 'Mon DD, YYYY'),
      'granularity', bucket_unit
    ),
    'summary', jsonb_build_object(
      'views', (select count(*) from current_views),
      'visitors', (select count(distinct visitor_id) from current_views),
      'sessions', (select count(distinct session_id) from current_views),
      'actions', (select count(*) from current_events where event_name in ('outbound_click', 'file_download')),
      'avg_engagement', coalesce((select round(avg(engagement)) from session_rollup), 0),
      'bounce_rate', coalesce((select round(100.0 * count(*) filter (where views = 1 and engagement < 10) / nullif(count(*), 0), 1) from session_rollup), 0),
      'views_per_session', coalesce((select round(count(*)::numeric / nullif(count(distinct session_id), 0), 2) from current_views), 0),
      'conversion_rate', coalesce((select round(100.0 * count(distinct session_id) filter (where event_name in ('outbound_click', 'file_download')) / nullif((select count(distinct session_id) from current_views), 0), 1) from current_events), 0),
      'new_visitors', (select count(*) from visitor_types where kind = 'new'),
      'returning_visitors', (select count(*) from visitor_types where kind = 'returning'),
      'active_now', (
        select count(distinct visitor_id) from public.analytics_events
        where event_name = 'page_view' and occurred_at >= now() - interval '5 minutes'
      )
    ),
    'previous', jsonb_build_object(
      'views', (select count(*) from previous_views),
      'visitors', (select count(distinct visitor_id) from previous_views),
      'sessions', (select count(distinct session_id) from previous_views),
      'actions', (select count(*) from previous_events where event_name in ('outbound_click', 'file_download')),
      'avg_engagement', coalesce((select round(avg(engagement)) from previous_session_rollup), 0),
      'bounce_rate', coalesce((select round(100.0 * count(*) filter (where views = 1 and engagement < 10) / nullif(count(*), 0), 1) from previous_session_rollup), 0),
      'views_per_session', coalesce((select round(count(*)::numeric / nullif(count(distinct session_id), 0), 2) from previous_views), 0),
      'conversion_rate', coalesce((select round(100.0 * count(distinct session_id) filter (where event_name in ('outbound_click', 'file_download')) / nullif((select count(distinct session_id) from previous_views), 0), 1) from previous_events), 0),
      'new_visitors', 0,
      'returning_visitors', 0,
      'active_now', 0
    ),
    'trend', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'label', case bucket_unit
          when 'hour' then to_char(bucket at time zone 'Africa/Lagos', 'Mon DD, HH24:00')
          when 'week' then 'Week of ' || to_char(bucket at time zone 'Africa/Lagos', 'Mon DD')
          when 'month' then to_char(bucket at time zone 'Africa/Lagos', 'Mon YYYY')
          else to_char(bucket at time zone 'Africa/Lagos', 'Mon DD')
        end,
        'full_label', to_char(bucket at time zone 'Africa/Lagos', 'Mon DD, YYYY HH24:MI'),
        'views', views, 'visitors', visitors, 'sessions', sessions, 'actions', actions
      ) order by bucket), '[]'::jsonb)
      from (
        select series.bucket,
          count(distinct v.id) as views,
          count(distinct v.visitor_id) as visitors,
          count(distinct v.session_id) as sessions,
          count(distinct e.id) filter (where e.event_name in ('outbound_click', 'file_download')) as actions
        from generate_series(
          date_trunc(bucket_unit, range_start, 'Africa/Lagos'),
          date_trunc(bucket_unit, range_end, 'Africa/Lagos'),
          bucket_step
        ) series(bucket)
        left join current_views v on v.occurred_at >= series.bucket and v.occurred_at < series.bucket + bucket_step
        left join current_events e on e.occurred_at >= series.bucket and e.occurred_at < series.bucket + bucket_step
        group by series.bucket
      ) buckets
    ),
    'top_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('label', path, 'value', value) order by value desc), '[]'::jsonb)
      from (select path, count(*) as value from current_views group by path order by value desc limit 10) ranked
    ),
    'landing_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('label', path, 'value', value) order by value desc), '[]'::jsonb)
      from (select path, count(*) as value from ranked_views where entrance_rank = 1 group by path order by value desc limit 10) ranked
    ),
    'exit_pages', (
      select coalesce(jsonb_agg(jsonb_build_object('label', path, 'value', value) order by value desc), '[]'::jsonb)
      from (select path, count(*) as value from ranked_views where exit_rank = 1 group by path order by value desc limit 10) ranked
    ),
    'referrers', (
      select coalesce(jsonb_agg(jsonb_build_object('label', source, 'value', value) order by value desc), '[]'::jsonb)
      from (select source, count(*) as value from current_views group by source order by value desc limit 10) ranked
    ),
    'countries', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(country, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 10) ranked
    ),
    'cities', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(city, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 10) ranked
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(device, 'Unknown') as label, count(*) as value from current_views group by label order by value desc) ranked
    ),
    'browsers', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(browser, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 10) ranked
    ),
    'operating_systems', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select coalesce(os, 'Unknown') as label, count(*) as value from current_views group by label order by value desc limit 10) ranked
    ),
    'campaigns', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select metadata->>'utm_campaign' as label, count(*) as value from current_views where nullif(metadata->>'utm_campaign', '') is not null group by label order by value desc limit 10) ranked
    ),
    'utm_sources', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select metadata->>'utm_source' as label, count(*) as value from current_views where nullif(metadata->>'utm_source', '') is not null group by label order by value desc limit 10) ranked
    ),
    'utm_mediums', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (select metadata->>'utm_medium' as label, count(*) as value from current_views where nullif(metadata->>'utm_medium', '') is not null group by label order by value desc limit 10) ranked
    ),
    'actions', (
      select coalesce(jsonb_agg(jsonb_build_object('label', label, 'value', value) order by value desc), '[]'::jsonb)
      from (
        select coalesce(nullif(metadata->>'label', ''), event_name) as label, count(*) as value
        from current_events where event_name in ('outbound_click', 'file_download')
        group by label order by value desc limit 10
      ) ranked
    ),
    'page_details', (
      select coalesce(jsonb_agg(to_jsonb(details) order by views desc), '[]'::jsonb)
      from (
        select v.path, count(*) as views, count(distinct v.visitor_id) as visitors,
          coalesce(max(pe.engagement), 0) as engagement,
          count(*) filter (where v.exit_rank = 1) as exits
        from ranked_views v
        left join page_engagement pe on pe.path = v.path
        group by v.path
        order by views desc limit 50
      ) details
    ),
    'recent', (
      select coalesce(jsonb_agg(to_jsonb(recent_rows) order by occurred_at desc), '[]'::jsonb)
      from (
        select occurred_at, path, coalesce(country, 'Unknown') as country,
          coalesce(city, '') as city, coalesce(device, 'Unknown') as device,
          coalesce(browser, 'Unknown') as browser, source
        from current_views order by occurred_at desc limit 50
      ) recent_rows
    ),
    'filters', jsonb_build_object(
      'pages', (select coalesce(jsonb_agg(path order by path), '[]'::jsonb) from (select distinct path from date_views) values_list),
      'countries', (select coalesce(jsonb_agg(label order by label), '[]'::jsonb) from (select distinct coalesce(country, 'Unknown') as label from date_views) values_list),
      'devices', (select coalesce(jsonb_agg(label order by label), '[]'::jsonb) from (select distinct coalesce(device, 'Unknown') as label from date_views) values_list),
      'sources', (select coalesce(jsonb_agg(source order by source), '[]'::jsonb) from (select distinct source from date_views) values_list)
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.get_analytics_dashboard_v2(timestamptz, timestamptz, text, text, text, text) from public;
grant execute on function public.get_analytics_dashboard_v2(timestamptz, timestamptz, text, text, text, text) to authenticated;

create or replace function public.export_analytics_events(
  p_start timestamptz default null,
  p_end timestamptz default null,
  p_path text default null,
  p_country text default null,
  p_device text default null,
  p_source text default null
) returns table (
  occurred_at timestamptz,
  event_name text,
  path text,
  source text,
  country text,
  city text,
  device text,
  browser text,
  operating_system text,
  engagement_seconds integer,
  campaign text,
  campaign_source text,
  campaign_medium text,
  action_label text,
  action_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  return query
  select e.occurred_at, e.event_name, e.path,
    case when e.referrer_host is null or e.referrer_host like '%uxdimeji.com' then 'Direct' else e.referrer_host end,
    coalesce(e.country, 'Unknown'), coalesce(e.city, ''), coalesce(e.device, 'Unknown'),
    coalesce(e.browser, 'Unknown'), coalesce(e.os, 'Unknown'), e.engagement_seconds,
    coalesce(e.metadata->>'utm_campaign', ''), coalesce(e.metadata->>'utm_source', ''),
    coalesce(e.metadata->>'utm_medium', ''), coalesce(e.metadata->>'label', ''),
    coalesce(e.metadata->>'url', '')
  from public.analytics_events e
  where e.occurred_at >= coalesce(p_start, '-infinity'::timestamptz)
    and e.occurred_at <= coalesce(p_end, now())
    and (p_path is null or e.path = p_path)
    and (p_country is null or coalesce(e.country, 'Unknown') = p_country)
    and (p_device is null or coalesce(e.device, 'Unknown') = p_device)
    and (
      p_source is null or
      case when e.referrer_host is null or e.referrer_host like '%uxdimeji.com' then 'Direct' else e.referrer_host end = p_source
    )
  order by e.occurred_at desc
  limit 50000;
end;
$$;

revoke all on function public.export_analytics_events(timestamptz, timestamptz, text, text, text, text) from public;
grant execute on function public.export_analytics_events(timestamptz, timestamptz, text, text, text, text) to authenticated;
