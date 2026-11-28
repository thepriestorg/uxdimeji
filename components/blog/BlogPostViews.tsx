"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { formatViews } from "@/lib/blog-utils";
import { callPublicRpc } from "@/lib/supabase/rpc";

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

      // Counted straight in Supabase, so a page view never runs a server function.
      callPublicRpc<number>("increment_blog_post_views", { p_slug: slug })
        .then((data) => {
          if (data !== null && Number.isFinite(Number(data))) {
            setViews(Number(data));
          }
        })
        .catch(() => {
          // Keep optimistic value on network error
        });
    }
  }, [slug]);

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "inherit" }} title="Total views">
      <Eye size={12} style={{ opacity: 0.6, flexShrink: 0 }} aria-hidden="true" />
      <span>{formatViews(views)}</span>
    </span>
  );
}
