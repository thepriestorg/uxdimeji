import AnalyticsControls from "@/components/admin/AnalyticsControls";
import AnalyticsTrend, { AnalyticsPoint } from "@/components/admin/AnalyticsTrend";
import { resolveAnalyticsRange } from "@/lib/analytics-range";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Compass,
  Download,
  Eye,
  FileText,
  Globe2,
  Laptop,
  Layers,
  MapPin,
  MessageSquare,
  Monitor,
  MousePointerClick,
  Percent,
  Radio,
  Repeat2,
  Route,
  Share2,
  Smartphone,
  Sparkles,
  Tablet,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
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
  if (!seconds || seconds <= 0) return "0s";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem > 0 ? `${minutes}m ${rem}s` : `${minutes}m`;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return dateStr;
  }
}

// Country Code & Name to Real Flag Emoji
function getCountryFlag(countryName: string): string {
  if (!countryName || countryName === "Unknown") return "🌐";
  const name = countryName.toLowerCase().trim();

  const flags: Record<string, string> = {
    nigeria: "🇳🇬",
    ng: "🇳🇬",
    "united states": "🇺🇸",
    us: "🇺🇸",
    usa: "🇺🇸",
    "united kingdom": "🇬🇧",
    uk: "🇬🇧",
    gb: "🇬🇧",
    canada: "🇨🇦",
    ca: "🇨🇦",
    germany: "🇩🇪",
    de: "🇩🇪",
    france: "🇫🇷",
    fr: "🇫🇷",
    ghana: "🇬🇭",
    gh: "🇬🇭",
    kenya: "🇰🇪",
    ke: "🇰🇪",
    "south africa": "🇿🇦",
    za: "🇿🇦",
    india: "🇮🇳",
    in: "🇮🇳",
    netherlands: "🇳🇱",
    nl: "🇳🇱",
    brazil: "🇧🇷",
    br: "🇧🇷",
    australia: "🇦🇺",
    au: "🇦🇺",
    japan: "🇯🇵",
    jp: "🇯🇵",
    spain: "🇪🇸",
    es: "🇪🇸",
    italy: "🇮🇹",
    it: "🇮🇹",
    sweden: "🇸🇪",
    se: "🇸🇪",
    switzerland: "🇨🇭",
    ch: "🇨🇭",
    singapore: "🇸🇬",
    sg: "🇸🇬",
    uae: "🇦🇪",
    "united arab emirates": "🇦🇪",
    ae: "🇦🇪",
    ireland: "🇮🇪",
    ie: "🇮🇪",
    rwanda: "🇷🇼",
    rw: "🇷🇼",
    egypt: "🇪🇬",
    eg: "🇪🇬",
    china: "🇨🇳",
    cn: "🇨🇳",
  };

  return flags[name] || "🌍";
}

