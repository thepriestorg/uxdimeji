"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { MOBILE_VIDEO_QUERY, ViewportGif, ViewportVideo } from "./ViewportMedia";
import { getLocalGif, getLocalPoster, getLocalVideo, type LocalVideoWidth } from "@/lib/local-media";

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
const isGifUrl = (url: string) => /\.gif(\?|$)/i.test(url) || /[?&,]f_gif(?:[,&]|$)/i.test(url);
// Cap delivered width: the source files are full-resolution screen recordings.
const getOptimizedVideoUrl = (url: string, width: LocalVideoWidth = 1280) =>
  getLocalVideo(url, width) ??
  (url.includes("cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", `/video/upload/f_auto,q_auto:eco,c_limit,w_${width}/`)
    : url);
const getVideoPoster = (url: string) => {
  const localPoster = getLocalPoster(url);
  if (localPoster) return localPoster;
  if (!url.includes("cloudinary.com") || !url.includes("/video/upload/")) return undefined;
  return url
    .replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1200/")
    .replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2");
};
// Keep the reel on the active palette without recoloring its preview media.
const landingCardThemes = [
  { background: "var(--preview-surface, #355f52)", foreground: "var(--preview-ink, #f4f3ef)" },
  { background: "var(--preview-raised, #d15632)", foreground: "var(--preview-ink, #f4f3ef)" },
  { background: "var(--preview-surface, #e8e8e3)", foreground: "var(--preview-ink, #181816)" },
  { background: "var(--preview-raised, #f4f3ef)", foreground: "var(--preview-ink, #181816)" },
];

type Collection = "projects" | "live" | "landing";

