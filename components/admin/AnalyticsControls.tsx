"use client";

import { CalendarDays, Download, Filter, X } from "lucide-react";
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
  ["7d", "7 days"],
  ["30d", "30 days"],
  ["90d", "90 days"],
  ["12m", "12 months"],
  ["all", "All time"],
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
    searchParams.get(key),
  ).length;
  const exportUrl = `/api/analytics/export?${searchParams.toString()}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[.03] p-1">
          {presets.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setCustomOpen(false);
                update({ preset: key, from: null, to: null });
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs transition ${
                preset === key
                  ? "bg-accent font-semibold text-black"
                  : "text-white/45 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomOpen((value) => !value)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-xs transition ${
              preset === "custom"
                ? "bg-accent font-semibold text-black"
                : "text-white/45 hover:text-white"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Custom
          </button>
        </div>
        <a
          href={exportUrl}
          className="ml-auto flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-white/55 transition hover:bg-white/5 hover:text-white"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </a>
      </div>

      {customOpen && (
        <form
          className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[.03] p-4"
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
          <label className="text-xs text-white/45">
            <span className="mb-1.5 block">Start date</span>
            <input
              name="from"
              type="date"
              required
              max={to}
              defaultValue={from}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-white [color-scheme:dark]"
            />
          </label>
          <label className="text-xs text-white/45">
            <span className="mb-1.5 block">End date</span>
            <input
              name="to"
              type="date"
              required
              min={from}
              defaultValue={to}
              className="rounded-lg border border-white/10 bg-black px-3 py-2 text-white [color-scheme:dark]"
            />
          </label>
          <button className="rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-black">
            Apply range
          </button>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-2 text-xs text-white/35">
          <Filter className="h-3.5 w-3.5" />
          Filters {filterCount ? `(${filterCount})` : ""}
        </span>
        {(
          [
            ["page", "All pages", options.pages],
            ["country", "All countries", options.countries],
            ["device", "All devices", options.devices],
            ["source", "All sources", options.sources],
          ] as const
        ).map(([key, placeholder, values]) => (
          <select
            key={key}
            value={searchParams.get(key) || ""}
            onChange={(event) => update({ [key]: event.target.value || null })}
            className="max-w-48 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-xs text-white/60 outline-none hover:border-white/20"
            aria-label={placeholder}
          >
            <option value="">{placeholder}</option>
            {values.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        ))}
        {filterCount > 0 && (
          <button
            type="button"
            onClick={() =>
              update({ page: null, country: null, device: null, source: null })
            }
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-white/35 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-white/45">
          <input
            type="checkbox"
            checked={searchParams.get("compare") !== "0"}
            onChange={(event) => update({ compare: event.target.checked ? null : "0" })}
            className="accent-lime-300"
          />
          Compare previous period
        </label>
      </div>
    </div>
  );
}
