// One shape for every piece of work: case studies, live products and landing pages all live in
// the `projects` table. What a card shows and where it links comes from these fields.

export const PROJECT_KINDS = [
  { value: "product", label: "Product" },
  { value: "web_app", label: "Web app" },
  { value: "mobile_app", label: "Mobile app" },
  { value: "website", label: "Website" },
  { value: "landing_page", label: "Landing page" },
  { value: "other", label: "Other" },
] as const;

export type ProjectKind = (typeof PROJECT_KINDS)[number]["value"];
export type MadeFor = "client" | "personal";

export type ProjectMetric = { value: string; label: string };

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  year: string | null;
  featured_image: string | null;
  content: string | null;
  order: number;
  kind: ProjectKind;
  made_for: MadeFor | null;
  client_name: string | null;
  has_case_study: boolean;
  live_url: string | null;
  figma_url: string | null;
  summary: string | null;
  role: string | null;
  metrics: ProjectMetric[];
  tags: string[];
  status: string | null;
  accent: string | null;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
};

export const kindLabel = (kind: string | null | undefined) =>
  PROJECT_KINDS.find((option) => option.value === kind)?.label ?? "Project";

export const madeForLabel = (project: Pick<Project, "made_for" | "client_name">) =>
  project.made_for === "client"
    ? project.client_name?.trim() || "Client"
    : project.made_for === "personal"
      ? "Personal"
      : null;

export const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Until the old columns are dropped, keep `is_featured` meaning what the previous site expects:
// a visible case study. Anything that only links out stays off the old case-study list.
export const legacyFeatured = (project: Pick<Project, "is_published" | "has_case_study">) =>
  project.is_published && project.has_case_study;

// Defaults for a new project. Kept out of the client form so server pages can call it.
export type ProjectFormValues = Omit<Project, "id" | "created_at" | "updated_at"> & { id?: string };

export const emptyProject = (order = 0): ProjectFormValues => ({
  title: "",
  slug: "",
  category: "",
  year: new Date().getFullYear().toString(),
  featured_image: "",
  content: "",
  order,
  kind: "product",
  made_for: "client",
  client_name: "",
  has_case_study: true,
  live_url: "",
  figma_url: "",
  summary: "",
  role: "",
  metrics: [],
  tags: [],
  status: "",
  accent: "",
  is_published: true,
});
