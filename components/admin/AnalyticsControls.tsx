"use client";

import { CalendarDays, Download, Filter, X, ArrowUpDown, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Options = {
  pages: string[];
  countries: string[];
  devices: string[];
  sources: string[];
};

const presets = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["7d", "7 Days"],
  ["30d", "30 Days"],
  ["90d", "90 Days"],
  ["12m", "12 Months"],
  ["all", "All Time"],
] as const;

export default function AnalyticsControls({
  preset,
  from,
  to,
  options,
}: {
  preset: string;
  from: string;
  to: string;
  options: Options;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customOpen, setCustomOpen] = useState(preset === "custom");

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    router.push(`${pathname}?${next.toString()}`);
  };

  const filterCount = ["page", "country", "device", "source"].filter((key) =>
    searchParams.get(key)
  ).length;
  const exportUrl = `/api/analytics/export?${searchParams.toString()}`;

  return (
    <div className="space-y-3.5">
      {/* ── Top Bar: Presets + Range + Export ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Segmented Range Pills */}
        <div className="flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/70 p-1 backdrop-blur-md">
          {presets.map(([key, label]) => {
            const isActive = preset === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCustomOpen(false);
                  update({ preset: key, from: null, to: null });
                }}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-accent font-semibold text-black shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              preset === "custom" || customOpen
                ? "bg-accent font-semibold text-black shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Custom</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 px-3.5 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-3.5 w-3.5 text-accent" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* ── Custom Date Range Panel ── */}
      {customOpen && (
        <form
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 p-4.5 backdrop-blur-md"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            update({
              preset: "custom",
              from: String(form.get("from") || ""),
              to: String(form.get("to") || ""),
            });
          }}
        >
          <label className="text-xs text-zinc-400">
            <span className="mb-1.5 block font-medium">Start date</span>
            <input
              name="from"
              type="date"
              required
              max={to}
              defaultValue={from}
              className="rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 text-xs text-white outline-none focus:border-accent [color-scheme:dark]"
            />
          </label>
          <label className="text-xs text-zinc-400">
            <span className="mb-1.5 block font-medium">End date</span>
            <input
              name="to"
              type="date"
              required
              min={from}
              defaultValue={to}
              className="rounded-xl border border-white/10 bg-black/80 px-3.5 py-2 text-xs text-white outline-none focus:border-accent [color-scheme:dark]"
            />
          </label>
          <button className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-black transition hover:opacity-90">
            Apply Date Range
          </button>
        </form>
      )}

      {/* ── Filters Bar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-2">
        <span className="mr-1 flex items-center gap-1.5 px-2 text-xs font-medium text-zinc-400">
          <Filter className="h-3.5 w-3.5 text-accent" />
          <span>Filters</span>
          {filterCount > 0 && (
            <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent/20 px-1 font-mono text-[10px] font-bold text-accent">
              {filterCount}
            </span>
          )}
        </span>

        {(
          [
            ["page", "All pages", options.pages],
            ["country", "All countries", options.countries],
            ["device", "All devices", options.devices],
            ["source", "All sources", options.sources],
          ] as const
        ).map(([key, placeholder, values]) => {
          const val = searchParams.get(key) || "";
          const isSelected = Boolean(val);
          return (
            <div key={key} className="relative">
              <select
                value={val}
                onChange={(event) => update({ [key]: event.target.value || null })}
                className={`h-8 max-w-44 appearance-none rounded-lg border px-2.5 pr-7 text-xs font-medium outline-none transition ${
                  isSelected
                    ? "border-accent/40 bg-accent/10 text-white"
                    : "border-white/10 bg-zinc-950/80 text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
                aria-label={placeholder}
              >
                <option value="">{placeholder}</option>
                {values.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-zinc-400" />
            </div>
          );
        })}

        {filterCount > 0 && (
          <button
            type="button"
            onClick={() =>
              update({ page: null, country: null, device: null, source: null })
            }
            className="flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
          >
            <X className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}

        <label className="ml-auto flex cursor-pointer select-none items-center gap-2 px-2 text-xs font-medium text-zinc-400 hover:text-zinc-200">
          <input
            type="checkbox"
            checked={searchParams.get("compare") !== "0"}
            onChange={(event) =>
              update({ compare: event.target.checked ? null : "0" })
            }
            className="h-3.5 w-3.5 rounded border-white/20 bg-zinc-900 accent-emerald-400"
          />
          <span>Compare previous period</span>
        </label>
      </div>
    </div>
  );
}
