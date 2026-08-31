"use client";

import { useState } from "react";
import { Eye, Users, Activity, MousePointerClick, TrendingUp } from "lucide-react";

export type AnalyticsPoint = {
  label: string;
  full_label: string;
  views: number;
  visitors: number;
  sessions: number;
  actions: number;
};

type Metric = "views" | "visitors" | "sessions" | "actions";

const metrics: {
  key: Metric;
  label: string;
  icon: typeof Eye;
  color: string;
  bgLight: string;
  gradientId: string;
}[] = [
  {
    key: "views",
    label: "Page Views",
    icon: Eye,
    color: "#22c55e",
    bgLight: "rgba(34, 197, 94, 0.15)",
    gradientId: "trend-views-gradient",
  },
  {
    key: "visitors",
    label: "Visitors",
    icon: Users,
    color: "#38bdf8",
    bgLight: "rgba(56, 189, 248, 0.15)",
    gradientId: "trend-visitors-gradient",
  },
  {
    key: "sessions",
    label: "Sessions",
    icon: Activity,
    color: "#a855f7",
    bgLight: "rgba(168, 85, 247, 0.15)",
    gradientId: "trend-sessions-gradient",
  },
  {
    key: "actions",
    label: "High-Intent Actions",
    icon: MousePointerClick,
    color: "#f59e0b",
    bgLight: "rgba(245, 158, 11, 0.15)",
    gradientId: "trend-actions-gradient",
  },
];

export default function AnalyticsTrend({
  data,
  granularity,
}: {
  data: AnalyticsPoint[];
  granularity: string;
}) {
  const [metric, setMetric] = useState<Metric>("views");
  const [hovered, setHovered] = useState<number | null>(null);

  const width = 1000;
  const height = 240;
  const active = metrics.find((item) => item.key === metric)!;

  const totalMetric = data.reduce((acc, point) => acc + (point[metric] || 0), 0);
  const max = Math.max(1, ...data.map((point) => point[metric] || 0));
  const peakPoint = data.reduce(
    (best, p) => (p[metric] > (best ? best[metric] : -1) ? p : best),
    data[0] || null
  );

  const x = (index: number) =>
    data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width;

  const y = (value: number) => height - (value / max) * (height - 28);

  const line = data
    .map((point, index) => `${x(index)},${y(point[metric] || 0)}`)
    .join(" ");

  const area = data.length ? `0,${height} ${line} ${width},${height}` : "";

  return (
    <div className="space-y-4">
      {/* ── Metric Selector Tabs & Overview ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-950/60 p-1">
          {metrics.map((item) => {
            const Icon = item.icon;
            const isSelected = metric === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMetric(item.key)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-white/15 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Icon className="h-3.5 w-3.5 opacity-70" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
          {peakPoint && (
            <span className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span>Peak: {peakPoint[metric].toLocaleString()} on {peakPoint.label}</span>
            </span>
          )}
          <span className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-1 uppercase text-[10px] tracking-wider text-zinc-400">
            {granularity} intervals
          </span>
        </div>
      </div>

      {/* ── Interactive SVG Area Chart ── */}
      <div className="relative pt-2">
        {/* Floating Scrubber HUD Tooltip */}
        {hovered !== null && data[hovered] && (
          <div
            className="pointer-events-none absolute top-0 z-20 -translate-x-1/2 rounded-xl border border-white/15 bg-zinc-900/95 p-3 text-xs shadow-2xl backdrop-blur-md transition-transform"
            style={{
              left: `${Math.min(92, Math.max(8, (x(hovered) / width) * 100))}%`,
            }}
          >
            <p className="mb-1.5 font-mono text-[11px] font-semibold text-zinc-400">
              {data[hovered].full_label}
            </p>
            <div className="space-y-1 font-mono">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Views:
                </span>
                <span className="font-bold text-white">
                  {data[hovered].views.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  Visitors:
                </span>
                <span className="font-bold text-white">
                  {data[hovered].visitors.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  Sessions:
                </span>
                <span className="font-bold text-white">
                  {data[hovered].sessions.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Actions:
                </span>
                <span className="font-bold text-amber-400">
                  {data[hovered].actions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-64 w-full overflow-visible"
          role="img"
          aria-label={`${active.label} over time`}
          onMouseLeave={() => setHovered(null)}
          onMouseMove={(event) => {
            if (!data.length) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const position = Math.max(
              0,
              Math.min(1, (event.clientX - rect.left) / rect.width)
            );
            setHovered(Math.round(position * (data.length - 1)));
          }}
        >
          <defs>
            <linearGradient id="trend-active-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={active.color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step) => (
            <g key={step}>
              <line
                x1="0"
                x2={width}
                y1={height * step}
                y2={height * step}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
              <text
                x="4"
                y={Math.max(12, height * step - 5)}
                fill="rgba(255, 255, 255, 0.25)"
                fontSize="10"
                fontFamily="monospace"
              >
                {Math.round(max * (1 - step)).toLocaleString()}
              </text>
            </g>
          ))}

          {/* Plot Data */}
          {data.length > 0 && (
            <>
              <polygon points={area} fill="url(#trend-active-gradient)" />
              <polyline
                points={line}
                fill="none"
                stroke={active.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Scrubber vertical line and focus dot */}
              {hovered !== null && (
                <>
                  <line
                    x1={x(hovered)}
                    x2={x(hovered)}
                    y1="0"
                    y2={height}
                    stroke="rgba(255, 255, 255, 0.25)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={x(hovered)}
                    cy={y(data[hovered][metric] || 0)}
                    r="5"
                    fill={active.color}
                    stroke="#09090b"
                    strokeWidth="2.5"
                  />
                </>
              )}
            </>
          )}
        </svg>
      </div>

      {/* Axis labels */}
      <div className="flex justify-between font-mono text-[11px] text-zinc-400">
        <span>{data[0]?.label ?? "No data"}</span>
        <span>{data.at(-1)?.label ?? ""}</span>
      </div>
    </div>
  );
}
