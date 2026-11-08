"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "@/components/admin/RichTextEditor";
import SummaryEditor from "@/components/admin/SummaryEditor";
import MediaUploader from "@/components/admin/MediaUploader";
import { refreshProjects } from "@/app/admin/actions";
import {
  PROJECT_KINDS,
  legacyFeatured,
  slugify,
  type MadeFor,
  type Project,
  type ProjectKind,
  type ProjectMetric,
  type ProjectFormValues,
} from "@/lib/projects";


const input =
    // 16px text on phones stops iOS zooming into the field.
  "w-full min-w-0 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent";
const labelClass = "block text-xs sm:text-sm font-mono text-white/50 mb-2 uppercase tracking-widest";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
      {hint && <p className="mt-2 text-xs text-white/35">{hint}</p>}
    </div>
  );
}

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
            value === option.value
              ? "bg-accent text-black border-accent"
              : "border-white/10 text-white/60 hover:text-white hover:border-white/30"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer">
      <span className="relative inline-flex items-center mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <span className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
      </span>
      <span>
        <span className="block text-white/90 font-bold">{label}</span>
        {hint && <span className="block text-sm text-white/40">{hint}</span>}
      </span>
    </label>
  );
}

const MADE_FOR_OPTIONS: { value: MadeFor; label: string }[] = [
  { value: "client", label: "Client work" },
  { value: "personal", label: "Personal" },
];

