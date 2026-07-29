import AnalyticsControls from "@/components/admin/AnalyticsControls";
import AnalyticsTrend, { AnalyticsPoint } from "@/components/admin/AnalyticsTrend";
import { resolveAnalyticsRange } from "@/lib/analytics-range";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  Clock3,
  Eye,
  MousePointerClick,
  Percent,
  Repeat2,
  Route,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";

type MetricRow = { label: string; value: number };
type PageRow = {
  path: string;
  views: number;
  visitors: number;
  engagement: number;
  exits: number;
};
type RecentVisit = {
  occurred_at: string;
  path: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  source: string;
};
type Summary = {
  views: number;
  visitors: number;
  sessions: number;
  actions: number;
  avg_engagement: number;
  bounce_rate: number;
  views_per_session: number;
  conversion_rate: number;
  new_visitors: number;
  returning_visitors: number;
  active_now: number;
};
type DashboardData = {
  period: {
    start: string;
    end: string;
    label: string;
    granularity: string;
  };
  summary: Summary;
  previous: Summary;
  trend: AnalyticsPoint[];
  top_pages: MetricRow[];
  landing_pages: MetricRow[];
  exit_pages: MetricRow[];
  referrers: MetricRow[];
  countries: MetricRow[];
  cities: MetricRow[];
  devices: MetricRow[];
  browsers: MetricRow[];
  operating_systems: MetricRow[];
  campaigns: MetricRow[];
  utm_sources: MetricRow[];
  utm_mediums: MetricRow[];
  actions: MetricRow[];
  page_details: PageRow[];
  recent: RecentVisit[];
  filters: {
    pages: string[];
    countries: string[];
    devices: string[];
    sources: string[];
  };
};

type SearchParams = {
  preset?: string;
  from?: string;
  to?: string;
  compare?: string;
  page?: string;
  country?: string;
  device?: string;
  source?: string;
};

