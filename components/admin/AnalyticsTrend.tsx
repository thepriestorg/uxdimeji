"use client";

import { useState } from "react";

export type AnalyticsPoint = {
  label: string;
  full_label: string;
  views: number;
  visitors: number;
  sessions: number;
  actions: number;
};

type Metric = "views" | "visitors" | "sessions" | "actions";

const metrics: { key: Metric; label: string; color: string }[] = [
  { key: "views", label: "Views", color: "#d9ff43" },
  { key: "visitors", label: "Visitors", color: "#60a5fa" },
  { key: "sessions", label: "Sessions", color: "#c084fc" },
  { key: "actions", label: "Actions", color: "#fb923c" },
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
  const height = 260;
  const active = metrics.find((item) => item.key === metric)!;
  const max = Math.max(1, ...data.map((point) => point[metric]));
  const x = (index: number) =>
    data.length <= 1 ? width / 2 : (index / (data.length - 1)) * width;
  const y = (value: number) => height - (value / max) * (height - 24);
  const line = data
    .map((point, index) => `${x(index)},${y(point[metric])}`)
    .join(" ");
  const area = data.length ? `0,${height} ${line} ${width},${height}` : "";

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {metrics.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetric(item.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              metric === item.key
                ? "bg-white/10 text-white"
                : "text-white/35 hover:text-white/70"
            }`}
          >
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </button>
        ))}
        <span className="ml-auto self-center text-xs capitalize text-white/30">
          {granularity} intervals
        </span>
      </div>

      <div className="relative">
        {hovered !== null && data[hovered] && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-xs shadow-xl"
            style={{ left: `${(x(hovered) / width) * 100}%` }}
          >
            <p className="whitespace-nowrap text-white/45">{data[hovered].full_label}</p>
            <p className="mt-1 font-semibold text-white">
              {data[hovered][metric].toLocaleString()} {active.label.toLowerCase()}
            </p>
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
            const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            setHovered(Math.round(position * (data.length - 1)));
          }}
        >
          <defs>
            <linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={active.color} stopOpacity=".28" />
              <stop offset="100%" stopColor={active.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((step) => (
            <g key={step}>
              <line
                x1="0"
                x2={width}
                y1={height * step}
                y2={height * step}
                stroke="rgba(255,255,255,.07)"
              />
              <text x="4" y={Math.max(12, height * step - 5)} fill="rgba(255,255,255,.25)" fontSize="11">
                {Math.round(max * (1 - step)).toLocaleString()}
              </text>
            </g>
          ))}
          {data.length > 0 && (
            <>
              <polygon points={area} fill="url(#analytics-fill)" />
              <polyline
                points={line}
                fill="none"
                stroke={active.color}
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {hovered !== null && (
                <>
                  <line
                    x1={x(hovered)}
                    x2={x(hovered)}
                    y1="0"
                    y2={height}
                    stroke="rgba(255,255,255,.18)"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={x(hovered)}
                    cy={y(data[hovered][metric])}
                    r="6"
                    fill={active.color}
                    stroke="#18181b"
                    strokeWidth="3"
                  />
                </>
              )}
            </>
          )}
        </svg>
      </div>
      <div className="mt-3 flex justify-between text-xs text-white/35">
        <span>{data[0]?.label ?? "No data"}</span>
        <span>{data.at(-1)?.label ?? ""}</span>
      </div>
    </div>
  );
}
