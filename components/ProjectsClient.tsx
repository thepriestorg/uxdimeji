"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

export interface VibeProject {
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
}

interface ProjectsClientProps {
    projects: Project[];
    vibeProjects?: VibeProject[];
}

function DesignShowcaseCard({
    project,
    index,
    large = false,
}: {
    project: Project;
    index: number;
    large?: boolean;
}) {
    if (large) {
        return (
            <Link href={`/projects/${project.slug}`} className="group block h-full">
                <article className="h-full rounded-[1.75rem] border border-white/10 bg-[#0D0D11] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/25 md:p-6">
                    <div className="flex items-center justify-between">
                        <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-white/90">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:rotate-45">
                            <ArrowUpRight className="h-4 w-4" />
                        </span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/75 uppercase">
                            {project.category}
                        </span>
                        <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/75 uppercase">
                            {project.year}
                        </span>
                    </div>

                    <h3 className="mt-3 text-4xl font-black uppercase leading-[0.86] tracking-tight text-white md:text-5xl">
                        {project.title}
                    </h3>

                    <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                        <img
                            src={project.featured_image}
                            alt={project.title}
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                        />
                        <div className={cn("pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light", project.color)} />
                    </div>

                    <p className="mt-4 text-sm font-medium text-white/80">
                        View case study
                    </p>
                </article>
            </Link>
        );
    }

    return (
        <Link href={`/projects/${project.slug}`} className="group block h-full">
            <article
                className={cn(
                    "h-full rounded-[1.65rem] border border-white/10 bg-[#0D0D11] p-4 transition-all duration-500 hover:-translate-y-1 hover:border-white/25 md:p-5"
                )}
            >
                <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/20 bg-black/35 px-3 py-1 font-mono text-[11px] tracking-[0.18em] text-white/90">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform duration-300 group-hover:rotate-45">
                        <ArrowUpRight className="h-4 w-4" />
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/75 uppercase">
                        {project.category}
                    </span>
                    <span className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/75 uppercase">
                        {project.year}
                    </span>
                </div>

                <h3 className="mt-3 text-3xl font-black uppercase leading-[0.88] tracking-tight text-white md:text-4xl">
                    {project.title}
                </h3>

                <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <img
                        src={project.featured_image}
                        alt={project.title}
                        className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                    />
                    <div className={cn("pointer-events-none absolute inset-0 opacity-15 mix-blend-soft-light", project.color)} />
                </div>

                <p className="mt-3 text-sm font-medium text-white/80">
                    View case study
                </p>
            </article>
        </Link>
    );
}

