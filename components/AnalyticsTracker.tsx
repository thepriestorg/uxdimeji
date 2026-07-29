"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

type AnalyticsEvent = {
  eventName: "page_view" | "engagement" | "outbound_click" | "file_download";
  path: string;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  engagementSeconds?: number;
  metadata?: Record<string, string>;
};

const uuid = () => crypto.randomUUID();

function storedId(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const next = uuid();
  storage.setItem(key, next);
  return next;
}

function send(event: AnalyticsEvent) {
  const body = JSON.stringify(event);
  if (event.eventName === "engagement" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  });
}

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ids = useRef<{ visitorId: string; sessionId: string } | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    try {
      ids.current = {
        visitorId: storedId(localStorage, "oa_visitor_id"),
        sessionId: storedId(sessionStorage, "oa_session_id"),
      };
    } catch {
      ids.current = { visitorId: uuid(), sessionId: uuid() };
    }

    const campaign = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign"].flatMap((key) => {
        const value = searchParams.get(key);
        return value ? [[key, value.slice(0, 120)]] : [];
      }),
    );
    const path = pathname;
    let lastRecordedAt = Date.now();

    send({
      eventName: "page_view",
      path,
      ...ids.current,
      referrer: document.referrer || undefined,
      metadata: campaign,
    });

    const recordEngagement = () => {
      if (!ids.current) return;
      const now = Date.now();
      const seconds = Math.round((now - lastRecordedAt) / 1000);
      if (seconds < 1) return;
      lastRecordedAt = now;
      send({
        eventName: "engagement",
        path,
        ...ids.current,
        engagementSeconds: Math.min(seconds, 1800),
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") recordEngagement();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      recordEngagement();
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ids.current) return;
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor?.href) return;

      const url = new URL(anchor.href, window.location.href);
      const isDownload =
        anchor.hasAttribute("download") ||
        /\.(pdf|docx?|zip|png|jpe?g)$/i.test(url.pathname);
      const isOutbound = url.origin !== window.location.origin;
      if (!isDownload && !isOutbound) return;

      send({
        eventName: isDownload ? "file_download" : "outbound_click",
        path: `${window.location.pathname}${window.location.search}`,
        ...ids.current,
        metadata: {
          url: url.href.slice(0, 500),
          label: (anchor.textContent || anchor.getAttribute("aria-label") || "Link")
            .trim()
            .slice(0, 120),
        },
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

export default function AnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
