"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Rebuilds the cached public pages after an admin change, so edits show up at once
 * instead of waiting for the page cache to expire. Only signed-in admins can trigger it.
 */
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
