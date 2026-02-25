import { createClient } from "@/lib/supabase/server";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
    const supabase = await createClient();

    const { data: projects } = await supabase
        .from("projects")
        .select("*")
        .eq("is_featured", true)
        .order("order", { ascending: true });

    const { data: vibeProjects } = await supabase
        .from("vibe_projects")
        .select("*")
        .order("order", { ascending: true });

    return <ProjectsClient projects={projects || []} vibeProjects={vibeProjects || []} />;
}
