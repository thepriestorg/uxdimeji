import { createClient } from "@/lib/supabase/server";
import V2SelectedWorkClient from "./V2SelectedWorkClient";

export default async function V2SelectedWork() {
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

  const visibleVibeProjects = (vibeProjects || []).filter(
    (project) => project.is_featured !== false
  );

  const { data: landingPages } = await supabase
    .from("landing_pages")
    .select("id,title,category,description,image_url,live_url,figma_url")
    .eq("is_visible", true)
    .order("display_order", { ascending: true });

  return (
    <V2SelectedWorkClient
      projects={projects || []}
      vibeProjects={visibleVibeProjects}
      landingPages={landingPages || []}
    />
  );
}
