import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProjectForm, { emptyProject, type ProjectFormValues } from "@/components/admin/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/admin/login");

    const { data } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (!data) notFound();

    const defaults = emptyProject();
    // Fill any column the row leaves empty, so the form never handles null where it expects text.
    const initial = Object.fromEntries(
        Object.entries({ ...defaults, ...data }).map(([key, value]) => [
            key,
            value ?? defaults[key as keyof typeof defaults] ?? value,
        ]),
    ) as ProjectFormValues;

    return <ProjectForm key={data.id} initial={initial} />;
}