const getDisplayDomain = (url: string | null) => {
  if (!url) return "in progress";
  if (url.startsWith("/")) return `uxdimeji.com${url}`;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const hasLongWord = (title: string) =>
  title.split(/\s+/).some((word) => word.length >= 8);

const applyProjectMediaRatio = (media: HTMLImageElement | HTMLVideoElement | null) => {
  if (!media) return;

  const width = media instanceof HTMLVideoElement ? media.videoWidth : media.naturalWidth;
  const height = media instanceof HTMLVideoElement ? media.videoHeight : media.naturalHeight;
  if (!width || !height) return;

  const visual = media.closest<HTMLElement>(".project-visual");
  if (!visual) return;

  const ratio = width / height;
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

function ProjectMedia({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  if (isVideoUrl(src)) {
    return (
      <ViewportVideo
        className="project-visual-media"
        src={getOptimizedVideoUrl(src)}
        mobileSrc={getOptimizedVideoUrl(src, 720)}
        poster={getVideoPoster(src)}
        ariaLabel={alt}
        eager={eager}
        onMetadata={applyProjectMediaRatio}
      />
    );
  }
  if (isGifUrl(src)) {
    return (
      <ViewportGif
        className="project-visual-media"
        src={getLocalGif(src) ?? src}
        alt={alt}
        onMediaLoad={applyProjectMediaRatio}
      />
    );
  }
  return (
    <Image
      className="project-visual-media"
      src={getOptimizedUrl(src)}
      alt={alt}
      fill
      priority={eager}
      quality={90}
      sizes="(max-width: 980px) calc(100vw - 36px), 46vw"
      ref={(image) => {
        if (image?.complete) applyProjectMediaRatio(image);
      }}
      onLoad={(event) => applyProjectMediaRatio(event.currentTarget)}
    />
  );
}

/* ── Component ──────────────────────────────────── */
export default function V2SelectedWorkClient({
  projects,
  vibeProjects,
  landingPages,
}: V2SelectedWorkClientProps) {
  const collections = [
    { id: "projects" as const, label: "Case studies", count: projects.length },
    { id: "live" as const, label: "Built by me", count: vibeProjects.length },
    { id: "landing" as const, label: "Landing pages", count: landingPages.length },
  ].filter((collection) => collection.count > 0);
  const [activeCollection, setActiveCollection] = useState<Collection>(collections[0]?.id ?? "projects");
  const [selectedLanding, setSelectedLanding] = useState<LandingPage | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const openCollection = (collection: Collection) => {
    setActiveCollection(collection);
    const tabs = tabsRef.current;
    if (!tabs) return;
    // Land just below the floating header so the tabs stay in view.
    window.scrollTo({ top: tabs.getBoundingClientRect().top + window.scrollY - 110, behavior: "smooth" });
  };

  useEffect(() => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>(
        ".selected-work .project-visual img:not([data-viewport-gif])"
      )
    );
    const syncRatio = (event: Event) =>
      applyProjectMediaRatio(event.currentTarget as HTMLImageElement);

    images.forEach((image) => {
      image.addEventListener("load", syncRatio);
      if (image.complete) applyProjectMediaRatio(image);
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

  if (!collections.length) return null;

  return (
    <section className="selected-work" id="work">
      {/* Section intro */}
      <header className="section-intro">
        <p className="eyebrow">Selected work / 2023-Now</p>
        <div>
          <h2 id="work-title">Ideas get interesting when they become useful.</h2>
          <p>Selected product work spanning strategy, interaction design, interface systems, and functional delivery.</p>
        </div>
      </header>

      <div ref={tabsRef} className="work-tabs" role="tablist" aria-label="Work collections" style={{ "--tab-count": collections.length } as React.CSSProperties}>
        {collections.map((collection) => (
          <button
            key={collection.id}
            role="tab"
            aria-selected={activeCollection === collection.id}
            className={activeCollection === collection.id ? "active" : ""}
            onClick={() => setActiveCollection(collection.id)}
          >
            {collection.label} <i>{collection.count}</i>
          </button>
        ))}
      </div>

      {/* ── Case studies ────────────────────────────── */}
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
                <ProjectMedia src={project.featured_image} alt={project.title} eager={index < 2} />
              ) : (
                <span className="project-visual-fallback">{project.title}</span>
              )}
            </div>
          </Link>

          <div className="project-copy">
            <h3 className={hasLongWord(project.title) ? "project-title-long" : undefined}>
              <Link href={`/projects/${project.slug}`}>
                {project.title}
              </Link>
            </h3>
            {project.content && (
              <p className="project-lead">{getProjectSummary(project.content)}</p>
            )}
            <Link className="case-study-link" href={`/projects/${project.slug}`}>
              <span>Read case study</span>
              <i aria-hidden="true"><ArrowUpRight /></i>
            </Link>
          </div>
        </article>
      ))}
      <div className="playground-project-cta">
        <span>There&apos;s more where that came from</span>
        <div className="playground-project-actions">
          {vibeProjects.length > 0 && (
            <button type="button" onClick={() => openCollection("live")}>
              See what I&apos;ve built <ArrowUpRight aria-hidden="true" />
            </button>
          )}
          <Link href="/playground">
            View UI shots <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
      </div>}

      {/* ── Live builds ─────────────────────────────── */}
      {activeCollection === "live" && (
        <div className="live-panel work-panel" role="tabpanel">
          <div className="live-note">
            <span>Shipped, not just shown</span>
            <p>Products I designed and built end to end. They&apos;re live, so go and click around.</p>
          </div>
          <div className="live-grid">
            {vibeProjects.map((project, index) => {
              const isExternal = Boolean(project.url && !project.url.startsWith("/"));
              const linkProps = project.url
                ? {
                    href: project.url,
                    target: isExternal ? "_blank" : undefined,
                    rel: isExternal ? "noopener noreferrer" : undefined,
                  }
                : null;
              const isLive = project.status?.toLowerCase() === "live";
              const screen = (
                <>
                  <div className="live-window-bar" aria-hidden="true">
                    <span className="live-window-lights"><i /><i /><i /></span>
                    <span className="live-window-url">{getDisplayDomain(project.url)}</span>
                  </div>
                  <div className="live-window-screen" style={{ backgroundColor: project.accent || "#1a1a1a" }}>
                    {project.image ? (
                      <ProjectMedia src={project.image} alt={project.title} eager={index < 2} />
                    ) : (
                      <span className="project-visual-fallback">{project.title}</span>
                    )}
                  </div>
                </>
              );

              return (
                <article key={project.id} className="live-card">
                  {linkProps ? (
                    <a className="live-window" {...linkProps}>{screen}</a>
                  ) : (
                    <div className="live-window">{screen}</div>
                  )}
                  <div className="live-card-body">
                    <div className="live-card-head">
                      <h3>{project.title}</h3>
                      {project.status && (
                        <span className={`live-status ${isLive ? "live" : "wip"}`}>
                          <i />{project.status}
                        </span>
                      )}
                    </div>
                    {project.description && <p>{project.description}</p>}
                    <div className="live-card-foot">
                      {project.tags?.length > 0 && (
                        <ul className="live-tags">
                          {project.tags.slice(0, 3).map((tag) => <li key={tag}>{tag}</li>)}
                        </ul>
                      )}
                      {linkProps && (
                        <a className="live-visit" {...linkProps}>
                          {isLive ? "Visit site" : "Preview"} <ArrowUpRight aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

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
                        <ViewportVideo
                          src={getOptimizedVideoUrl(page.image_url)}
                          mobileSrc={getOptimizedVideoUrl(page.image_url, 720)}
                          poster={getVideoPoster(page.image_url)}
                          ariaLabel={`${page.title} landing page`}
                          eager={index < 2}
                          onMetadata={(video) => {
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
                <video poster={getVideoPoster(selectedLanding.image_url)} autoPlay loop muted playsInline controls preload="auto">
                  <source media={MOBILE_VIDEO_QUERY} src={getOptimizedVideoUrl(selectedLanding.image_url, 720)} />
                  <source src={getOptimizedVideoUrl(selectedLanding.image_url, 1600)} />
                </video>
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
