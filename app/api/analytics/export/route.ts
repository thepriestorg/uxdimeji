import { resolveAnalyticsRange } from "@/lib/analytics-range";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams;
  const range = resolveAnalyticsRange({
    preset: query.get("preset") || undefined,
    from: query.get("from") || undefined,
    to: query.get("to") || undefined,
  });
  const { data, error } = await supabase.rpc("export_analytics_events", {
    p_start: range.start,
    p_end: range.end,
    p_path: query.get("page") || null,
    p_country: query.get("country") || null,
    p_device: query.get("device") || null,
    p_source: query.get("source") || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data || []) as Record<string, unknown>[];
  const headers = [
    "occurred_at",
    "event_name",
    "path",
    "source",
    "country",
    "city",
    "device",
    "browser",
    "operating_system",
    "engagement_seconds",
    "campaign",
    "campaign_source",
    "campaign_medium",
    "action_label",
    "action_url",
  ];
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="portfolio-analytics-${range.preset}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
