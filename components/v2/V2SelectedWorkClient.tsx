"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

/* ── Types ──────────────────────────────────────── */
interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  year: string;
  featured_image: string;
  color: string;
  content?: string;
  is_featured: boolean;
  order: number;
}

interface VibeProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  image: string;
  url: string | null;
  accent: string;
  span: string;
  order: number;
  is_featured?: boolean;
}

interface V2SelectedWorkClientProps {
  projects: Project[];
  vibeProjects: VibeProject[];
}

/* ── Helpers ────────────────────────────────────── */
const getOptimizedUrl = (url: string, width: number = 1200) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
};

const pad = (n: number) => String(n).padStart(2, "0");

const hasLongWord = (title: string) =>
  title.split(/\s+/).some((word) => word.length >= 8);

const applyProjectImageRatio = (image: HTMLImageElement | null) => {
  if (!image?.naturalWidth || !image.naturalHeight) return;

  const visual = image.closest<HTMLElement>(".project-visual");
  if (!visual) return;

  const ratio = image.naturalWidth / image.naturalHeight;
  visual.style.setProperty("--project-media-ratio", String(ratio));
  window.dispatchEvent(new Event("portfolio:layout"));
};

const getProjectSummary = (contentJsonString?: string): string => {
  if (!contentJsonString) return "";
  try {
    const doc = JSON.parse(contentJsonString);
    if (!doc || !doc.content || !Array.isArray(doc.content)) return "";

    const paragraphs: string[] = [];
    for (const node of doc.content) {
      if (node.type === "paragraph" && node.content && Array.isArray(node.content)) {
        let text = "";
        for (const child of node.content) {
          if (child.type === "text" && child.text) {
            text += child.text;
          }
        }
        text = text.trim();
        if (text) {
          // Skip metadata lines
          if (/^(role|timeline|platform|tools|client|impact):/i.test(text)) {
            continue;
          }
          paragraphs.push(text);
        }
      }
    }

    if (paragraphs.length > 0) {
      return paragraphs[0];
    }
  } catch {
    return contentJsonString;
  }
  return "";
};

/* ── Component ──────────────────────────────────── */
export default function V2SelectedWorkClient({
  projects,
  vibeProjects,
}: V2SelectedWorkClientProps) {
  const hasDesignProjects = projects.length > 0;
  const hasVibeProjects = vibeProjects.length > 0;

  const totalDesign = projects.length;

  useEffect(() => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        ".selected-work .project-visual img"
      )
    );
    const syncRatio = (event: Event) =>
      applyProjectImageRatio(event.currentTarget as HTMLImageElement);

    images.forEach((image) => {
      image.addEventListener("load", syncRatio);
      if (image.complete) applyProjectImageRatio(image);
    });

    return () => {
      images.forEach((image) => image.removeEventListener("load", syncRatio));
    };
  }, [projects, vibeProjects]);

  if (!hasDesignProjects && !hasVibeProjects) return null;

  return (
    <section className="selected-work" id="work">
      {/* Section intro */}
      <header className="section-intro reveal">
        <p className="eyebrow">Selected work / 2023-Now</p>
        <div>
          <h2 id="work-title">Ideas get interesting when they become useful.</h2>
        </div>
      </header>

      {/* ── Design projects ─────────────────────────── */}
      {projects.map((project, index) => (
        <article key={project.id} className="project-row reveal">
          <Link
            className={`project-visual visual-${project.slug}`}
            href={`/projects/${project.slug}`}
            style={{
              backgroundColor: project.color || "#1a1a1a",
            }}
          >
            <div className="project-visual-inner">
              {project.featured_image ? (
                <Image
                  className="project-visual-media"
                  src={getOptimizedUrl(project.featured_image)}
                  alt={project.title}
                  fill
                  priority={index < 2}
                  quality={90}
                  sizes="(max-width: 980px) calc(100vw - 36px), 62vw"
                  ref={(image) => {
                    if (image?.complete) applyProjectImageRatio(image);
                  }}
                  onLoad={(event) => applyProjectImageRatio(event.currentTarget)}
                />
              ) : (
                <span className="project-visual-fallback">{project.title}</span>
              )}
            </div>
          </Link>

          <div className="project-copy">
            <div className="project-number">
              {pad(index + 1)} / {project.category} / {project.year}
            </div>
            <h3 className={hasLongWord(project.title) ? "project-title-long" : undefined}>
              <Link href={`/projects/${project.slug}`}>
                {project.title}
              </Link>
            </h3>
            {project.content && (
              <p className="project-lead">
                {(() => {
                  const summary = getProjectSummary(project.content);
                  return summary.length > 165
                    ? summary.slice(0, 165).trim() + "…"
                    : summary;
                })()}
              </p>
            )}
            <Link className="text-link" href={`/projects/${project.slug}`}>
              Read case study
              <span className="arrow-icon arrow-out" aria-hidden="true" />
            </Link>
          </div>
        </article>
      ))}

      {/* ── Vibe-coded projects ─────────────────────── */}
      {vibeProjects.map((project, index) => {
        const isExternal = Boolean(
          project.url && !project.url.startsWith("/")
        );

        return (
          <article key={project.id} className="project-row reveal">
            {/* Visual */}
            {project.url ? (
              <a
                className="project-visual"
                href={project.url}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                style={{
                  backgroundColor: project.accent || "#1a1a1a",
                }}
              >
                <div className="project-visual-inner">
                  {project.image ? (
                    <Image
                      className="project-visual-media"
                      src={getOptimizedUrl(project.image)}
                      alt={project.title}
                      fill
                      quality={90}
                      sizes="(max-width: 980px) calc(100vw - 36px), 62vw"
                      ref={(image) => {
                        if (image?.complete) applyProjectImageRatio(image);
                      }}
                      onLoad={(event) => applyProjectImageRatio(event.currentTarget)}
                    />
                  ) : (
                    <span className="project-visual-fallback">{project.title}</span>
                  )}
                </div>
              </a>
            ) : (
              <div
                className="project-visual"
                style={{
                  backgroundColor: project.accent || "#1a1a1a",
                }}
              >
                <div className="project-visual-inner">
                  {project.image ? (
                    <Image
                      className="project-visual-media"
                      src={getOptimizedUrl(project.image)}
                      alt={project.title}
                      fill
                      quality={90}
                      sizes="(max-width: 980px) calc(100vw - 36px), 62vw"
                      ref={(image) => {
                        if (image?.complete) applyProjectImageRatio(image);
                      }}
                      onLoad={(event) => applyProjectImageRatio(event.currentTarget)}
                    />
                  ) : (
                    <span className="project-visual-fallback">{project.title}</span>
                  )}
                </div>
              </div>
            )}

            {/* Copy */}
            <div className="project-copy">
              <div className="project-number">
                {pad(totalDesign + index + 1)} / Built by me / 2025
              </div>
              <h3 className={hasLongWord(project.title) ? "project-title-long" : undefined}>
                {project.url ? (
                  <a
                    href={project.url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                  >
                    {project.title}
                  </a>
                ) : (
                  project.title
                )}
              </h3>
              <p className="project-lead">{project.description}</p>

              {/* Status */}
              {project.status && (
                <div className={`vibe-status ${project.status.toLowerCase() === "live" ? "live" : "wip"}`}>
                  <i />
                  <span>{project.status}</span>
                </div>
              )}

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <div className="vibe-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {project.url && (
                <a
                  className="text-link"
                  href={project.url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                >
                  Visit project
                  <span className="arrow-icon arrow-out" aria-hidden="true" />
                </a>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
