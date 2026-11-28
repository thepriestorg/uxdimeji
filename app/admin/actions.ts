"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Rebuilds the cached public pages after an admin change, so edits show up at once
 * instead of waiting for the page cache to expire. Only signed-in admins can trigger it.
 */
// Playground images are read on the server too, so gallery edits refresh that page.
export async function refreshPlayground() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  revalidatePath("/playground");
}

export async function refreshProjects(slug?: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// Blog pages are static, so saving or deleting a post rebuilds the list and the article.
export async function refreshBlog(...slugs: (string | null | undefined)[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/blog/${slug}`);
}
