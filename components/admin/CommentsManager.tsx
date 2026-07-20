"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Comment = { id: string; post_slug: string; name: string; body: string; approved: boolean; created_at: string };

export default function CommentsManager({ initialComments }: { initialComments: Comment[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState(initialComments);
  const [working, setWorking] = useState<string | null>(null);

  async function approve(id: string) {
    setWorking(id);
    const { error } = await supabase.from("blog_comments").update({ approved: true }).eq("id", id);
    if (!error) setComments((items) => items.map((item) => item.id === id ? { ...item, approved: true } : item));
    setWorking(null);
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this comment?")) return;
    setWorking(id);
    const { error } = await supabase.from("blog_comments").delete().eq("id", id);
    if (!error) setComments((items) => items.filter((item) => item.id !== id));
    setWorking(null);
  }

  if (!comments.length) return <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center text-white/40">No comments yet.</div>;

  return <div className="space-y-3">{comments.map((comment) => <article key={comment.id} className="p-5 rounded-2xl border border-white/10 bg-white/5">
    <div className="flex items-start justify-between gap-5"><div><div className="flex items-center gap-3"><b className="text-white">{comment.name}</b><span className={`px-2 py-1 rounded-full text-[10px] uppercase ${comment.approved ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300"}`}>{comment.approved ? "Live" : "Pending"}</span></div><p className="mt-1 text-xs text-white/35">/{comment.post_slug} · {new Date(comment.created_at).toLocaleDateString()}</p></div><div className="flex gap-1">{!comment.approved && <button onClick={() => approve(comment.id)} disabled={working === comment.id} title="Approve" className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10">{working === comment.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}</button>}<button onClick={() => remove(comment.id)} disabled={working === comment.id} title="Delete" className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></button></div></div>
    <p className="mt-5 text-white/70 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
  </article>)}</div>;
}
