import AnalyticsTrend from "@/components/admin/AnalyticsTrend";
import { createClient } from "@/lib/supabase/server";
import {
  Activity,
  Clock3,
  Eye,
  Laptop,
  MousePointerClick,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type MetricRow = { label: string; value: number };
type RecentVisit = {
  occurred_at: string;
  path: string;
  country: string;
  device: string;
  browser: string;
};
type DashboardData = {
  summary: {
    views: number;
    visitors: number;
    sessions: number;
    avg_engagement: number;
    bounce_rate: number;
    actions: number;
  };
  previous: { views: number; visitors: number; sessions: number };
  trend: { date: string; views: number; visitors: number }[];
  top_pages: MetricRow[];
  referrers: MetricRow[];
  countries: MetricRow[];
  devices: MetricRow[];
  browsers: MetricRow[];
  campaigns: MetricRow[];
  actions: MetricRow[];
  recent: RecentVisit[];
};

const ranges = [7, 30, 90];
const number = new Intl.NumberFormat("en");

function change(current: number, previous: number) {
  if (!previous) return current ? "+100%" : "—";
  const value = Math.round(((current - previous) / previous) * 100);
  return `${value > 0 ? "+" : ""}${value}%`;
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: MetricRow[];
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
      <h2 className="mb-5 font-semibold text-white">{title}</h2>
      <div className="space-y-4">
        {rows.length ? (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
                <span className="truncate text-white/70">{row.label}</span>
                <span className="font-mono text-white">{number.format(row.value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(3, (row.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-white/35">No data in this period yet.</p>
        )}
      </div>
    </section>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const requestedDays = Number(params.days);
  const days = ranges.includes(requestedDays) ? requestedDays : 30;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data, error } = await supabase.rpc("get_analytics_dashboard", {
    p_days: days,
  });
  const analytics = data as DashboardData | null;

  if (error || !analytics) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="mt-8 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6">
          <p className="font-medium text-amber-200">Analytics database setup required</p>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Apply the latest Supabase migration, then revisit this page. Tracking will
            begin as soon as the migration is live.
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Page views", value: analytics.summary.views, icon: Eye, previous: analytics.previous.views },
    { label: "Visitors", value: analytics.summary.visitors, icon: Users, previous: analytics.previous.visitors },
    { label: "Sessions", value: analytics.summary.sessions, icon: Activity, previous: analytics.previous.sessions },
    { label: "Avg. engagement", value: `${analytics.summary.avg_engagement}s`, icon: Clock3 },
    { label: "Bounce rate", value: `${analytics.summary.bounce_rate}%`, icon: Laptop },
    { label: "Tracked actions", value: analytics.summary.actions, icon: MousePointerClick },
  ];

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="mt-2 text-white/45">Your portfolio performance, in one place.</p>
        </div>
        <div className="flex rounded-xl border border-white/10 bg-white/[.03] p-1">
          {ranges.map((range) => (
            <Link
              key={range}
              href={`/admin/analytics?days=${range}`}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                days === range ? "bg-accent font-semibold text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {range} days
            </Link>
          ))}
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
            <card.icon className="mb-5 h-5 w-5 text-accent" />
            <p className="text-2xl font-bold text-white">
              {typeof card.value === "number" ? number.format(card.value) : card.value}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className="text-white/40">{card.label}</span>
              {"previous" in card && (
                <span className={change(Number(card.value), card.previous ?? 0).startsWith("-") ? "text-red-400" : "text-emerald-400"}>
                  {change(Number(card.value), card.previous ?? 0)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[.03] p-6">
        <div className="mb-6">
          <h2 className="font-semibold text-white">Traffic trend</h2>
          <p className="mt-1 text-xs text-white/35">Daily page views for the selected period</p>
        </div>
        <AnalyticsTrend data={analytics.trend} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Breakdown title="Top pages" rows={analytics.top_pages} />
        <Breakdown title="Traffic sources" rows={analytics.referrers} />
        <Breakdown title="Countries" rows={analytics.countries} />
        <Breakdown title="Devices" rows={analytics.devices} />
        <Breakdown title="Browsers" rows={analytics.browsers} />
        <Breakdown title="Campaigns" rows={analytics.campaigns} />
        <Breakdown title="Clicks & downloads" rows={analytics.actions} />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="font-semibold text-white">Recent visits</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-white/30">
              <tr>
                <th className="px-6 py-4 font-medium">Page</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Device</th>
                <th className="px-6 py-4 font-medium">Browser</th>
                <th className="px-6 py-4 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/65">
              {analytics.recent.map((visit, index) => (
                <tr key={`${visit.occurred_at}-${index}`}>
                  <td className="max-w-xs truncate px-6 py-4 font-medium text-white">{visit.path}</td>
                  <td className="px-6 py-4">{visit.country || "Unknown"}</td>
                  <td className="px-6 py-4">{visit.device}</td>
                  <td className="px-6 py-4">{visit.browser}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {new Date(visit.occurred_at).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}
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
