"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaUploader from "@/components/admin/MediaUploader";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        title: "",
        slug: "",
        category: "",
        year: "",
        featured_image: "",
        color: "bg-indigo-950",
        content: "",
        is_featured: true,
        order: 0,
    });

    useEffect(() => {
        const fetchProject = async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error || !data) {
                setError("Project not found");
            } else {
                setFormData({
                    id: data.id,
                    title: data.title || "",
                    slug: data.slug || "",
                    category: data.category || "",
                    year: data.year || "",
                    featured_image: data.featured_image || "",
                    color: data.color || "bg-indigo-950",
                    content: data.content || "",
                    is_featured: data.is_featured ?? true,
                    order: data.order || 0,
                });
            }
            setLoading(false);
        };

        fetchProject();
    }, [slug, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { id, ...updateData } = formData;

        const { error } = await supabase
            .from("projects")
            .update(updateData)
            .eq("id", id);

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            setSaving(false);
            router.refresh();
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        const { error } = await supabase
            .from("projects")
            .delete()
            .eq("id", formData.id);

        if (error) {
            setError(error.message);
            setDeleting(false);
        } else {
            router.push("/admin/projects");
            router.refresh();
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8 flex items-start justify-between">
                <div>
                    <Link
                        href="/admin/projects"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Edit Project</h1>
                </div>
                <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="Project Title"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Slug
                        </label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="project-slug"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Category
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="AI SaaS, Fintech, etc."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Year
                        </label>
                        <input
                            type="text"
                            value={formData.year}
                            onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="2025"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Order
                        </label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Featured Image */}
                <MediaUploader
                    value={formData.featured_image}
                    onChange={(url) => setFormData((prev) => ({ ...prev, featured_image: url }))}
                />

                {/* Featured Toggle */}
                <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                    <span className="text-white/80">Show in homepage accordion</span>
                </div>

                {/* Content Editor */}
                <div>
                    <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                        Content
                    </label>
                    <RichTextEditor
                        content={formData.content}
                        onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
                        placeholder="Write your project case study..."
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-4">
                    <Link
                        href="/admin/projects"
                        className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Project?</h3>
                        <p className="text-white/50 mb-6">
                            This action cannot be undone. The project &quot;{formData.title}&quot; will be permanently removed.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold"
                            >
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
