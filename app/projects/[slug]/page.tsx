import { createPublicClient } from "@/lib/supabase/public";
import { absoluteUrl, authorRef, getProjectSummary, jsonLdScript, truncateDescription } from "@/lib/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { getLocalGif, getLocalPoster, getLocalVideo, type LocalVideoWidth } from "@/lib/local-media";
import { kindLabel, madeForLabel, type ProjectMetric } from "@/lib/projects";
import { sanitizeSummary, summaryText } from "@/lib/summary";
import { displayDomain } from "@/lib/media";
import "@/app/case-studies.css"; // The new case studies CSS

// TipTap content renderer
function RenderContent({ content }: { content: string | null }) {
    if (!content) return null;

    try {
        const doc = JSON.parse(content);
        if (!doc.content) return null;
        
        const blocks: React.ReactNode[] = [];
        let currentTextBlock: any[] = [];
        
        doc.content.forEach((child: any, i: number) => {
            if (child.type === "image" || child.type === "figure" || child.type === "youtube") {
                if (currentTextBlock.length > 0) {
                    blocks.push(
                        <section key={`text-${i}`} className="text-block">
                            {currentTextBlock.map((t, j) => renderNode(t, j))}
                        </section>
                    );
                    currentTextBlock = [];
                }
                if (child.type === "figure") {
                    // Custom captioned figure node
                    blocks.push(
                        <figure key={`fig-${i}`} className="media-block">
                            <div className="desktop-shot" style={{ position: "relative", width: "100%", height: "auto" }}>
                                <Image
                                    src={child.attrs?.src as string}
                                    alt={(child.attrs?.alt as string) || "Project media"}
                                    width={1400}
                                    height={1000}
                                    style={{ width: "100%", height: "auto", display: "block" }}
                                    quality={95}
                                />
                            </div>
                            {child.attrs?.caption && <figcaption>{child.attrs.caption}</figcaption>}
                        </figure>
                    );
                } else if (child.type === "image") {
                    blocks.push(
                        <figure key={`img-${i}`} className="media-block">
                            <div className="desktop-shot" style={{ position: "relative", width: "100%", height: "auto" }}>
                                <Image
                                    src={child.attrs?.src as string}
                                    alt={(child.attrs?.alt as string) || "Project media"}
                                    width={1400}
                                    height={1000}
                                    style={{ width: "100%", height: "auto", display: "block" }}
                                    quality={95}
                                />
                            </div>
                            {child.attrs?.alt && <figcaption>{child.attrs.alt}</figcaption>}
                        </figure>
                    );
                } else if (child.type === "youtube") {
                    blocks.push(
                        <figure key={`yt-${i}`} className="media-block">
                             <div className="desktop-shot" style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9" }}>
                                <iframe
                                    src={`https://www.youtube.com/embed/${extractYoutubeId(child.attrs?.src as string)}`}
                                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                                    allowFullScreen
                                />
                            </div>
                        </figure>
                    );
                }
            } else {
                currentTextBlock.push(child);
            }
        });

        if (currentTextBlock.length > 0) {
            blocks.push(
                <section key="text-last" className="text-block">
                    {currentTextBlock.map((t, j) => renderNode(t, j))}
                </section>
            );
        }

        return <>{blocks}</>;
    } catch {
        return null;
    }
}

function renderNode(node: any, key: number): React.ReactNode {
    if (!node) return null;

    if (node.type === "paragraph") {
        return (
            <p key={key}>
                {node.content?.map((child: any, i: number) => renderInline(child, i))}
            </p>
        );
    }

    if (node.type === "heading") {
        const level = (node.attrs?.level || 2) as number;
        // In case-studies.css, h2 is styled. Let's make all headings h2 or h3.
        const HeadingTag = `h${Math.max(2, level)}` as any;
        return (
            <HeadingTag key={key}>
                {node.content?.map((child: any, i: number) => renderInline(child, i))}
            </HeadingTag>
        );
    }

    if (node.type === "bulletList") {
        return (
            <ul key={key} style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                {node.content?.map((child: any, i: number) => <li key={i}>{child.content?.map((c: any, j: number) => renderNode(c, j))}</li>)}
            </ul>
        );
    }

    if (node.type === "orderedList") {
        return (
            <ol key={key} style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                {node.content?.map((child: any, i: number) => <li key={i}>{child.content?.map((c: any, j: number) => renderNode(c, j))}</li>)}
            </ol>
        );
    }

    if (node.type === "blockquote") {
        return (
            <blockquote key={key} style={{ borderLeft: "2px solid var(--line)", paddingLeft: "20px", color: "var(--muted)", fontStyle: "italic" }}>
                {node.content?.map((child: any, i: number) => renderNode(child, i))}
            </blockquote>
        );
    }

    if (node.type === "codeBlock") {
        const code = node.content?.map((child: any) => child.text || "").join("") || "";
        return (
            <pre key={key} style={{ background: "var(--media)", padding: "20px", overflowX: "auto" }}>
                <code>{code}</code>
            </pre>
        );
    }

    if (node.type === "horizontalRule") {
        return <hr key={key} style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "2rem 0" }} />;
    }

    return null;
}