function getSourceStyle(source: string) {
  const s = source.toLowerCase();
  if (s.includes("direct")) return { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
  if (s.includes("google")) return { color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" };
  if (s.includes("twitter") || s.includes("x.com") || s.includes("t.co")) return { color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20" };
  if (s.includes("linkedin")) return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
  if (s.includes("github")) return { color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" };
  if (s.includes("instagram")) return { color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" };
  return { color: "text-zinc-400", bg: "bg-white/[0.03]", border: "border-white/10" };
}

/* ── Modern Breakdown Bento Component ── */
function ModernBreakdown({
  title,
  subtitle,
  icon: Icon,
  rows,
  type = "default",
}: {
  title: string;
  subtitle?: string;
  icon?: typeof Globe2;
  rows: MetricRow[];
  type?: "default" | "country" | "source" | "action";
}) {
  const total = rows.reduce((sum, row) => sum + Number(row.value), 0);
  const max = Math.max(1, ...rows.map((row) => Number(row.value)));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/50 p-5.5 backdrop-blur-md transition-all hover:border-white/15">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-accent">
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              {subtitle && <p className="text-[11px] text-zinc-400">{subtitle}</p>}
            </div>
          </div>
          <span className="font-mono text-xs font-medium text-zinc-400">
            {number.format(total)} total
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {rows.length ? (
            rows.slice(0, 8).map((row) => {
              const pct = total ? Math.round((row.value / total) * 100) : 0;
              const barWidth = Math.max(3, (row.value / max) * 100);

              let displayPrefix = null;
              if (type === "country") {
                displayPrefix = (
                  <span className="mr-2 text-base leading-none">
                    {getCountryFlag(row.label)}
                  </span>
                );
              }

              return (
                <div key={row.label} className="group">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span
                      className="flex max-w-[70%] items-center truncate text-zinc-300 transition-colors group-hover:text-white"
                      title={row.label}
                    >
                      {displayPrefix}
                      <span className="truncate font-medium">{row.label}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 font-mono">
                      <span className="font-semibold text-white">
                        {number.format(row.value)}
                      </span>
                      <span className="w-8 text-right text-[10px] text-zinc-400">
                        {pct}%
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.04]">
                    <div
                      className="h-full rounded-full bg-emerald-400/80 transition-all duration-500 group-hover:bg-emerald-400"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-xs text-zinc-400">
              No recorded activity in this period.
            </p>
          )}
        </div>
      </div>
    </div>
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
          <p className="font-semibold text-amber-200">Analytics configuration check</p>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Could not fetch analytics payload from Supabase. Ensure migrations are up to date.
          </p>
          <p className="mt-3 font-mono text-xs text-white/30">{error?.message}</p>
        </div>
      </div>
    );
  }

  // Quick stats calculation
  const totalVisitors = analytics.summary.visitors || 0;
  const newVisitors = analytics.summary.new_visitors || 0;
  const returningVisitors = analytics.summary.returning_visitors || 0;
  const newVisitorPct = totalVisitors ? Math.round((newVisitors / totalVisitors) * 100) : 0;
  const returningVisitorPct = totalVisitors ? Math.round((returningVisitors / totalVisitors) * 100) : 0;

  // Device split
  const deviceCounts: Record<string, number> = {};
  analytics.devices.forEach((d) => {
    deviceCounts[d.label.toLowerCase()] = d.value;
  });
  const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0) || 1;
  const desktopPct = Math.round(((deviceCounts["desktop"] || 0) / totalDevices) * 100);
  const mobilePct = Math.round(((deviceCounts["mobile"] || 0) / totalDevices) * 100);
  const tabletPct = Math.max(0, 100 - desktopPct - mobilePct);

  // Primary Metrics
  const viewsDelta = delta(analytics.summary.views, analytics.previous.views);
  const visitorsDelta = delta(analytics.summary.visitors, analytics.previous.visitors);
  const engagementDelta = delta(analytics.summary.avg_engagement, analytics.previous.avg_engagement);
  const actionsDelta = delta(analytics.summary.actions, analytics.previous.actions);
  const bounceDelta = delta(analytics.summary.bounce_rate, analytics.previous.bounce_rate);

  return (
    <div className="space-y-7 p-4 sm:p-6 lg:p-8">
      {/* ── Header HUD & Live Status ── */}
      <header className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">
                Intelligence &amp; Analytics
              </h1>
              <div className="flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{analytics.summary.active_now} active right now</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Live portfolio acquisition, reader engagement, conversion intent &amp; audience signals.
            </p>
          </div>

          <div className="text-right font-mono text-xs text-zinc-400">
            <p>{analytics.period.label}</p>
            <p className="text-[11px] text-zinc-400">Africa/Lagos (UTC+1)</p>
          </div>
        </div>

        {/* Range Selector & Multi-Filters */}
        <AnalyticsControls
          preset={range.preset}
          from={range.from}
          to={range.to}
          options={analytics.filters}
        />
      </header>

      {/* ── Primary Bento KPI Grid (4 Hero Cards) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Page Views */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Total Views
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {number.format(analytics.summary.views)}
            </span>
            {compare && (
              <span
                className={`flex items-center text-xs font-bold ${
                  viewsDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {viewsDelta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {viewsDelta > 0 ? "+" : ""}
                {viewsDelta}%
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 font-mono text-[11px] text-zinc-400">
            <span>Views / Session</span>
            <span className="font-semibold text-white">
              {analytics.summary.views_per_session.toFixed(1)}
            </span>
          </div>
        </div>

        {/* 2. Unique Visitors with New vs Returning Split */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Unique Visitors
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {number.format(analytics.summary.visitors)}
            </span>
            {compare && (
              <span
                className={`flex items-center text-xs font-bold ${
                  visitorsDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {visitorsDelta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {visitorsDelta > 0 ? "+" : ""}
                {visitorsDelta}%
              </span>
            )}
          </div>
          {/* New vs Returning mini progress bar */}
          <div className="mt-3 space-y-1 border-t border-white/5 pt-2.5">
            <div className="flex justify-between font-mono text-[10.5px] text-zinc-400">
              <span>{newVisitorPct}% New</span>
              <span>{returningVisitorPct}% Returning</span>
            </div>
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className="bg-sky-400" style={{ width: `${newVisitorPct}%` }} />
              <div className="bg-purple-400" style={{ width: `${returningVisitorPct}%` }} />
            </div>
          </div>
        </div>

        {/* 3. Avg Engagement Duration */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Avg. Engagement
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-400/10 text-purple-400">
              <Clock3 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {formatDuration(analytics.summary.avg_engagement)}
            </span>
            {compare && (
              <span
                className={`flex items-center text-xs font-bold ${
                  engagementDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {engagementDelta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {engagementDelta > 0 ? "+" : ""}
                {engagementDelta}%
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 font-mono text-[11px] text-zinc-400">
            <span>Bounce Rate</span>
            <span
              className={`font-semibold ${
                analytics.summary.bounce_rate < 45
                  ? "text-emerald-400"
                  : analytics.summary.bounce_rate < 65
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {analytics.summary.bounce_rate}%
            </span>
          </div>
        </div>

        {/* 4. High-Intent Actions & Conversion */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5.5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Conversion Actions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400">
              <MousePointerClick className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">
              {number.format(analytics.summary.actions)}
            </span>
            {compare && (
              <span
                className={`flex items-center text-xs font-bold ${
                  actionsDelta >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {actionsDelta >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {actionsDelta > 0 ? "+" : ""}
                {actionsDelta}%
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 font-mono text-[11px] text-zinc-400">
            <span>Action Rate</span>
            <span className="font-semibold text-emerald-400">
              {analytics.summary.conversion_rate}%
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Trend Visualizer Card ── */}
      <section className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5.5 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Traffic &amp; Engagement Trend</h2>
            <p className="text-xs text-zinc-400">
              Hover across data points to inspect detailed volume metrics.
            </p>
          </div>
        </div>
        <AnalyticsTrend
          data={analytics.trend}
          granularity={analytics.period.granularity}
        />
      </section>

      {/* ── Intelligence Bento Grid: Audience, Geography & Devices ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic Sources */}
        <ModernBreakdown
          title="Traffic Channels & Referrers"
          subtitle="Where your visitors arrive from"
          icon={Compass}
          rows={analytics.referrers}
          type="source"
        />

        {/* Geographic Reach */}
        <ModernBreakdown
          title="Top Countries"
          subtitle="Global visitor distribution"
          icon={Globe2}
          rows={analytics.countries}
          type="country"
        />

        {/* Device & Platform Distribution */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-900/50 p-5.5 backdrop-blur-md transition-all hover:border-white/15">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-accent">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Device &amp; Platform Mix</h2>
                  <p className="text-[11px] text-zinc-400">Desktop vs Mobile vs Tablet</p>
                </div>
              </div>
            </div>

            {/* Split Visual Bar */}
            <div className="space-y-2 py-2">
              <div className="flex justify-between font-mono text-xs text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <Monitor className="h-3.5 w-3.5 text-emerald-400" />
                  Desktop ({desktopPct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-sky-400" />
                  Mobile ({mobilePct}%)
                </span>
                <span className="flex items-center gap-1.5">
                  <Tablet className="h-3.5 w-3.5 text-purple-400" />
                  Tablet ({tabletPct}%)
                </span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-white/5">
                <div className="bg-emerald-400" style={{ width: `${desktopPct}%` }} />
                <div className="bg-sky-400" style={{ width: `${mobilePct}%` }} />
                <div className="bg-purple-400" style={{ width: `${tabletPct}%` }} />
              </div>
            </div>

            {/* Top Browsers & Operating Systems */}
            <div className="mt-4 border-t border-white/5 pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Top Browsers &amp; OS
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {analytics.browsers.slice(0, 4).map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5 font-mono text-zinc-300"
                  >
                    <span className="truncate">{b.label}</span>
                    <span className="font-bold text-white">{number.format(b.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Conversion & High-Intent Action Hub ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* High-Intent Portfolio Actions */}
        <ModernBreakdown
          title="High-Intent Actions & Interactions"
          subtitle="Email copies, CV downloads & social clicks"
          icon={MousePointerClick}
          rows={analytics.actions}
          type="action"
        />

        {/* Top Cities */}
        <ModernBreakdown
          title="Top Cities"
          subtitle="Specific metro areas & locations"
          icon={MapPin}
          rows={analytics.cities}
        />
      </div>

      {/* ── Page Performance & Reading Depth Table ── */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 p-5.5">
          <div>
            <h2 className="text-base font-bold text-white">Content &amp; Page Performance</h2>
            <p className="text-xs text-zinc-400">
              Views, unique readers, and average engagement per path.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Page Route</th>
                <th className="px-6 py-3.5 text-right font-semibold">Views</th>
                <th className="px-6 py-3.5 text-right font-semibold">Unique Visitors</th>
                <th className="px-6 py-3.5 text-right font-semibold">Avg. Engagement</th>
                <th className="px-6 py-3.5 text-right font-semibold">Exit Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
              {analytics.page_details.map((page) => {
                const exitRate = page.views ? Math.round((page.exits / page.views) * 100) : 0;
                return (
                  <tr key={page.path} className="transition-colors hover:bg-white/[0.02]">
                    <td className="max-w-md truncate px-6 py-4 font-sans font-medium text-white">
                      {page.path}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white">
                      {number.format(page.views)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {number.format(page.visitors)}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-400">
                      {formatDuration(page.engagement)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] ${
                          exitRate < 35
                            ? "bg-emerald-400/10 text-emerald-400"
                            : exitRate < 60
                            ? "bg-amber-400/10 text-amber-400"
                            : "bg-rose-400/10 text-rose-400"
                        }`}
                      >
                        {exitRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Real-Time Live Visit Stream ── */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-white/10 p-5.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Live Activity Stream</h2>
              <p className="text-xs text-zinc-400">
                Latest 50 recorded page views with device and location attribution.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="border-b border-white/5 bg-white/[0.02] uppercase tracking-wider text-zinc-400 font-mono">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Page</th>
                <th className="px-6 py-3.5 font-semibold">Location</th>
                <th className="px-6 py-3.5 font-semibold">Traffic Source</th>
                <th className="px-6 py-3.5 font-semibold">Platform &amp; Browser</th>
                <th className="px-6 py-3.5 text-right font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {analytics.recent.map((visit, index) => {
                const srcStyle = getSourceStyle(visit.source);
                const flag = getCountryFlag(visit.country);
                const locationText = [visit.city, visit.country].filter(Boolean).join(", ") || "Unknown Location";

                return (
                  <tr
                    key={`${visit.occurred_at}-${index}`}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="max-w-xs truncate px-6 py-3.5 font-medium text-white">
                      {visit.path}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                        <span className="text-sm leading-none">{flag}</span>
                        <span className="truncate">{locationText}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${srcStyle.bg} ${srcStyle.color} ${srcStyle.border}`}
                      >
                        {visit.source}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-zinc-400">
                      {visit.device} · {visit.browser}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono text-[11px] text-zinc-400">
                      {formatRelativeTime(visit.occurred_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
