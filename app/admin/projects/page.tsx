import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye } from "lucide-react";

export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .order("order", { ascending: true });

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-white/50">Manage your portfolio projects</p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                    Error loading projects. Make sure the projects table exists in Supabase.
                </div>
            ) : projects && projects.length > 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left text-white/50 text-sm font-mono uppercase tracking-wider px-6 py-4">Title</th>
                                <th className="text-left text-white/50 text-sm font-mono uppercase tracking-wider px-6 py-4">Category</th>
                                <th className="text-left text-white/50 text-sm font-mono uppercase tracking-wider px-6 py-4">Year</th>
                                <th className="text-left text-white/50 text-sm font-mono uppercase tracking-wider px-6 py-4">Featured</th>
                                <th className="text-right text-white/50 text-sm font-mono uppercase tracking-wider px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {project.featured_image && (
                                                <img
                                                    src={project.featured_image}
                                                    alt={project.title}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <span className="font-bold text-white">{project.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">{project.category}</td>
                                    <td className="px-6 py-4 text-white/60">{project.year}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${project.is_featured ? "bg-accent/20 text-accent" : "bg-white/10 text-white/40"}`}>
                                            {project.is_featured ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/projects/${project.slug}`}
                                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            <Link
                                                href={`/admin/projects/${project.slug}`}
                                                className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                    <p className="text-white/50 mb-6">Create your first project to get started</p>
                    <Link
                        href="/admin/projects/new"
                        className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        Create Project
                    </Link>
                </div>
            )}
        </div>
    );
}
