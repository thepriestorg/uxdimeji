import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
            if (child.type === "image" || child.type === "youtube") {
                if (currentTextBlock.length > 0) {
                    blocks.push(
                        <section key={`text-${i}`} className="text-block">
                            {currentTextBlock.map((t, j) => renderNode(t, j))}
                        </section>
                    );
                    currentTextBlock = [];
                }
                if (child.type === "image") {
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
                                    className="w-full h-full"
                                    style={{ position: "absolute", top: 0, left: 0 }}
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

    return null;
}

function renderInline(node: any, key: number): React.ReactNode {
    if (node.type === "text") {
        let text: React.ReactNode = node.text;
        if (node.marks) {
            node.marks.forEach((mark: any) => {
                if (mark.type === "bold") text = <strong key={key}>{text}</strong>;
                if (mark.type === "italic") text = <em key={key}>{text}</em>;
                if (mark.type === "link") text = <a key={key} href={mark.attrs?.href as string} style={{ textDecoration: "underline" }}>{text}</a>;
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("title, category, featured_image")
        .eq("slug", slug)
        .single();

    if (!project) {
        return {
            title: "Project Not Found - Oladimeji Abubakar",
        };
    }

    return {
        title: `${project.title} - Oladimeji Abubakar`,
        description: `View the ${project.title} project in ${project.category} by Oladimeji Abubakar.`,
        openGraph: {
            title: `${project.title} - Oladimeji Abubakar`,
            description: `View the ${project.title} project in ${project.category} by Oladimeji Abubakar.`,
            images: project.featured_image ? [
                {
                    url: project.featured_image,
                    width: 1200,
                    height: 630,
                    alt: project.title,
                }
            ] : [],
        },
        twitter: {
            card: "summary_large_image",
            title: `${project.title} - Oladimeji Abubakar`,
            description: `View the ${project.title} project in ${project.category} by Oladimeji Abubakar.`,
            images: project.featured_image ? [project.featured_image] : [],
        },
    };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!project) {
        notFound();
    }

    // Fetch next project for the footer
    const { data: otherProjects } = await supabase
        .from("projects")
        .select("id, title, slug")
        .neq("slug", slug)
        .eq("is_featured", true)
        .order("order", { ascending: true })
        .limit(1);

    const nextProject = otherProjects?.[0];
    const themeClass = `${project.slug}-theme`;

    return (
        <div className="case-study-page">
            <div className={themeClass} style={{ minHeight: "100vh", position: "relative" }}>
                <div className="case-progress" data-case-progress aria-hidden="true" style={{ transform: "scaleX(1)" }}></div>
                <nav className="case-nav scrolled">
                    <Link className="case-brand" href="/">Dimeji A.</Link>
                    <Link href="/#work">All work</Link>
                    {nextProject && (
                        <Link href={`/projects/${nextProject.slug}`}>Next project <span>→</span></Link>
                    )}
                </nav>

                <main id="case-main" className="project-page">
                    <header className="project-header">
                        <p className="project-label">{project.title} / {project.category} / {project.year}</p>
                        <h1>{project.title}</h1>
                    </header>

                    {project.featured_image && (
                        <figure className="featured-media">
                            <div className="desktop-shot" style={{ position: "relative", width: "100%", height: "auto" }}>
                                <Image
                                    src={project.featured_image}
                                    alt={project.title}
                                    width={1400}
                                    height={1000}
                                    style={{ width: "100%", height: "auto", display: "block" }}
                                    priority
                                    quality={95}
                                />
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

                <footer className="case-footer">
                    <span>© {new Date().getFullYear()} Dimeji A.</span>
                    <Link href="/#work">All projects</Link>
                    <a href="#case-main">Back to top ↑</a>
                </footer>
            </div>
        </div>
    );
}
