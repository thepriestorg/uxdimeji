"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { formatViews } from "@/lib/blog-utils";

type BlogPostViewsProps = {
  slug: string;
  initialViews?: number;
};

export default function BlogPostViews({
  slug,
  initialViews = 0,
}: BlogPostViewsProps) {
  const [views, setViews] = useState<number>(initialViews);

  useEffect(() => {
    if (!slug) return;

    const storageKey = `viewed_blog_${slug}`;
    const alreadyViewed = sessionStorage.getItem(storageKey);

    if (!alreadyViewed) {
      sessionStorage.setItem(storageKey, "1");
      // Optimistic increment
      setViews((prev) => (prev ?? 0) + 1);

      fetch("/api/blog/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
        keepalive: true,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.views === "number") {
            setViews(data.views);
          }
        })
        .catch(() => {
          // Keep optimistic value on network error
        });
    }
  }, [slug]);

  return (
    <span className="inline-flex items-center gap-1 text-[inherit]" title="Total views">
      <Eye size={12} className="opacity-60 shrink-0" aria-hidden="true" />
      <span>{formatViews(views)}</span>
    </span>
  );
}
