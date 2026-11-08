import { createPublicClient } from "@/lib/supabase/public";
import { getProjectSummary } from "@/lib/seo";
import type { Project } from "@/lib/projects";
import { sanitizeSummary, summaryText, truncateWords } from "@/lib/summary";
import WorkList, { type WorkItem } from "./WorkList";

export default async function Work() {
  const { data } = await createPublicClient()
    .from("projects")
    .select("*")
    .eq("is_published", true)
    .order("order", { ascending: true });

  // Cards only need the lead paragraph, so full case studies stay out of the homepage's HTML.
  const items: WorkItem[] = ((data ?? []) as Project[]).map(({ content, ...project }, index) => ({
    id: project.id,
    title: project.title,
    slug: project.slug,
    year: project.year,
    category: project.category,
    kind: project.kind,
    made_for: project.made_for,
    client_name: project.client_name,
    role: project.role,
    has_case_study: project.has_case_study,
    live_url: project.live_url,
    featured_image: project.featured_image,
    metrics: project.metrics ?? [],
    // Case studies: a trimmed lead (the full story is one click away).
    // Live projects: the excerpt written in the admin, formatting kept, shown in full.
    summary: project.has_case_study
      ? sanitizeSummary(truncateWords(summaryText(project.summary) || getProjectSummary(content), index === 0 ? 300 : 190)) || null
      : sanitizeSummary(project.summary) || null,
  }));

  if (!items.length) return null;
  return <WorkList items={items} />;
}
