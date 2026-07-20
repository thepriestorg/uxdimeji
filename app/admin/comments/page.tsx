import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommentsManager from "@/components/admin/CommentsManager";

export default async function AdminCommentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data, error } = await supabase.from("blog_comments").select("*").order("created_at", { ascending: false });
  return <div className="p-5 md:p-8 max-w-5xl"><div className="mb-8"><h1 className="text-3xl font-bold text-white">Comments</h1><p className="mt-2 text-white/45">Review the conversation before it appears publicly.</p></div>{error ? <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">Run the blog comments migration, then refresh this page.</div> : <CommentsManager initialComments={data ?? []} />}</div>;
}
