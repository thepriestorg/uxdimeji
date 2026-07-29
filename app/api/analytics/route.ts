import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENTS = new Set([
  "page_view",
  "engagement",
  "outbound_click",
  "file_download",
]);

function userAgentDetails(value: string) {
  const device = /tablet|ipad/i.test(value)
    ? "Tablet"
    : /mobile|iphone|android/i.test(value)
      ? "Mobile"
      : "Desktop";
  const browser = /edg\//i.test(value)
    ? "Edge"
    : /opr\/|opera/i.test(value)
      ? "Opera"
      : /chrome|crios/i.test(value)
        ? "Chrome"
        : /safari/i.test(value)
          ? "Safari"
          : /firefox|fxios/i.test(value)
            ? "Firefox"
            : "Other";
  const os = /windows/i.test(value)
    ? "Windows"
    : /iphone|ipad|ios/i.test(value)
      ? "iOS"
      : /android/i.test(value)
        ? "Android"
        : /mac os|macintosh/i.test(value)
          ? "macOS"
          : /linux/i.test(value)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}

export async function POST(request: NextRequest) {
  if (request.headers.get("dnt") === "1") {
    return new NextResponse(null, { status: 204 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (/bot|crawler|spider|preview|lighthouse|headless/i.test(userAgent)) {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = String(body.eventName || "");
  const path = String(body.path || "");
  const visitorId = String(body.visitorId || "");
  const sessionId = String(body.sessionId || "");

  if (
    !EVENTS.has(eventName) ||
    !path.startsWith("/") ||
    path.startsWith("/admin") ||
    path.length > 500 ||
    !UUID_PATTERN.test(visitorId) ||
    !UUID_PATTERN.test(sessionId)
  ) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const metadata =
    body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
      ? Object.fromEntries(
          Object.entries(body.metadata as Record<string, unknown>)
            .slice(0, 10)
            .map(([key, value]) => [key.slice(0, 50), String(value).slice(0, 500)]),
        )
      : {};
  const details = userAgentDetails(userAgent);
  const supabase = await createClient();
  const { error } = await supabase.rpc("track_analytics_event", {
    p_event_name: eventName,
    p_visitor_id: visitorId,
    p_session_id: sessionId,
    p_path: path,
    p_referrer: String(body.referrer || "").slice(0, 1000) || null,
    p_country: request.headers.get("x-vercel-ip-country") || null,
    p_city: request.headers.get("x-vercel-ip-city") || null,
    p_device: details.device,
    p_browser: details.browser,
    p_os: details.os,
    p_engagement_seconds: Math.max(
      0,
      Math.min(Number(body.engagementSeconds) || 0, 1800),
    ),
    p_metadata: metadata,
  });

  if (error) {
    console.error("Analytics ingestion failed:", error.message);
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 });
  }

  return new NextResponse(null, { status: 202 });
}
