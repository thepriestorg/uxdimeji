import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://uxdimeji.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return pages;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: projects } = await supabase
      .from("projects")
      .select("slug")
      .eq("is_featured", true);
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("slug, updated_at")
      .eq("published", true);

    return [
      ...pages,
      ...(projects ?? []).map((project) => ({
        url: `${SITE_URL}/projects/${project.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...(posts ?? []).map((post) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return pages;
  }
}
