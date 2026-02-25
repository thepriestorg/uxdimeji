import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, Sparkles } from "lucide-react";

export default async function VibeProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const { data: projects, error } = await supabase
        .from("vibe_projects")
        .select("*")
        .order("order", { ascending: true });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Sparkles className="w-7 h-7 text-accent" />
                        Vibe Projects
                    </h1>
                    <p className="text-white/50">Manage your vibe coded projects</p>
                </div>
                <Link
                    href="/admin/vibe-projects/new"
                    className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New Vibe Project
                </Link>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                    <p className="font-bold mb-2">Error loading vibe projects</p>
                    <p className="text-sm">Make sure the <code className="bg-white/10 px-1.5 py-0.5 rounded">vibe_projects</code> table exists in Supabase. Run the migration file at <code className="bg-white/10 px-1.5 py-0.5 rounded">supabase/migrations/create_vibe_projects.sql</code></p>
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5 hover:bg-white/[0.07] transition-colors"
                        >
                            {/* Color accent dot */}
                            <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: project.accent }}
                            />

                            {/* Thumbnail */}
                            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                                {project.image && (
                                    <img
                                        src={project.image}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-white truncate">{project.title}</h3>
                                    <span className={`shrink-0 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        project.status === "Live"
                                            ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20"
                                            : "text-amber-400 bg-amber-400/10 border border-amber-400/20"
                                    }`}>
                                        {project.status === "Live" ? "● Live" : "◐ WIP"}
                                    </span>
                                    <span className={`shrink-0 text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        project.span === "large"
                                            ? "text-violet-400 bg-violet-400/10 border border-violet-400/20"
                                            : "text-white/30 bg-white/5 border border-white/10"
                                    }`}>
                                        {project.span}
                                    </span>
                                </div>
                                <p className="text-sm text-white/40 truncate">{project.description}</p>
                                {project.tags && project.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {project.tags.map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-mono text-white/20 bg-white/5 px-1.5 py-0.5 rounded">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                {project.url && (
                                    <a
                                        href={project.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                        title="Visit"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                )}
                                <Link
                                    href={`/admin/vibe-projects/${project.id}`}
                                    className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
                    <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No vibe projects yet</h3>
                    <p className="text-white/50 mb-6">Add your first vibe coded project</p>
                    <Link
                        href="/admin/vibe-projects/new"
                        className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Create Vibe Project
                    </Link>
                </div>
            )}
        </div>
    );
}
