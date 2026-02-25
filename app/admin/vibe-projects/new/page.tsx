"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MediaUploader from "@/components/admin/MediaUploader";
import { ArrowLeft, Save, Loader2, Plus, X } from "lucide-react";
import Link from "next/link";

export default function NewVibeProjectPage() {
    const router = useRouter();
    const supabase = createClient();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tagInput, setTagInput] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tags: [] as string[],
        status: "In Progress",
        image: "",
        url: "",
        accent: "#8B5CF6",
        span: "small",
        order: 0,
    });

    const addTag = () => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tagToRemove),
        }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const payload = {
            ...formData,
            url: formData.url || null,
        };

        const { error } = await supabase.from("vibe_projects").insert([payload]);

        if (error) {
            setError(error.message);
            setSaving(false);
        } else {
            router.push("/admin/vibe-projects");
            router.refresh();
        }
    };

    const presetColors = [
        { label: "Violet", value: "#8B5CF6" },
        { label: "Cyan", value: "#06B6D4" },
        { label: "Amber", value: "#F59E0B" },
        { label: "Emerald", value: "#10B981" },
        { label: "Rose", value: "#F43F5E" },
        { label: "Blue", value: "#3B82F6" },
    ];

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <Link
                    href="/admin/vibe-projects"
                    className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Vibe Projects
                </Link>
                <h1 className="text-3xl font-bold text-white">New Vibe Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title & URL */}
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
                            placeholder="My Cool Project"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            URL (optional)
                        </label>
                        <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="https://myproject.com"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                        Description
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent resize-none h-24"
                        placeholder="Short description of what this project does..."
                    />
                </div>

                {/* Status, Span, Order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none"
                        >
                            <option value="Live" className="bg-zinc-900">Live</option>
                            <option value="In Progress" className="bg-zinc-900">In Progress</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                            Card Size
                        </label>
                        <select
                            value={formData.span}
                            onChange={(e) => setFormData((prev) => ({ ...prev, span: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent appearance-none"
                        >
                            <option value="small" className="bg-zinc-900">Small (half width)</option>
                            <option value="large" className="bg-zinc-900">Large (full width)</option>
                        </select>
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

                {/* Accent Color */}
                <div>
                    <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                        Accent Color
                    </label>
                    <div className="flex items-center gap-3 flex-wrap">
                        {presetColors.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, accent: color.value }))}
                                className={`w-10 h-10 rounded-xl border-2 transition-all ${
                                    formData.accent === color.value
                                        ? "border-white scale-110"
                                        : "border-transparent hover:border-white/30"
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.label}
                            />
                        ))}
                        <div className="flex items-center gap-2 ml-2">
                            <input
                                type="color"
                                value={formData.accent}
                                onChange={(e) => setFormData((prev) => ({ ...prev, accent: e.target.value }))}
                                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
                            />
                            <input
                                type="text"
                                value={formData.accent}
                                onChange={(e) => setFormData((prev) => ({ ...prev, accent: e.target.value }))}
                                className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Screenshot */}
                <div>
                    <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                        Screenshot
                    </label>
                    <MediaUploader
                        value={formData.image}
                        onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                        Tags
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {formData.tags.map((tag) => (
                            <span
                                key={tag}
                                className="flex items-center gap-1.5 bg-accent/20 text-accent text-sm px-3 py-1.5 rounded-lg"
                            >
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            placeholder="Type a tag and press Enter"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/15 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
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
                        href="/admin/vibe-projects"
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
