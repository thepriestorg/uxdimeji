"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Loader2, MessageSquare, Send, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: string;
  name: string;
  body: string;
  created_at: string;
};

export default function CommentSection({ postSlug }: { postSlug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase
      .from("blog_comments")
      .select("id,name,body,created_at")
      .eq("post_slug", postSlug)
      .eq("approved", true)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setComments(data as Comment[]);
        }
      })
      .catch(() => {
        setComments([]);
      });
  }, [postSlug, supabase]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setSending(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("blog_comments")
        .insert({
          post_slug: postSlug,
          name: name.trim(),
          body: body.trim(),
          approved: true,
        })
        .select("id,name,body,created_at")
        .single();

      setSending(false);

      if (error) {
        setMessage("Couldn’t post your comment. Please try again.");
        return;
      }

      if (data) {
        setComments((items) => [data as Comment, ...items]);
        setName("");
        setBody("");
        setMessage("Your thought has been posted.");
      }
    } catch {
      setMessage("Couldn’t post your comment. Please try again.");
      setSending(false);
    }
  }

  return (
    <section className="comments-section" id="comments">
      {/* ── Section Header ── */}
      <div className="comments-header">
        <div>
          <span className="comments-eyebrow">Conversation</span>
          <h2 className="comments-title">Thoughts & Replies</h2>
        </div>
        <span className="comments-count-pill">
          <MessageSquare size={13} aria-hidden="true" />
          <span>
            {comments.length} {comments.length === 1 ? "thought" : "thoughts"}
          </span>
        </span>
      </div>

      {/* ── 1. Comment Submission Form (Unboxed, clean) ── */}
      <form className="comment-composer-card" onSubmit={submit}>
        <div className="comment-composer-header">
          <h3>Leave a thought</h3>
          <p>No account required. Share your feedback, questions, or ideas.</p>
        </div>

        <div className="comment-composer-inputs">
          <div className="comment-input-field">
            <label htmlFor="comment-name">Your Name</label>
            <input
              id="comment-name"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Doe or @username"
            />
          </div>

          <div className="comment-input-field">
            <label htmlFor="comment-body">Your Thought</label>
            <textarea
              id="comment-body"
              required
              maxLength={1500}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What did you think of this article? Add your perspective..."
            />
          </div>
        </div>

        <div className="comment-composer-foot">
          <p className="comment-status-note" aria-live="polite">
            {message ? (
              <span className="comment-success-msg">
                <Check size={13} /> {message}
              </span>
            ) : (
              "Be thoughtful. Comments are published immediately."
            )}
          </p>
          <button
            disabled={sending}
            type="submit"
            className="comment-submit-btn"
          >
            {sending ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <Send size={13} />
            )}
            <span>{sending ? "Posting…" : "Post thought"}</span>
          </button>
        </div>
      </form>

      {/* ── 2. Posted Comments Stream (Unboxed, No PFP, clean typographic flow) ── */}
      {comments.length > 0 ? (
        <div className="comments-stream">
          <div className="comments-stream-header">
            <span>Thoughts ({comments.length})</span>
          </div>

          {comments.map((comment) => (
            <article className="comment-item-unboxed" key={comment.id}>
              <div className="comment-item-meta">
                <span className="comment-author-name">{comment.name}</span>
                <span className="comment-meta-dot">·</span>
                <time className="comment-time">
                  {new Intl.DateTimeFormat("en", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(comment.created_at))}
                </time>
              </div>
              <p className="comment-item-body">{comment.body}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="comments-empty">
          <p>No thoughts posted yet. Be the first to start the conversation.</p>
        </div>
      )}
    </section>
  );
}