function renderInline(node: any, key: number): React.ReactNode {
    if (node.type === "text") {
        let text: React.ReactNode = node.text;
        if (node.marks) {
            node.marks.forEach((mark: any) => {
                if (mark.type === "bold")      text = <strong key={key}>{text}</strong>;
                if (mark.type === "italic")    text = <em key={key}>{text}</em>;
                if (mark.type === "underline") text = <u key={key}>{text}</u>;
                if (mark.type === "strike")    text = <s key={key}>{text}</s>;
                if (mark.type === "code")      text = <code key={key}>{text}</code>;
                if (mark.type === "link")      text = <a key={key} href={mark.attrs?.href as string} target="_blank" rel="noopener noreferrer">{text}</a>;
            });
        }
        return <span key={key}>{text}</span>;
    }
    return null;
}

function extractYoutubeId(url: string): string {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match?.[1] || "";
}

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");

const getOptimizedVideoUrl = (url: string, width: LocalVideoWidth = 1600) => getLocalVideo(url, width) ??
    (url.includes("cloudinary.com") && url.includes("/video/upload/")
        ? url.replace("/video/upload/", `/video/upload/f_auto,q_auto:eco,c_limit,w_${width}/`)
        : url);
const getVideoPoster = (url: string) => url.includes("cloudinary.com") && url.includes("/video/upload/")
    ? url.replace("/video/upload/", "/video/upload/so_0,f_jpg,q_auto,w_1200/").replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg$2")
    : undefined;

// Serve case studies from cache; admin edits show up within a minute.
export const revalidate = 60;

export async function generateStaticParams() {
    const { data: projects } = await createPublicClient().from("projects").select("slug").eq("is_published", true).eq("has_case_study", true);
    return (projects ?? []).map(({ slug }) => ({ slug }));
}

