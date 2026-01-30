import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/admin/login");
    }

    // Get project count
    const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-white/50">Welcome back, {user.email}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{projectCount ?? 0}</p>
                            <p className="text-white/50 text-sm">Projects</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <Link
                        href="/admin/projects/new"
                        className="flex items-center gap-2 bg-accent text-black px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </Link>
                    <Link
                        href="/admin/projects"
                        className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
                    >
                        <FolderKanban className="w-5 h-5" />
                        View All Projects
                    </Link>
                </div>
            </div>
        </div>
    );
}
