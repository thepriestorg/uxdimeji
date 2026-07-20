"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import MediaUploader from "@/components/admin/MediaUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";

type FormData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string;
  content: string;
  published: boolean;
  published_at: string | null;
};

const emptyPost: FormData = {
  title: "", slug: "", excerpt: "", category: "Design",
  cover_image: "", content: "", published: false, published_at: null,
};

export default function BlogEditor({ slug }: { slug?: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [form, setForm] = useState<FormData>(emptyPost);
  const [loading, setLoading] = useState(Boolean(slug));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    supabase.from("blog_posts").select("*").eq("slug", slug).single().then(({ data, error }) => {
      if (error || !data) setError("Post not found.");
      else setForm({
        id: data.id, title: data.title ?? "", slug: data.slug ?? "", excerpt: data.excerpt ?? "",
        category: data.category ?? "Design", cover_image: data.cover_image ?? "", content: data.content ?? "",
        published: data.published ?? false, published_at: data.published_at ?? null,
      });
      setLoading(false);
    });
  }, [slug, supabase]);

  const makeSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      title: form.title, slug: form.slug, excerpt: form.excerpt, category: form.category,
      cover_image: form.cover_image || null, content: form.content, published: form.published,
      published_at: form.published ? (form.published_at || new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    };
    const result = form.id
      ? await supabase.from("blog_posts").update(payload).eq("id", form.id)
      : await supabase.from("blog_posts").insert(payload);
    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    router.push(`/admin/blog/${form.slug}`);
    router.refresh();
    setSaving(false);
  }

  async function remove() {
    if (!form.id || !window.confirm("Delete this post permanently?")) return;
    setDeleting(true);
    const { error } = await supabase.from("blog_posts").delete().eq("id", form.id);
    if (error) { setError(error.message); setDeleting(false); return; }
    router.push("/admin/blog");
    router.refresh();
  }

  if (loading) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="w-8 h-8 text-accent animate-spin" /></div>;

  return (
    <div className="p-5 md:p-8 max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/blog" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />Back to writing</Link>
          <h1 className="text-3xl font-bold text-white">{form.id ? "Edit post" : "New post"}</h1>
          <p className="text-white/40 mt-2">{form.published ? "Published on the live site" : "Private draft"}</p>
        </div>
        {form.id && <button type="button" onClick={remove} disabled={deleting} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"><Trash2 className="w-4 h-4" />{deleting ? "Deleting…" : "Delete"}</button>}
      </div>

      <form onSubmit={save} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Title"><input required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value, ...(!p.id ? { slug: makeSlug(e.target.value) } : {}) }))} className="admin-input" placeholder="A thought worth sharing" /></Field>
          <Field label="URL slug — editable"><input required value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: makeSlug(e.target.value) }))} className="admin-input" placeholder="a-thought-worth-sharing" /><span className="block mt-2 text-xs text-white/30">You can change this before or after publishing.</span></Field>
        </div>
        <Field label="Excerpt"><textarea required rows={3} maxLength={280} value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} className="admin-input resize-none" placeholder="A short invitation into the article…" /><span className="block mt-2 text-right text-xs text-white/30">{form.excerpt.length}/280</span></Field>
        <Field label="Category"><input required value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="admin-input" placeholder="Design craft" /></Field>
        <MediaUploader value={form.cover_image} onChange={(cover_image) => setForm((p) => ({ ...p, cover_image }))} />
        <Field label="Article"><RichTextEditor content={form.content} onChange={(content) => setForm((p) => ({ ...p, content }))} placeholder="Start with the thought you can't shake…" /></Field>
        <div className="flex items-center justify-between gap-6 p-5 rounded-2xl border border-white/10 bg-white/5">
          <div><p className="font-bold text-white">Publish this post</p><p className="text-sm text-white/40 mt-1">Turn this off to keep it as a private draft.</p></div>
          <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} className="sr-only peer" /><span className="w-12 h-7 bg-white/10 rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" /></label>
        </div>
        {error && <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">{error}</div>}
        <div className="flex justify-end gap-3"><Link href="/admin/blog" className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold">Cancel</Link><button disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold disabled:opacity-50">{saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}{saving ? "Saving…" : form.published ? "Save & publish" : "Save draft"}</button></div>
      </form>
      <style jsx global>{`.admin-input{width:100%;border:1px solid rgba(255,255,255,.1);border-radius:.75rem;background:rgba(255,255,255,.05);padding:.8rem 1rem;color:white;outline:none}.admin-input:focus{border-color:var(--color-accent)}.admin-input::placeholder{color:rgba(255,255,255,.25)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block mb-2 text-sm font-mono uppercase tracking-widest text-white/50">{label}</label>{children}</div>;
}
