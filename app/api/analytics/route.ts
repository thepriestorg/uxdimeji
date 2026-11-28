import { createPublicClient } from "@/lib/supabase/public";
import { NextRequest, NextResponse } from "next/server";
import { BOT_PATTERN, userAgentDetails } from "@/lib/analytics-ua";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EVENTS = new Set([
  "page_view",
  "engagement",
  "outbound_click",
  "file_download",
]);

// Vercel and Netlify each put the visitor's location in their own headers.
function visitorLocation(request: NextRequest) {
  let country = request.headers.get("x-vercel-ip-country") || request.headers.get("x-country");
  let city = request.headers.get("x-vercel-ip-city");
  const netlifyGeo = request.headers.get("x-nf-geo");
  if (netlifyGeo && (!country || !city)) {
    try {
      const geo = JSON.parse(Buffer.from(netlifyGeo, "base64").toString("utf8"));
      country ||= geo?.country?.code || null;
      city ||= geo?.city || null;
    } catch {
      // Ignore a malformed header; the event is still worth keeping.
    }
  }
  if (city) {
    try {
      city = decodeURIComponent(city);
    } catch {
      // Keep the raw value.
    }
  }
  return { country: country || null, city: city || null };
}

export async function POST(request: NextRequest) {
  if (request.headers.get("dnt") === "1") {
    return new NextResponse(null, { status: 204 });
  }

  const userAgent = request.headers.get("user-agent") || "";
  if (BOT_PATTERN.test(userAgent)) {
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
  const location = visitorLocation(request);
  const supabase = createPublicClient();
  const { error } = await supabase.rpc("track_analytics_event", {
    p_event_name: eventName,
    p_visitor_id: visitorId,
    p_session_id: sessionId,
    p_path: path,
    p_referrer: String(body.referrer || "").slice(0, 1000) || null,
    p_country: location.country,
    p_city: location.city,
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
