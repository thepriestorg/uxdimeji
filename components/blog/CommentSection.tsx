"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Comment = { id: string; name: string; body: string; created_at: string };

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.from("blog_comments").select("id,name,body,created_at").eq("post_slug", postSlug).eq("approved", true).order("created_at", { ascending: true })
      .then(({ data }) => setComments((data ?? []) as Comment[]));
  }, [postSlug, supabase]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSending(true);
    setMessage("");
    const { data, error } = await supabase
      .from("blog_comments")
      .insert({ post_slug: postSlug, name: name.trim(), body: body.trim(), approved: true })
      .select("id,name,body,created_at")
      .single();
    setSending(false);
    if (error) { setMessage("Couldn’t send that comment. Please try again."); return; }
    if (data) setComments((items) => [...items, data as Comment]);
    setName("");
    setBody("");
    setMessage("Your comment is live.");
  }

  return (
    <section className="comments" id="comments">
      <div className="comments-heading"><div><p className="eyebrow">Conversation</p><h2>Leave a thought.</h2></div><span><MessageCircle aria-hidden="true" />{comments.length}</span></div>
      {comments.length > 0 && <div className="comment-list">{comments.map((comment) => <article className="comment" key={comment.id}><div><strong>{comment.name.slice(0,1).toUpperCase()}</strong></div><div><header><b>{comment.name}</b><time>{new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(comment.created_at))}</time></header><p>{comment.body}</p></div></article>)}</div>}
      <form className="comment-form" onSubmit={submit}>
        <label><span>Your name</span><input required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} placeholder="How should I address you?" /></label>
        <label><span>Your comment</span><textarea required maxLength={1500} rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add to the conversation…" /></label>
        <div className="comment-form-foot"><p aria-live="polite">{message || "Be thoughtful. Your comment will appear immediately."}</p><button disabled={sending} type="submit">{sending ? <Loader2 className="spin" /> : <Send />} {sending ? "Sending…" : "Post comment"}</button></div>
      </form>
    </section>
  );
}
