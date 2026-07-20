import { createClient } from "@/lib/supabase/server";
import { richTextToPlainText } from "@/lib/rich-text";

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  category: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getPublishedPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false });

  return (data ?? []) as BlogPost[];
}

export async function getPublishedPost(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data as BlogPost | null;
}

export function formatPostDate(date: string | null) {
  if (!date) return "Draft";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function readingTime(html: string) {
  const words = richTextToPlainText(html).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 220))} min read`;
}
