import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const SLUG_PATTERN = /^[a-z0-9-]+$/i;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!slug || !SLUG_PATTERN.test(slug) || slug.length > 200) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("increment_blog_post_views", {
      p_slug: slug,
    });

    if (error) {
      // Fallback: If RPC not yet applied, attempt direct update or fetch
      console.warn("increment_blog_post_views RPC error:", error.message);
      const { data: post } = await supabase
        .from("blog_posts")
        .select("views")
        .eq("slug", slug)
        .maybeSingle();

      return NextResponse.json({ views: post?.views ?? 0 });
    }

    return NextResponse.json({ views: Number(data) || 0 });
  } catch (err) {
    console.error("Error updating blog post views:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() || "";

    if (!slug || !SLUG_PATTERN.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("views")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ views: data?.views ?? 0 });
  } catch (err) {
    console.error("Error reading blog post views:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
