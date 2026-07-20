import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Edit, Eye, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: posts, error } = await supabase.from("blog_posts").select("*").order("updated_at", { ascending: false });

  return <div className="p-5 md:p-8">
    <div className="mb-8 flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-white mb-2">Writing</h1><p className="text-white/50">Draft and publish your journal.</p></div><Link href="/admin/blog/new" className="flex items-center gap-2 bg-accent text-black px-5 py-3 rounded-xl font-bold"><Plus className="w-5 h-5" />New post</Link></div>
    {error ? <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">The blog table is not ready yet. Run the latest Supabase migration, then refresh this page.</div> : posts?.length ? <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"><div className="divide-y divide-white/10">{posts.map((post) => <div key={post.id} className="p-5 flex items-center gap-5 hover:bg-white/5"><div className="hidden sm:grid w-12 h-12 rounded-xl bg-white/5 place-items-center"><BookOpen className="w-5 h-5 text-white/30" /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-3"><h2 className="font-bold text-white truncate">{post.title}</h2><span className={`text-[10px] uppercase tracking-wider rounded-full px-2 py-1 ${post.published ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-white/40"}`}>{post.published ? "Live" : "Draft"}</span></div><p className="mt-1 text-sm text-white/40 truncate">{post.excerpt}</p></div><div className="flex gap-1">{post.published && <Link href={`/blog/${post.slug}`} title="View" className="p-2 text-white/50 hover:text-white"><Eye className="w-4 h-4" /></Link>}<Link href={`/admin/blog/${post.slug}`} title="Edit" className="p-2 text-white/50 hover:text-white"><Edit className="w-4 h-4" /></Link></div></div>)}</div></div> : <div className="p-14 text-center rounded-2xl border border-dashed border-white/10 bg-white/[.03]"><BookOpen className="w-12 h-12 mx-auto mb-4 text-white/20" /><h2 className="text-xl font-bold text-white">Your first post starts here</h2><p className="mt-2 mb-6 text-white/40">Capture the idea now. You can keep it private until it’s ready.</p><Link href="/admin/blog/new" className="inline-flex items-center gap-2 bg-accent text-black px-5 py-3 rounded-xl font-bold"><Plus className="w-5 h-5" />Start writing</Link></div>}
  </div>;
}
