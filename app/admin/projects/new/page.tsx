"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MediaUploader from "@/components/admin/MediaUploader";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
    const router = useRouter();
    const supabase = createClient();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        year: new Date().getFullYear().toString(),
        featured_image: "",
        color: "bg-indigo-950",
        content: "",
        is_featured: true,
        order: 0,
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData((prev) => ({
            ...prev,
            title,
            slug: generateSlug(title),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const { error } = await supabase.from("projects").insert([formData]);

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            router.push("/admin/projects");
            router.refresh();
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/admin/projects"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>
                <h1 className="text-3xl font-bold text-white">New Project</h1>
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
                            onChange={handleTitleChange}
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
                        Save Project
                    </button>
                </div>
            </form>
        </div>
    );
}
