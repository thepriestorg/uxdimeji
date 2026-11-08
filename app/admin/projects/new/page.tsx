import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectForm from "@/components/admin/ProjectForm";
import { emptyProject } from "@/lib/projects";

export default async function NewProjectPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");

    // New work joins the end of the list; drag it up on the projects page.
    const { data: last } = await supabase
        .from("projects")
        .select("order")
        .order("order", { ascending: false })
        .limit(1)
        .maybeSingle();

    return <ProjectForm initial={emptyProject((last?.order ?? 0) + 1)} />;
}
