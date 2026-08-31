"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

export type AnalyticsEvent = {
  eventName: "page_view" | "engagement" | "outbound_click" | "file_download";
  path: string;
  visitorId: string;
  sessionId: string;
  referrer?: string;
  engagementSeconds?: number;
  metadata?: Record<string, string>;
};

const uuid = () => {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof globalThis.crypto?.getRandomValues === "function") {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

function storedId(storage: Storage, key: string) {
  const current = storage.getItem(key);
  if (current) return current;
  const next = uuid();
  storage.setItem(key, next);
  return next;
}

function getVisitorIds(): { visitorId: string; sessionId: string } {
  try {
    return {
      visitorId: storedId(localStorage, "oa_visitor_id"),
      sessionId: storedId(sessionStorage, "oa_session_id"),
    };
  } catch {
    return { visitorId: uuid(), sessionId: uuid() };
  }
}

export function trackCustomEvent(
  eventName: "page_view" | "engagement" | "outbound_click" | "file_download",
  metadata: Record<string, string> = {},
  engagementSeconds?: number
) {
  if (typeof window === "undefined") return;
  const ids = getVisitorIds();
  const path = `${window.location.pathname}${window.location.search}`;

  const body = JSON.stringify({
    eventName,
    path,
    ...ids,
    referrer: document.referrer || undefined,
    engagementSeconds,
    metadata,
  });

  if (eventName === "engagement" && navigator.sendBeacon) {
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

    ids.current = getVisitorIds();

    const campaign = Object.fromEntries(
      ["utm_source", "utm_medium", "utm_campaign", "ref"].flatMap((key) => {
        const value = searchParams.get(key);
        return value ? [[key, value.slice(0, 120)]] : [];
      })
    );
    const path = pathname;
    let lastRecordedAt = Date.now();
    let recordedMilestones = new Set<number>();

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

    // Heartbeat: periodically record engagement every 20 seconds while user is actively reading
    const heartbeatTimer = setInterval(() => {
      if (document.visibilityState === "visible") {
        recordEngagement();
      }
    }, 20000);

    // Scroll depth milestone tracker (25%, 50%, 75%, 100%)
    const onScroll = () => {
      if (!ids.current) return;
      const h = document.documentElement;
      const b = document.body;
      const st = "scrollTop";
      const sh = "scrollHeight";
      const scrollPercent = Math.round(
        ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100
      );

      const milestones = [25, 50, 75, 100];
      for (const m of milestones) {
        if (scrollPercent >= m && !recordedMilestones.has(m)) {
          recordedMilestones.add(m);
          send({
            eventName: "engagement",
            path,
            ...ids.current,
            metadata: {
              label: `Scroll depth: ${m}%`,
              scroll_depth: `${m}%`,
            },
          });
        }
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") recordEngagement();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(heartbeatTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("scroll", onScroll);
      recordEngagement();
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!ids.current) return;
      const anchor = (event.target as HTMLElement).closest("a");
      const elementWithLabel = (event.target as HTMLElement).closest("[data-analytics-label]");

      // If an explicit analytics label is attached to the element
      if (elementWithLabel) {
        const customLabel = elementWithLabel.getAttribute("data-analytics-label");
        const customType =
          (elementWithLabel.getAttribute("data-analytics-event") as
            | "outbound_click"
            | "file_download") || "outbound_click";

        if (customLabel) {
          send({
            eventName: customType,
            path: `${window.location.pathname}${window.location.search}`,
            ...ids.current,
            metadata: {
              label: customLabel.slice(0, 120),
              url: (anchor?.href || "").slice(0, 500),
            },
          });
          return;
        }
      }

      if (!anchor?.href) return;

      // Clean, smart URL parsing
      try {
        const url = new URL(anchor.href, window.location.href);

        // Handle mailto links as high-intent contact clicks
        if (url.protocol === "mailto:") {
          send({
            eventName: "outbound_click",
            path: `${window.location.pathname}${window.location.search}`,
            ...ids.current,
            metadata: {
              label: `Contact Email: ${url.pathname.slice(0, 80)}`,
              url: url.href.slice(0, 500),
            },
          });
          return;
        }

        const isDownload =
          anchor.hasAttribute("download") ||
          /\.(pdf|docx?|zip|png|jpe?g)$/i.test(url.pathname) ||
          url.hostname.includes("drive.google.com") ||
          url.hostname.includes("dropbox.com");

        const isOutbound = url.origin !== window.location.origin;
        if (!isDownload && !isOutbound) return;

        // Categorize social and platform links cleanly
        let categoryLabel = (anchor.textContent || anchor.getAttribute("aria-label") || "Link")
          .trim()
          .slice(0, 120);

        if (url.hostname.includes("linkedin.com")) {
          categoryLabel = "LinkedIn Profile";
        } else if (url.hostname.includes("x.com") || url.hostname.includes("twitter.com")) {
          categoryLabel = "X / Twitter";
        } else if (url.hostname.includes("github.com")) {
          categoryLabel = "GitHub Profile";
        } else if (url.hostname.includes("instagram.com")) {
          categoryLabel = "Instagram Profile";
        } else if (url.hostname.includes("tiktok.com")) {
          categoryLabel = "TikTok Profile";
        } else if (url.hostname.includes("drive.google.com") || isDownload) {
          categoryLabel = "Read CV / Resume";
        }

        send({
          eventName: isDownload ? "file_download" : "outbound_click",
          path: `${window.location.pathname}${window.location.search}`,
          ...ids.current,
          metadata: {
            url: url.href.slice(0, 500),
            label: categoryLabel,
          },
        });
      } catch {
        // Ignore malformed URLs
      }
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