export default function ProjectForm({ initial }: { initial: ProjectFormValues }) {
  const router = useRouter();
  const supabase = createClient();
  const isNew = !initial.id;
  const [form, setForm] = useState<ProjectFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setTitle = (title: string) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, title, slug: slugTouched ? prev.slug : slugify(title) }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) set("tags", [...form.tags, tag]);
    setTagInput("");
  };

  const setMetric = (index: number, patch: Partial<ProjectMetric>) =>
    set("metrics", form.metrics.map((metric, i) => (i === index ? { ...metric, ...patch } : metric)));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.has_case_study && !form.live_url?.trim()) {
      setError("Add a live link, or switch on the case study, so the card has somewhere to go.");
      return;
    }

    setSaving(true);
    const { id, ...values } = form;
    const blankToNull = (value: string | null) => (value?.trim() ? value.trim() : null);
    const payload = {
      ...values,
      slug: slugify(values.slug || values.title),
      category: blankToNull(values.category),
      year: blankToNull(values.year),
      featured_image: blankToNull(values.featured_image),
      client_name: values.made_for === "client" ? blankToNull(values.client_name) : null,
      live_url: blankToNull(values.live_url),
      figma_url: blankToNull(values.figma_url),
      summary: blankToNull(values.summary),
      role: blankToNull(values.role),
      status: blankToNull(values.status),
      accent: blankToNull(values.accent),
      content: values.content ?? "",
      metrics: values.metrics.filter((metric) => metric.value.trim() || metric.label.trim()),
      is_featured: legacyFeatured(values),
    };

    const { error: saveError } = id
      ? await supabase.from("projects").update(payload).eq("id", id)
      : await supabase.from("projects").insert([payload]);

    if (saveError) {
      setSaving(false);
      setError(saveError.message);
      return;
    }

    // Push the change to the live site now rather than waiting for the cache to expire.
    await refreshProjects(payload.slug);
    if (initial.slug && initial.slug !== payload.slug) await refreshProjects(initial.slug);
    setSaving(false);

    if (isNew || payload.slug !== initial.slug) {
      router.push(isNew ? "/admin/projects" : `/admin/projects/${payload.slug}`);
    } else {
      setSaved(true);
    }
    router.refresh();
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setDeleting(true);
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", form.id);
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }
    await refreshProjects(form.slug);
    router.push("/admin/projects");
    router.refresh();
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link href="/admin/projects" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white break-words">{isNew ? "New project" : form.title || "Edit project"}</h1>
        </div>
        {!isNew && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="shrink-0 mt-10 sm:mt-0 flex items-center gap-2 p-3 sm:px-4 sm:py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            aria-label="Delete project"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. What it is */}
        <section className="space-y-6">
          <Field label="What is it?">
            <Choice<ProjectKind> options={PROJECT_KINDS} value={form.kind} onChange={(kind) => set("kind", kind)} />
          </Field>

          <Field label="Who was it for?">
            <Choice<MadeFor>
              options={MADE_FOR_OPTIONS}
              value={form.made_for ?? "client"}
              onChange={(madeFor) => set("made_for", madeFor)}
            />
          </Field>

          {form.made_for === "client" && (
            <Field label="Client name" hint="Optional. Leave blank to just show “Client”.">
              <input className={input} value={form.client_name ?? ""} onChange={(e) => set("client_name", e.target.value)} placeholder="Acme Inc." />
            </Field>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <Toggle
              checked={form.has_case_study}
              onChange={(value) => set("has_case_study", value)}
              label="Has a case study"
              hint={form.has_case_study ? "The card opens a full case study page." : "The card links straight to the live project."}
            />
          </div>
        </section>

        {/* 2. The basics */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Title">
              <input className={input} value={form.title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" required />
            </Field>
            <Field label="Year">
              <input className={input} value={form.year ?? ""} onChange={(e) => set("year", e.target.value)} placeholder="2026" />
            </Field>
          </div>

          <Field
            label="Excerpt"
            hint={
              form.has_case_study
                ? "Shown in full on the homepage card. Optional: defaults to the case study’s first paragraph."
                : "Shown in full on the homepage card. Bold, italic, underline and links work."
            }
          >
            <SummaryEditor
              value={form.summary ?? ""}
              onChange={(html) => set("summary", html)}
              placeholder="Shipped a Quran app that grew to 1,000+ organic downloads."
            />
          </Field>

          <Field label="Live link" hint={form.has_case_study ? "Optional." : "Required. This is where the card goes."}>
            <input className={input} type="url" value={form.live_url ?? ""} onChange={(e) => set("live_url", e.target.value)} placeholder="https://" />
          </Field>

          <MediaUploader value={form.featured_image ?? ""} onChange={(url) => set("featured_image", url)} label="Cover (image or video)" acceptVideo />
        </section>

        {/* 3. Case study */}
        {form.has_case_study && (
          <section className="space-y-6">
            <Field label="Case study">
              <RichTextEditor content={form.content ?? ""} onChange={(content) => set("content", content)} placeholder="Write the case study..." />
            </Field>
          </section>
        )}

        {/* 4. Extras */}
        <details className="group bg-white/5 border border-white/10 rounded-2xl" open={!isNew}>
          <summary className="cursor-pointer select-none px-5 py-4 text-white/70 font-bold">More details</summary>
          <div className="px-5 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Industry / category">
                <input className={input} value={form.category ?? ""} onChange={(e) => set("category", e.target.value)} placeholder="Fintech, AI SaaS…" />
              </Field>
              <Field label="Your role">
                <input className={input} value={form.role ?? ""} onChange={(e) => set("role", e.target.value)} placeholder="Lead product designer" />
              </Field>
              <Field label="Slug">
                <input
                  className={input}
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  placeholder="project-slug"
                />
              </Field>
              <Field label="Status" hint="Optional, e.g. Live, In progress, Concept.">
                <input className={input} value={form.status ?? ""} onChange={(e) => set("status", e.target.value)} placeholder="Live" />
              </Field>
              <Field label="Figma link">
                <input className={input} type="url" value={form.figma_url ?? ""} onChange={(e) => set("figma_url", e.target.value)} placeholder="https://figma.com/…" />
              </Field>
              <Field label="Accent colour">
                <input className={input} value={form.accent ?? ""} onChange={(e) => set("accent", e.target.value)} placeholder="#8B5CF6" />
              </Field>
            </div>

            <Field label="Key numbers" hint="Shown in bold on the card, e.g. “1,000+” / “downloads”.">
              <div className="space-y-2">
                {form.metrics.map((metric, index) => (
                  <div key={index} className="flex gap-2">
                    <input className={`${input} w-28 shrink-0 sm:w-[180px]`} value={metric.value} onChange={(e) => setMetric(index, { value: e.target.value })} placeholder="1,000+" />
                    <input className={input} value={metric.label} onChange={(e) => setMetric(index, { label: e.target.value })} placeholder="organic downloads" />
                    <button
                      type="button"
                      onClick={() => set("metrics", form.metrics.filter((_, i) => i !== index))}
                      className="shrink-0 px-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10"
                      aria-label="Remove number"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => set("metrics", [...form.metrics, { value: "", label: "" }])}
                  className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
                >
                  <Plus className="w-4 h-4" /> Add a number
                </button>
              </div>
            </Field>

            <Field label="Tags">
              <div className="flex gap-2">
                <input
                  className={input}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Next.js, Supabase…"
                />
                <button type="button" onClick={addTag} className="shrink-0 px-4 rounded-xl border border-white/10 text-white/70 hover:bg-white/5">
                  Add
                </button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm text-white/80">
                      {tag}
                      <button type="button" onClick={() => set("tags", form.tags.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </div>
        </details>

        <Toggle
          checked={form.is_published}
          onChange={(value) => set("is_published", value)}
          label="Show on the site"
          hint="Turn off to keep it as a draft."
        />

        {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">{error}</div>}

        {/* Pinned to the bottom of the screen on phones so Save is always in reach. */}
        <div className="sticky bottom-0 z-30 -mx-4 px-4 py-3 bg-zinc-950/95 backdrop-blur border-t border-white/10 flex items-center justify-end gap-3 sm:static sm:mx-0 sm:p-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0 sm:gap-4">
          {saved && <span className="text-sm text-accent">Saved</span>}
          <Link href="/admin/projects" className="hidden sm:inline-flex px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isNew ? "Create project" : "Save changes"}
          </button>
        </div>
      </form>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-2">Delete project?</h3>
            <p className="text-white/50 mb-6">“{form.title}” will be permanently removed. This can’t be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
