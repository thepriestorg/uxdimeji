import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// TipTap content renderer
function RenderContent({ content }: { content: string | null }) {
    if (!content) return null;

    try {
        const doc = JSON.parse(content);
        return <>{renderNode(doc)}</>;
    } catch {
        return null;
    }
}

function renderNode(node: { type?: string; content?: unknown[]; attrs?: Record<string, unknown>; text?: string; marks?: { type: string; attrs?: Record<string, unknown> }[] }): React.ReactNode {
    if (!node) return null;

    if (node.type === "doc") {
        return node.content?.map((child, i) => <div key={i}>{renderNode(child as typeof node)}</div>);
    }

    if (node.type === "paragraph") {
        return (
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-6">
                {node.content?.map((child, i) => <span key={i}>{renderNode(child as typeof node)}</span>)}
            </p>
        );
    }

    if (node.type === "heading") {
        const level = (node.attrs?.level || 1) as 1 | 2 | 3 | 4 | 5 | 6;
        const styles: Record<number, string> = {
            1: "text-4xl md:text-6xl font-black text-white mb-8 mt-20 first:mt-0",
            2: "text-3xl md:text-4xl font-bold text-white mb-6 mt-16 first:mt-0",
            3: "text-2xl md:text-3xl font-bold text-white mb-4 mt-12",
            4: "text-xl md:text-2xl font-semibold text-white mb-3 mt-8",
            5: "text-lg md:text-xl font-semibold text-white mb-2 mt-6",
            6: "text-base md:text-lg font-semibold text-white mb-2 mt-4",
        };
        const HeadingTag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        return (
            <HeadingTag className={styles[level]}>
                {node.content?.map((child, i) => <span key={i}>{renderNode(child as typeof node)}</span>)}
            </HeadingTag>
        );
    }

    if (node.type === "bulletList") {
        return (
            <ul className="list-disc ml-6 space-y-2 text-white/70 text-lg mb-6">
                {node.content?.map((child, i) => renderNode(child as typeof node))}
            </ul>
        );
    }

    if (node.type === "orderedList") {
        return (
            <ol className="list-decimal ml-6 space-y-2 text-white/70 text-lg mb-6">
                {node.content?.map((child, i) => renderNode(child as typeof node))}
            </ol>
        );
    }

    if (node.type === "listItem") {
        return <li key={Math.random()}>{node.content?.map((child) => renderNode(child as typeof node))}</li>;
    }

    if (node.type === "blockquote") {
        return (
            <blockquote className="border-l-2 border-white/20 pl-8 my-12 text-2xl md:text-3xl text-white/60 font-serif italic leading-relaxed">
                {node.content?.map((child, i) => <div key={i}>{renderNode(child as typeof node)}</div>)}
            </blockquote>
        );
    }

    if (node.type === "codeBlock") {
        const code = node.content?.map((child) => (child as typeof node).text || "").join("") || "";
        return (
            <pre className="bg-white/5 rounded-xl p-6 overflow-x-auto my-8">
                <code className="text-sm text-white/80 font-mono">{code}</code>
            </pre>
        );
    }

    if (node.type === "image") {
        return (
            <figure className="my-16 -mx-6 md:-mx-12 lg:-mx-24">
                <img
                    src={node.attrs?.src as string}
                    alt={node.attrs?.alt as string || ""}
                    className="w-full"
                />
            </figure>
        );
    }

    if (node.type === "youtube") {
        return (
            <div className="aspect-video rounded-xl overflow-hidden my-12">
                <iframe
                    src={`https://www.youtube.com/embed/${extractYoutubeId(node.attrs?.src as string)}`}
                    className="w-full h-full"
                    allowFullScreen
                />
            </div>
        );
    }

    if (node.type === "text") {
        let text: React.ReactNode = node.text;
        if (node.marks) {
            node.marks.forEach((mark) => {
                if (mark.type === "bold") text = <strong className="font-semibold text-white">{text}</strong>;
                if (mark.type === "italic") text = <em>{text}</em>;
                if (mark.type === "link") text = <a href={mark.attrs?.href as string} className="underline underline-offset-4 hover:text-white transition-colors">{text}</a>;
            });
        }
        return text;
    }

    return null;
}

function extractYoutubeId(url: string): string {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match?.[1] || "";
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

    // Fetch other projects (excluding current)
    const { data: otherProjects } = await supabase
        .from("projects")
        .select("id, title, slug, category, featured_image")
        .neq("slug", slug)
        .eq("is_featured", true)
        .order("order", { ascending: true })
        .limit(2);

    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />

            {/* Hero - Intrinsic Height Image with Overlay Text */}
            <section className="relative w-full">
                {/* Background Image - Intrinsic Size */}
                {project.featured_image && (
                    <div className="relative w-full">
                        <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-auto object-cover bg-zinc-900"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60" />
                    </div>
                )}

                {/* Back Link - Below Navbar */}
                <div className="absolute top-24 md:top-28 left-6 md:left-12 z-30">
                    <Link
                        href="/#projects"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none">
                    <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 pb-8 md:pb-16 pt-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-auto">
                        {/* Title Group */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-end">
                            <div className="lg:col-span-9">
                                <h1 className="text-[10vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.85] text-white">
                                    {project.title}
                                </h1>
                            </div>

                            {/* Minimal Meta */}
                            <div className="lg:col-span-3 flex lg:flex-col gap-6 lg:gap-4 text-xs md:text-sm">
                                <div>
                                    <span className="block text-white/60 mb-1 font-mono uppercase tracking-widest">Type</span>
                                    <span className="text-white font-medium">{project.category}</span>
                                </div>
                                <div>
                                    <span className="block text-white/60 mb-1 font-mono uppercase tracking-widest">Year</span>
                                    <span className="text-white font-medium">{project.year}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content - Single Column */}
            <section className="max-w-[900px] mx-auto px-6 md:px-12 py-24 md:py-32">
                <article>
                    <RenderContent content={project.content} />
                </article>
            </section>

            {/* Other Projects */}
            {otherProjects && otherProjects.length > 0 && (
                <section className="border-t border-white/10 py-24 md:py-32 bg-zinc-950">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                        <div className="flex items-end justify-between mb-16 md:mb-24">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-[0.9]">
                                Next Case<br />Studies
                            </h2>
                            <Link
                                href="/#projects"
                                className="hidden md:flex items-center gap-2 text-white/60 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
                            >
                                View All Projects <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            {otherProjects.map((p) => (
                                <Link
                                    key={p.id}
                                    href={`/projects/${p.slug}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-white/5">
                                        {p.featured_image && (
                                            <img
                                                src={p.featured_image}
                                                alt={p.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                                    </div>

                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                                {p.title}
                                            </h3>
                                            <span className="text-white/50 text-sm uppercase tracking-widest">
                                                {p.category}
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-accent group-hover:text-black group-hover:border-transparent transition-all">
                                            <ArrowUpRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <Footer />
        </main>
    );
}
