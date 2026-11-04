import { createPublicClient } from "@/lib/supabase/public";
import { BlogPost } from "./blog-utils";

export * from "./blog-utils";

export async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });

    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    return (data as BlogPost) ?? null;
  } catch {
    return null;
  }
}
