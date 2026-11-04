import { createPublicClient } from "@/lib/supabase/public";
import { getProjectSummary } from "@/lib/seo";
import V2SelectedWorkClient from "./V2SelectedWorkClient";

export default async function V2SelectedWork() {
  const supabase = createPublicClient();

  const [{ data: projects }, { data: vibeProjects }, { data: landingPages }] = await Promise.all([
    supabase
      .from("projects")
      .select("*")
      .eq("is_featured", true)
      .order("order", { ascending: true }),
    supabase
      .from("vibe_projects")
      .select("*")
      .order("order", { ascending: true }),
    supabase
      .from("landing_pages")
      .select("id,title,category,description,image_url,live_url,figma_url")
      .eq("is_visible", true)
      .order("display_order", { ascending: true }),
  ]);

  const visibleVibeProjects = (vibeProjects || []).filter(
    (project) => project.is_featured !== false
  );

  // The list only shows each project's lead paragraph, so keep full case studies out of the
  // homepage's HTML.
  const projectCards = (projects || []).map(({ content, ...project }) => ({
    ...project,
    summary: getProjectSummary(content),
  }));

  return (
    <V2SelectedWorkClient
      projects={projectCards}
      vibeProjects={visibleVibeProjects}
      landingPages={landingPages || []}
    />
  );
}