function VibeStripCard({ project, index }: { project: VibeProject; index: number }) {
    const urlPreview = project.url || `${project.title.toLowerCase().replace(/\s+/g, "-")}.app`;

    return (
        <article className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0E0E12] transition-all duration-500 hover:border-white/20">
            <div
                className="pointer-events-none absolute -right-16 top-[-20%] h-52 w-52 rounded-full blur-3xl"
                style={{ background: project.accent, opacity: 0.25 }}
            />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12">
                <div className="border-b border-white/10 p-6 md:col-span-7 md:border-b-0 md:border-r md:border-white/10 md:p-7">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/60">
                            {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                            className={cn(
                                "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                                project.status === "Live"
                                    ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-200"
                                    : "border-amber-300/35 bg-amber-300/10 text-amber-100"
                            )}
                        >
                            {project.status}
                        </span>
                        <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[10px] text-white/55 truncate max-w-[170px]">
                            {urlPreview}
                        </span>
                    </div>

                    <h3 className="text-4xl font-black uppercase leading-[0.86] tracking-[-0.02em] text-white md:text-5xl">
                        {project.title}
                    </h3>

                    <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65 md:text-base">
                        {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/55"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative min-h-[220px] md:col-span-5 md:min-h-[260px]">
                    <img
                        src={project.image}
                        alt={project.title}
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E12] via-transparent to-transparent md:bg-gradient-to-l" />

                    <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/30 p-2 text-white/80">
                        <ExternalLink className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function ProjectsClient({ projects, vibeProjects = [] }: ProjectsClientProps) {
    const hasDesignProjects = projects.length > 0;
    const hasVibeProjects = vibeProjects.length > 0;
    const designCount = projects.length;
    const vibeCount = vibeProjects.length;
    const [activeTab, setActiveTab] = useState<"design" | "vibe">(
        hasDesignProjects ? "design" : "vibe"
    );

    useEffect(() => {
        if (activeTab === "design" && !hasDesignProjects && hasVibeProjects) {
            setActiveTab("vibe");
        }
        if (activeTab === "vibe" && !hasVibeProjects && hasDesignProjects) {
            setActiveTab("design");
        }
    }, [activeTab, hasDesignProjects, hasVibeProjects]);

    if (!hasDesignProjects && !hasVibeProjects) {
        return null;
    }

    return (
        <section className="relative z-30 overflow-hidden border-t border-white/5 bg-background py-16 md:py-24">
            <span id="projects" className="absolute -top-24 left-0 h-0 w-full opacity-0 pointer-events-none" />

            <div className="pointer-events-none absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-120px] right-[-8%] h-80 w-80 rounded-full bg-cyan-400/10 blur-[150px]" />

            <div className="relative mx-auto max-w-[1700px] px-4 md:px-10">
                <div className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl">
                        <motion.span
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-4 block font-mono text-xs uppercase tracking-[0.22em] text-accent"
                        >
                            (002) - SELECTED PROJECTS
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            viewport={{ once: true }}
                            className="text-5xl font-black uppercase leading-[0.85] tracking-[-0.04em] text-white md:text-8xl"
                        >
                            Proof of
                            <span className="block text-transparent text-stroke">Execution</span>
                        </motion.h2>
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                        <p className="max-w-md border-l border-white/20 pl-4 text-sm leading-relaxed text-white/65 md:text-base">
                            Real shipped work, from high-polish product design to AI-assisted builds pushed live fast.
                        </p>

                        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.03] p-1.5 backdrop-blur">
                            <div className="grid grid-cols-2 gap-1">
                                <button
                                    onClick={() => setActiveTab("design")}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                        "disabled:cursor-not-allowed disabled:opacity-40",
                                        activeTab === "design" ? "text-black" : "text-white/75 hover:text-white"
                                    )}
                                    disabled={!hasDesignProjects}
                                >
                                    {activeTab === "design" && (
                                        <motion.span
                                            layoutId="projects-tab-indicator"
                                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                            className="absolute inset-0 -z-10 rounded-xl bg-white"
                                        />
                                    )}
                                    <span className="inline-flex items-center gap-2">
                                        <span>Design Work</span>
                                        <span
                                            className={cn(
                                                "rounded-md px-1.5 py-0.5 text-[10px] font-mono",
                                                activeTab === "design"
                                                    ? "bg-black/10 text-black/65"
                                                    : "bg-white/10 text-white/60"
                                            )}
                                        >
                                            {designCount}
                                        </span>
                                    </span>
                                </button>

                                <button
                                    onClick={() => setActiveTab("vibe")}
                                    className={cn(
                                        "relative cursor-pointer rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                                        "disabled:cursor-not-allowed disabled:opacity-40",
                                        activeTab === "vibe" ? "text-black" : "text-white/75 hover:text-white"
                                    )}
                                    disabled={!hasVibeProjects}
                                >
                                    {activeTab === "vibe" && (
                                        <motion.span
                                            layoutId="projects-tab-indicator"
                                            transition={{ type: "spring", stiffness: 380, damping: 34 }}
                                            className="absolute inset-0 -z-10 rounded-xl bg-white"
                                        />
                                    )}
                                    <span className="inline-flex items-center gap-2">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        <span>Vibe Coded</span>
                                        <span
                                            className={cn(
                                                "rounded-md px-1.5 py-0.5 text-[10px] font-mono",
                                                activeTab === "vibe"
                                                    ? "bg-black/10 text-black/65"
                                                    : "bg-white/10 text-white/60"
                                            )}
                                        >
                                            {vibeCount}
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "design" ? (
                        <motion.div
                            key="design-layout"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            {hasDesignProjects ? (
                                <>
                                    <div className="grid grid-cols-1 gap-4 md:hidden">
                                        {projects.map((project, index) => (
                                            <motion.div
                                                key={project.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-10%" }}
                                                transition={{ duration: 0.45, delay: index * 0.05 }}
                                            >
                                                <DesignShowcaseCard project={project} index={index} />
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="hidden grid-cols-2 gap-5 md:grid">
                                        {projects.map((project, index) => (
                                            <motion.div
                                                key={project.id}
                                                className={cn(index % 3 === 0 && "md:col-span-2")}
                                                initial={{ opacity: 0, y: 24 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true, margin: "-8%" }}
                                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                            >
                                                <DesignShowcaseCard
                                                    project={project}
                                                    index={index}
                                                    large={index % 3 === 0}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                                    Design projects will appear here soon.
                                </p>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="vibe-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            {hasVibeProjects ? (
                                <>
                                    <div className="flex flex-col gap-4 md:gap-5">
                                        {vibeProjects.map((project, index) => {
                                            const isExternal = Boolean(
                                                project.url && !project.url.startsWith("/")
                                            );

                                            return (
                                                <motion.div
                                                    key={project.id}
                                                    initial={{ opacity: 0, y: 32 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true, margin: "-10%" }}
                                                    transition={{ duration: 0.45, delay: index * 0.06 }}
                                                >
                                                    {project.url ? (
                                                        <a
                                                            href={project.url}
                                                            target={isExternal ? "_blank" : undefined}
                                                            rel={isExternal ? "noopener noreferrer" : undefined}
                                                            className="block"
                                                        >
                                                            <VibeStripCard project={project} index={index} />
                                                        </a>
                                                    ) : (
                                                        <VibeStripCard project={project} index={index} />
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>

                                    <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
                                        <p className="text-sm text-white/45">
                                            More launches coming. Shipping cadence stays high.
                                        </p>
                                        <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-white/35">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Built with AI as a partner
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/60">
                                    Vibe-coded projects will appear here soon.
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