const projectDescription = (project: { title: string; category: string; content?: string | null }) => {
    const summary = getProjectSummary(project.content);
    return summary
        ? truncateDescription(summary)
        : `${project.title}, a ${project.category} product design case study by Oladimeji Abubakar.`;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = createPublicClient();

    const { data: project } = await supabase
        .from("projects")
        .select("title, category, featured_image, content, is_published")
        .eq("slug", slug)
        .eq("has_case_study", true)
        .single();

    if (!project) {
        return {
            title: { absolute: "Project Not Found | Oladimeji Abubakar" },
        };
    }

    const description = projectDescription(project);

    const socialImage = project.featured_image && isVideoUrl(project.featured_image)
        ? getVideoPoster(project.featured_image)
        : project.featured_image;

    return {
        title: `${project.title} — Product Design Case Study`,
        description,
        alternates: {
            canonical: `/projects/${slug}`,
        },
        // Retired projects stay reachable by direct link but stop competing for search.
        ...(project.is_published ? {} : { robots: { index: false, follow: true } }),
        openGraph: {
            title: `${project.title} — Product Design Case Study | Oladimeji Abubakar`,
            description,
            type: "article",
            siteName: "Oladimeji Abubakar",
            url: `/projects/${slug}`,
            images: socialImage ? [
                {
                    url: socialImage,
                    width: 1200,
                    height: 630,
                    alt: project.title,
                }
            ] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title} — Product Design Case Study | Oladimeji Abubakar`,
            description,
            images: socialImage ? [socialImage] : [],
        },
    };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = createPublicClient();

    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("has_case_study", true)
        .single();

    if (!project) {
        notFound();
    }

    // Walk the featured list in order, so each case study links to a different one and
    // a crawler landing on any of them can reach them all.
    const { data: featuredProjects } = await supabase
        .from("projects")
        .select("id, title, slug")
        .eq("is_published", true)
        .eq("has_case_study", true)
        .order("order", { ascending: true });

    const featured = featuredProjects ?? [];
    const nextProject = featured.filter(({ slug: other }) => other !== slug)[
        Math.max(featured.findIndex(({ slug: other }) => other === slug), 0) % Math.max(featured.length - 1, 1)
    ];
    const themeClass = `${project.slug}-theme`;
    const schemaImage = project.featured_image && isVideoUrl(project.featured_image)
        ? getVideoPoster(project.featured_image)
        : project.featured_image;
    const articleJsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `${project.title} — Product Design Case Study`,
        description: projectDescription(project),
        url: absoluteUrl(`/projects/${project.slug}`),
        mainEntityOfPage: absoluteUrl(`/projects/${project.slug}`),
        ...(schemaImage ? { image: [schemaImage] } : {}),
        ...(project.created_at ? { datePublished: project.created_at } : {}),
        ...(project.updated_at ? { dateModified: project.updated_at } : {}),
        genre: project.category,
        author: authorRef,
        publisher: authorRef,
    };

    return (
        <div className="case-study-page">
            <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd)} />
            <div className={themeClass} style={{ minHeight: "100vh", position: "relative" }}>
                <div className="case-progress" data-case-progress aria-hidden="true" style={{ transform: "scaleX(1)" }}></div>
                <SiteHeader />

                <main id="case-main" className="project-page">
                    <header className="project-header cs-header">
                        <div className="cs-tags">
                            <span className="stamp">Case study</span>
                            <span className="cs-meta">
                                {[kindLabel(project.kind), madeForLabel(project), project.year].filter(Boolean).join(" · ")}
                            </span>
                        </div>
                        <h1>{project.title}</h1>
                        {(summaryText(project.summary) || getProjectSummary(project.content)) && (
                            <div
                                className="cs-summary"
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeSummary(summaryText(project.summary) ? project.summary : getProjectSummary(project.content)),
                                }}
                            />
                        )}
                        <dl className="cs-specs">
                            {project.role && <div><dt>Role</dt><dd>{project.role}</dd></div>}
                            {project.category && <div><dt>Field</dt><dd>{project.category}</dd></div>}
                            {project.year && <div><dt>Year</dt><dd>{project.year}</dd></div>}
                            {(project.metrics as ProjectMetric[] | null)?.slice(0, 2).map((metric) => (
                                <div key={`${metric.value}-${metric.label}`}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>
                            ))}
                            {project.live_url && (
                                <div>
                                    <dt>Live</dt>
                                    <dd><a href={project.live_url} target="_blank" rel="noopener noreferrer">{displayDomain(project.live_url)} ↗</a></dd>
                                </div>
                            )}
                        </dl>
                    </header>

                    {project.featured_image && (
                        <figure className="featured-media">
                            <div className="desktop-shot" style={{ position: "relative", width: "100%", height: "auto" }}>
                                {isVideoUrl(project.featured_image) ? (
                                <video
                                    poster={getLocalPoster(project.featured_image) ?? getVideoPoster(project.featured_image)}
                                    aria-label={project.title}
                                    muted
                                    autoPlay
                                    loop
                                    playsInline
                                    controls
                                    preload="metadata"
                                >
                                    <source media="(max-width: 760px)" src={getOptimizedVideoUrl(project.featured_image, 720)} />
                                    <source src={getOptimizedVideoUrl(project.featured_image)} />
                                </video>
                                ) : (
                                <Image
                                    src={getLocalGif(project.featured_image) ?? project.featured_image}
                                    alt={project.title}
                                    width={1400}
                                    height={1000}
                                    style={{ width: "100%", height: "auto", display: "block" }}
                                    unoptimized={Boolean(getLocalGif(project.featured_image))}
                                    priority
                                    quality={95}
                                />
                                )}
                            </div>
                            <figcaption>{project.title} feature</figcaption>
                        </figure>
                    )}

                    <article className="case-content">
                        <RenderContent content={project.content} />
                    </article>

                    {nextProject && (
                        <aside className="next-project">
                            <span>Next project</span>
                            <Link href={`/projects/${nextProject.slug}`}>{nextProject.title} <i>→</i></Link>
                        </aside>
                    )}
                </main>

                <SiteFooter />
            </div>
        </div>
    );
}
