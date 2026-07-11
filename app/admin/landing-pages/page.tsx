"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";
import { createClient } from "@/lib/supabase/client";

interface LandingPage {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string;
  live_url: string | null;
  figma_url: string | null;
  is_visible: boolean;
  display_order: number;
}

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");

const emptyForm = {
  title: "", category: "", description: "", image_url: "", live_url: "", figma_url: "", is_visible: true,
};

export default function LandingPagesAdmin() {
  const supabase = useMemo(() => createClient(), []);
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPages = useCallback(async () => {
    const { data, error } = await supabase.from("landing_pages").select("*").order("display_order");
    if (error) console.error(error);
    setPages(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void fetchPages(); }, [fetchPages]);

  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const edit = (page: LandingPage) => {
    setEditingId(page.id);
    setForm({
      title: page.title, category: page.category || "", description: page.description || "",
      image_url: page.image_url, live_url: page.live_url || "", figma_url: page.figma_url || "",
      is_visible: page.is_visible,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.image_url) return alert("Add a title and cover image.");
    setSaving(true);
    const payload = {
      title: form.title.trim(), category: form.category.trim() || null,
      description: form.description.trim() || null, image_url: form.image_url,
      live_url: form.live_url.trim() || null, figma_url: form.figma_url.trim() || null,
      is_visible: form.is_visible, updated_at: new Date().toISOString(),
    };
    const result = editingId
      ? await supabase.from("landing_pages").update(payload).eq("id", editingId)
      : await supabase.from("landing_pages").insert({ ...payload, display_order: pages.length });
    setSaving(false);
    if (result.error) return alert(result.error.message);
    reset();
    void fetchPages();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this landing page from the gallery?")) return;
    const { error } = await supabase.from("landing_pages").delete().eq("id", id);
    if (error) return alert(error.message);
    setPages((items) => items.filter((item) => item.id !== id));
  };

  const toggleVisibility = async (page: LandingPage) => {
    const next = !page.is_visible;
    const { error } = await supabase.from("landing_pages").update({ is_visible: next }).eq("id", page.id);
    if (!error) setPages((items) => items.map((item) => item.id === page.id ? { ...item, is_visible: next } : item));
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const reordered = [...pages];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setPages(reordered);
    await Promise.all(reordered.map((page, order) => supabase.from("landing_pages").update({ display_order: order }).eq("id", page.id)));
  };

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight">Landing Page Gallery</h1>
        <p className="text-white/50 mt-2">Add, edit, hide, remove, and reorder landing-page work shown on your portfolio.</p>
      </div>

      <form onSubmit={save} className="bg-white/5 border border-white/10 rounded-3xl p-5 md:p-7 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-lg">{editingId ? "Edit landing page" : "Add landing page"}</h2>
          {editingId && <button type="button" onClick={reset} className="text-white/50 hover:text-white"><X /></button>}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="grid gap-4">
            <MediaUploader acceptVideo value={form.image_url} onChange={(image_url) => setForm({ ...form, image_url })} label="Featured image or video" />
            <input className="admin-field" type="url" placeholder="Or paste a direct video / media URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            <p className="text-xs text-white/35">For the best result, upload a short MP4/WebM screen recording. It will autoplay muted and loop.</p>
          </div>
          <div className="grid gap-4">
            <input className="admin-field" placeholder="Project title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="admin-field" placeholder="Category / industry" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <textarea className="admin-field min-h-24 resize-y" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid md:grid-cols-2 gap-4">
              <input className="admin-field" type="url" placeholder="Live URL" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
              <input className="admin-field" type="url" placeholder="Figma URL" value={form.figma_url} onChange={(e) => setForm({ ...form, figma_url: e.target.value })} />
            </div>
            <label className="flex items-center gap-3 text-white/70 text-sm"><input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} /> Visible on portfolio</label>
            <button disabled={saving} className="bg-accent text-black rounded-xl px-5 py-3 font-bold flex justify-center items-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? <Pencil size={18} /> : <Plus size={18} />}
              {editingId ? "Save changes" : "Add to gallery"}
            </button>
          </div>
        </div>
      </form>

      {loading ? <Loader2 className="animate-spin text-accent mx-auto" /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pages.map((page, index) => (
            <article key={page.id} className={`bg-white/5 border rounded-2xl overflow-hidden ${page.is_visible ? "border-white/10" : "border-white/5 opacity-60"}`}>
              <div className="relative aspect-[16/10] bg-black">
                {isVideoUrl(page.image_url) ? <video src={page.image_url} muted autoPlay loop playsInline className="absolute inset-0 w-full h-full object-cover object-top" /> : <Image src={page.image_url} alt={page.title} fill className="object-cover object-top" />}
              </div>
              <div className="p-4">
                <p className="text-accent text-[10px] uppercase tracking-widest">{page.category || "Landing page"}</p>
                <h3 className="text-white font-bold text-lg mt-1 truncate">{page.title}</h3>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="admin-icon" aria-label="Move up"><ChevronUp size={16} /></button>
                  <button onClick={() => move(index, 1)} disabled={index === pages.length - 1} className="admin-icon" aria-label="Move down"><ChevronDown size={16} /></button>
                  <button onClick={() => toggleVisibility(page)} className="admin-icon" title="Toggle visibility">{page.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                  <button onClick={() => edit(page)} className="admin-icon ml-auto"><Pencil size={16} /></button>
                  <button onClick={() => remove(page.id)} className="admin-icon text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
          {!pages.length && <p className="text-white/40 col-span-full text-center py-16">No landing pages yet. Add your first one above.</p>}
        </div>
      )}
      <style jsx global>{`.admin-field{width:100%;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05);border-radius:.75rem;padding:.75rem 1rem;color:white;outline:none}.admin-field:focus{border-color:var(--accent)}.admin-icon{height:2.25rem;min-width:2.25rem;padding:0 .6rem;border-radius:.6rem;background:rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.7)}.admin-icon:hover{background:rgba(255,255,255,.13);color:white}.admin-icon:disabled{opacity:.25}`}</style>
    </div>
  );
}
