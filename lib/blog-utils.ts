import { richTextToPlainText } from "@/lib/rich-text";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  views?: number;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export function formatPostDate(date: string | null) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function readingTime(html: string) {
  const words = richTextToPlainText(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}

export function formatViews(views?: number | null) {
  const count = views ?? 0;
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M views`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k views`;
  }
  return `${count} ${count === 1 ? "view" : "views"}`;
}