const number = new Intl.NumberFormat("en");
function delta(current: number, previous: number) {
  if (!previous) return current ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: MetricRow[];
}) {
  const total = rows.reduce((sum, row) => sum + Number(row.value), 0);
  const max = Math.max(1, ...rows.map((row) => Number(row.value)));
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
      <h2 className="mb-5 font-semibold text-white">{title}</h2>
      <div className="space-y-4">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-white/70" title={row.label}>{row.label}</span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-white">
                  {number.format(row.value)}
                  <span className="w-9 text-right text-[10px] text-white/30">
                    {total ? Math.round((row.value / total) * 100) : 0}%
                  </span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/35">No data in this period.</p>
        )}
      </div>
    </section>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const range = resolveAnalyticsRange(params);
  const compare = params.compare !== "0";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase.rpc("get_analytics_dashboard_v2", {
    p_start: range.start,
    p_end: range.end,
    p_path: params.page || null,
    p_country: params.country || null,
    p_device: params.device || null,
    p_source: params.source || null,
  });
  const analytics = data as DashboardData | null;

  if (error || !analytics) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="mt-8 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <p className="font-medium text-amber-200">Analytics upgrade required</p>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Apply both analytics migrations in the Supabase folder, then refresh this
            page. The upgraded dashboard uses the new flexible reporting function.
          </p>
          <p className="mt-3 font-mono text-xs text-white/30">{error?.message}</p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Page views", value: analytics.summary.views, raw: analytics.summary.views, previous: analytics.previous.views, icon: Eye },
    { label: "Unique visitors", value: analytics.summary.visitors, raw: analytics.summary.visitors, previous: analytics.previous.visitors, icon: Users },
    { label: "Sessions", value: analytics.summary.sessions, raw: analytics.summary.sessions, previous: analytics.previous.sessions, icon: Activity },
    { label: "Views / session", value: analytics.summary.views_per_session.toFixed(2), raw: analytics.summary.views_per_session, previous: analytics.previous.views_per_session, icon: Route },
    { label: "Avg. engagement", value: formatDuration(analytics.summary.avg_engagement), raw: analytics.summary.avg_engagement, previous: analytics.previous.avg_engagement, icon: Clock3 },
    { label: "Bounce rate", value: `${analytics.summary.bounce_rate}%`, raw: analytics.summary.bounce_rate, previous: analytics.previous.bounce_rate, icon: Repeat2, inverse: true },
    { label: "Actions", value: analytics.summary.actions, raw: analytics.summary.actions, previous: analytics.previous.actions, icon: MousePointerClick },
    { label: "Action rate", value: `${analytics.summary.conversion_rate}%`, raw: analytics.summary.conversion_rate, previous: analytics.previous.conversion_rate, icon: Percent },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-7">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <span className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1 text-xs text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {analytics.summary.active_now} active now
            </span>
          </div>
          <p className="mt-2 text-white/45">
            Portfolio acquisition, audience, and engagement.
          </p>
        </div>
        <AnalyticsControls
          preset={range.preset}
          from={range.from}
          to={range.to}
          options={analytics.filters}
        />
        <p className="mt-4 text-xs text-white/30">
          {analytics.period.label} · Africa/Lagos timezone
          {compare ? " · compared with previous period" : ""}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {cards.map((card) => {
          const movement = delta(card.raw, card.previous);
          const positive = card.inverse ? movement <= 0 : movement >= 0;
          return (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
              <card.icon className="mb-5 h-5 w-5 text-accent" />
              <p className="text-2xl font-bold text-white">
                {typeof card.value === "number" ? number.format(card.value) : card.value}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="truncate text-white/40">{card.label}</span>
                {compare && (
                  <span className={positive ? "text-emerald-400" : "text-red-400"}>
                    {movement > 0 ? "+" : ""}{movement}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/[.03] px-5 py-4">
          <p className="text-xs text-white/35">New visitors</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {number.format(analytics.summary.new_visitors)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.03] px-5 py-4">
          <p className="text-xs text-white/35">Returning visitors</p>
          <p className="mt-1 text-xl font-semibold text-white">
            {number.format(analytics.summary.returning_visitors)}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
        <div className="mb-2">
          <h2 className="font-semibold text-white">Traffic over time</h2>
          <p className="mt-1 text-xs text-white/35">Switch metrics and hover for exact values.</p>
        </div>
        <AnalyticsTrend data={analytics.trend} granularity={analytics.period.granularity} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Breakdown title="Top pages" rows={analytics.top_pages} />
        <Breakdown title="Landing pages" rows={analytics.landing_pages} />
        <Breakdown title="Exit pages" rows={analytics.exit_pages} />
        <Breakdown title="Traffic sources" rows={analytics.referrers} />
        <Breakdown title="Countries" rows={analytics.countries} />
        <Breakdown title="Cities" rows={analytics.cities} />
        <Breakdown title="Devices" rows={analytics.devices} />
        <Breakdown title="Browsers" rows={analytics.browsers} />
        <Breakdown title="Operating systems" rows={analytics.operating_systems} />
        <Breakdown title="UTM campaigns" rows={analytics.campaigns} />
        <Breakdown title="UTM sources" rows={analytics.utm_sources} />
        <Breakdown title="UTM mediums" rows={analytics.utm_mediums} />
        <Breakdown title="Clicks & downloads" rows={analytics.actions} />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="font-semibold text-white">Page performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/30">
              <tr>
                <th className="px-6 py-4 font-medium">Page</th>
                <th className="px-6 py-4 text-right font-medium">Views</th>
                <th className="px-6 py-4 text-right font-medium">Visitors</th>
                <th className="px-6 py-4 text-right font-medium">Engagement</th>
                <th className="px-6 py-4 text-right font-medium">Exits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/65">
              {analytics.page_details.map((page) => (
                <tr key={page.path}>
                  <td className="max-w-md truncate px-6 py-4 font-medium text-white">{page.path}</td>
                  <td className="px-6 py-4 text-right">{number.format(page.views)}</td>
                  <td className="px-6 py-4 text-right">{number.format(page.visitors)}</td>
                  <td className="px-6 py-4 text-right">{formatDuration(page.engagement)}</td>
                  <td className="px-6 py-4 text-right">{number.format(page.exits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="font-semibold text-white">Recent visits</h2>
          <p className="mt-1 text-xs text-white/35">Latest 50 page views in this report.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/30">
              <tr>
                <th className="px-6 py-4 font-medium">Page</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Device</th>
                <th className="px-6 py-4 font-medium">Browser</th>
                <th className="px-6 py-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/65">
              {analytics.recent.map((visit, index) => (
                <tr key={`${visit.occurred_at}-${index}`}>
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-white">{visit.path}</td>
                  <td className="px-6 py-4">{[visit.city, visit.country].filter(Boolean).join(", ")}</td>
                  <td className="max-w-40 truncate px-6 py-4">{visit.source}</td>
                  <td className="px-6 py-4">{visit.device}</td>
                  <td className="px-6 py-4">{visit.browser}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(visit.occurred_at).toLocaleString("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Africa/Lagos",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
