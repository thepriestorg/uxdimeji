import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import ProjectsList from "@/components/admin/ProjectsList";

export default async function ProjectsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");

    const { data: projects, error } = await supabase
        .from("projects")
        .select("id, title, slug, year, featured_image, kind, made_for, client_name, has_case_study, live_url, is_published, order")
        .order("order", { ascending: true });

    return (
        <div className="p-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
                    <p className="text-white/50">Case studies, live products and landing pages, all in one place.</p>
                </div>
                <Link
                    href="/admin/projects/new"
                    className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New project
                </Link>
            </div>

            {error ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-400">
                    Couldn&apos;t load projects: {error.message}
                </div>
            ) : projects && projects.length > 0 ? (
                <ProjectsList initial={projects} />
            ) : (
                <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
                    <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
                    <p className="text-white/50 mb-6">Add your first one to get started.</p>
                    <Link
                        href="/admin/projects/new"
                        className="inline-flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        New project
                    </Link>
                </div>
            )}
        </div>
    );
}
