"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";

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

interface LandingPage {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string;
  live_url: string | null;
  figma_url: string | null;
}

interface V2SelectedWorkClientProps {
  projects: Project[];
  vibeProjects: VibeProject[];
  landingPages: LandingPage[];
}

/* ── Helpers ────────────────────────────────────── */
const getOptimizedUrl = (url: string, width: number = 1200) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},dpr_auto/`);
};

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");
const getOptimizedVideoUrl = (url: string) =>
  url.includes("cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", "/video/upload/q_auto:eco/")
    : url;
const getVideoPoster = (url: string) => {
  if (!url.includes("cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1200/")
    .replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2");
};
// Only existing V2 design-system colors—no gallery-only palette.
const landingCardThemes = [
  { background: "#355f52", foreground: "#f4f3ef" },
  { background: "#d15632", foreground: "#f4f3ef" },
  { background: "#e8e8e3", foreground: "#181816" },
  { background: "#f4f3ef", foreground: "#181816" },
];

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
  landingPages,
}: V2SelectedWorkClientProps) {
  const [activeCollection, setActiveCollection] = useState<"projects" | "landing">("projects");
  const [selectedLanding, setSelectedLanding] = useState<LandingPage | null>(null);
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

  useEffect(() => {
    if (!selectedLanding) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelectedLanding(null);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [selectedLanding]);

  if (!hasDesignProjects && !hasVibeProjects && !landingPages.length) return null;

  return (
    <section className="selected-work" id="work">
      {/* Section intro */}
      <header className="section-intro reveal">
        <p className="eyebrow">Selected work / 2023-Now</p>
        <div>
          <h2 id="work-title">Ideas get interesting when they become useful.</h2>
        </div>
      </header>

      <div className="work-tabs" role="tablist" aria-label="Work collections">
        <button
          role="tab"
          aria-selected={activeCollection === "projects"}
          className={activeCollection === "projects" ? "active" : ""}
          onClick={() => setActiveCollection("projects")}
        >
          <span>01</span> Projects + live work
        </button>
        <button
          role="tab"
          aria-selected={activeCollection === "landing"}
          className={activeCollection === "landing" ? "active" : ""}
          onClick={() => setActiveCollection("landing")}
        >
          <span>02</span> Landing pages <i>{landingPages.length}</i>
        </button>
      </div>

      {/* ── Design projects ─────────────────────────── */}
      {activeCollection === "projects" && <div className="projects-grid work-panel" role="tabpanel">
      {projects.map((project, index) => (
        <article key={project.id} className="project-row">
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
                  sizes="(max-width: 980px) calc(100vw - 36px), 46vw"
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
          <article key={project.id} className="project-row">
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
                      sizes="(max-width: 980px) calc(100vw - 36px), 46vw"
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
                      sizes="(max-width: 980px) calc(100vw - 36px), 46vw"
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
      </div>}

      {activeCollection === "landing" && (
        <div className="landing-work-panel work-panel" role="tabpanel">
          <div className="landing-work-note"><span>Landing page reel</span><p>Sharp pages, built to make one idea impossible to miss.</p></div>
          <div className="landing-gallery-grid">
            {[0, 1].map((column) => (
              <div className={`landing-gallery-column column-${column + 1}`} key={column}>
                {landingPages.map((page, index) => ({ page, index })).filter(({ index }) => index % 2 === column).map(({ page, index }) => (
                  <article
                    className="landing-gallery-card"
                    key={page.id}
                    style={{
                      backgroundColor: landingCardThemes[index % landingCardThemes.length].background,
                      color: landingCardThemes[index % landingCardThemes.length].foreground,
                      order: index,
                    }}
                  >
                    <button className="landing-gallery-image" onClick={() => setSelectedLanding(page)} aria-label={`Open ${page.title}`}>
                      {isVideoUrl(page.image_url) ? (
                        <video
                          src={getOptimizedVideoUrl(page.image_url)}
                          poster={getVideoPoster(page.image_url)}
                          muted autoPlay loop playsInline
                          preload={index < 2 ? "auto" : "metadata"}
                          onLoadedMetadata={(event) => {
                            const video = event.currentTarget;
                            if (video.videoWidth && video.videoHeight) video.parentElement?.style.setProperty("--reel-ratio", `${video.videoWidth} / ${video.videoHeight}`);
                          }}
                        />
                      ) : (
                        <Image src={getOptimizedUrl(page.image_url, 1400)} alt={`${page.title} landing page`} fill sizes="(max-width: 760px) calc(100vw - 36px), 46vw" quality={90} />
                      )}
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div className="landing-card-overlay"><b>Play full view</b><ArrowUpRight aria-hidden="true" /></div>
                    </button>
                    <div className="landing-gallery-meta">
                      <div><p>{page.category || "Landing page"}</p><h3>{page.title}</h3></div>
                      {page.live_url && <a className="landing-card-live" href={page.live_url} target="_blank" rel="noreferrer">Visit live <ArrowUpRight aria-hidden="true" /></a>}
                    </div>
                  </article>
                ))}
              </div>
            ))}
            {!landingPages.length && <p className="landing-empty">Landing-page collection coming soon.</p>}
          </div>
        </div>
      )}

      {selectedLanding && (
        <div className="landing-modal" role="dialog" aria-modal="true" aria-label={selectedLanding.title} onMouseDown={(event) => event.target === event.currentTarget && setSelectedLanding(null)}>
          <div className="landing-modal-shell">
            <button className="landing-modal-close" onClick={() => setSelectedLanding(null)} aria-label="Close"><X aria-hidden="true" /></button>
            <div className="landing-modal-media">
              {isVideoUrl(selectedLanding.image_url) ? (
                <video src={getOptimizedVideoUrl(selectedLanding.image_url)} poster={getVideoPoster(selectedLanding.image_url)} autoPlay loop muted playsInline controls preload="auto" />
              ) : (
                <Image src={getOptimizedUrl(selectedLanding.image_url, 1800)} alt={selectedLanding.title} fill sizes="90vw" quality={95} />
              )}
            </div>
            <div className="landing-modal-info">
              <div><span>{selectedLanding.category || "Landing page"}</span><h3>{selectedLanding.title}</h3></div>
              {selectedLanding.description && <p>{selectedLanding.description}</p>}
              <nav>
                {selectedLanding.live_url && <a className="landing-live-link" href={selectedLanding.live_url} target="_blank" rel="noreferrer">Visit live site <ArrowUpRight aria-hidden="true" /></a>}
                {selectedLanding.figma_url && <a className="landing-figma-link" href={selectedLanding.figma_url} target="_blank" rel="noreferrer">Figma <ArrowUpRight aria-hidden="true" /></a>}
              </nav>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
