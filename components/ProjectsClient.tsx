"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

// Mobile project card with intersection observer
function MobileProjectCard({ project, index }: { project: Project; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false); // Optional: toggle off if scrolled past
                }
            },
            {
                threshold: 0.1, // Trigger as soon as 10% visible
                rootMargin: "-10% 0px -10% 0px" // Shrink viewport slightly so it triggers when well inside
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <Link href={`/projects/${project.slug}`} className="block md:hidden">
            <div
                ref={ref}
                className={cn(
                    "relative overflow-hidden rounded-2xl transition-all duration-700 ease-out transform",
                    isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
                )}
            >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                    <img
                        src={project.featured_image}
                        alt={project.title}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-1000 ease-out",
                            isVisible ? "grayscale-0 scale-100" : "grayscale scale-110"
                        )}
                    />
                    {/* Color Overlay */}
                    <div className={cn(
                        "absolute inset-0 transition-opacity duration-500",
                        project.color,
                        isVisible ? "opacity-30" : "opacity-60"
                    )} />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Top Number */}
                <div className="absolute top-6 left-6 z-10">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white font-bold text-sm">
                        {String(index + 1).padStart(2, '0')}
                    </div>
                </div>

                {/* Top Right Arrow */}
                <div className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black">
                    <ArrowUpRight className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        {project.title}
                    </h3>
                    <span className="text-white/80 text-sm font-serif italic">
                        {project.category}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function ProjectsClient({ projects, vibeProjects = [] }: ProjectsClientProps) {
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<"design" | "vibe">("design");

    if (!projects || projects.length === 0) {
        return null;
    }

    return (
        <section className="relative bg-background py-24 md:py-32 z-30 overflow-hidden">
            {/* Dedicated scroll anchor */}
            <span id="projects" className="absolute -top-24 left-0 w-full h-0 opacity-0 pointer-events-none" />

            <div className="max-w-[1800px] mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <motion.span
                            className="block font-serif italic text-2xl md:text-5xl text-white/50 mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            Still not convinced?
                        </motion.span>
                        <motion.h2
                            className="text-[12vw] md:text-8xl font-bold text-white leading-[0.8] tracking-tighter uppercase"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            See the Proof.
                        </motion.h2>
                    </div>

                    {/* Tab Switcher */}
                    <motion.div
                        className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 self-start md:self-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <button
                            onClick={() => setActiveTab("design")}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer",
                                activeTab === "design"
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:text-white"
                            )}
                        >
                            Design Work
                        </button>
                        <button
                            onClick={() => setActiveTab("vibe")}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 cursor-pointer",
                                activeTab === "vibe"
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:text-white"
                            )}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Vibe Coded
                        </button>
                    </motion.div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "design" ? (
                        <motion.div
                            key="design"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Mobile: Stacked Cards */}
                            <div className="md:hidden flex flex-col gap-6">
                                {projects.map((project, index) => (
                                    <MobileProjectCard key={project.id} project={project} index={index} />
                                ))}
                            </div>

                            {/* Desktop: The Accordion */}
                            <div className="hidden md:flex flex-row gap-2 h-[80vh] w-full">
                    {projects.map((project, index) => {
                        const isActive = activeIndex === index;

                        return (
                            <Link href={`/projects/${project.slug}`} key={project.id} className="contents">
                                <motion.div
                                    className={cn(
                                        "relative cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden rounded-3xl h-full",
                                        isActive ? "flex-[4]" : "flex-1"
                                    )}
                                    onMouseEnter={() => setActiveIndex(index)}
                                >
                                    {/* Background Image (Standard/Collapsed) + Blur Fill (Expanded) */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        {/* Blur Backdrop for Active State */}
                                        <div className={cn(
                                            "absolute inset-0 transition-opacity duration-700",
                                            isActive ? "opacity-100" : "opacity-0"
                                        )}>
                                            <img
                                                src={project.featured_image}
                                                alt=""
                                                className="w-full h-full object-cover blur-2xl scale-110 brightness-50"
                                            />
                                        </div>

                                        {/* Main Image */}
                                        <img
                                            src={project.featured_image}
                                            alt={project.title}
                                            className={cn(
                                                "relative w-full h-full transition-all duration-700 ease-out",
                                                isActive
                                                    ? "object-contain grayscale-0 scale-100 drop-shadow-2xl"
                                                    : "object-cover grayscale scale-110 opacity-60 group-hover:opacity-100"
                                            )}
                                        />
                                    </div>

                                    {/* Color Overlay */}
                                    <div className={cn(
                                        "absolute inset-0 transition-opacity duration-500",
                                        project.color,
                                        isActive ? "opacity-40" : "opacity-70"
                                    )} />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className="relative h-full p-8 flex flex-col">

                                        {/* Top: ID / Arrow */}
                                        <div className="flex justify-between items-start mb-auto">
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white font-bold text-sm z-10">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <motion.div
                                                animate={{
                                                    scale: isActive ? 1 : 0.8,
                                                    opacity: isActive ? 1 : 0,
                                                }}
                                                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black z-10"
                                            >
                                                <ArrowUpRight className="w-5 h-5" />
                                            </motion.div>
                                        </div>

                                        {/* Bottom: Info */}
                                        <div className="relative h-full flex flex-col justify-end">

                                            {/* 1. COLLAPSED VERTICAL TITLE (Desktop) */}
                                            <div className={cn(
                                                "absolute bottom-0 left-0 origin-bottom-left -rotate-90 translate-x-12 translate-y-0 whitespace-nowrap transition-all duration-500",
                                                isActive ? "opacity-0 invisible translate-y-4" : "opacity-100 visible"
                                            )}>
                                                <span className="text-3xl font-black text-white uppercase tracking-widest">
                                                    {project.title}
                                                </span>
                                            </div>

                                            {/* 2. EXPANDED CONTENT (Desktop) */}
                                            <div className={cn(
                                                "transition-all duration-500 delay-100 flex flex-col gap-4",
                                                isActive
                                                    ? "opacity-100 translate-y-0"
                                                    : "opacity-0 translate-y-8 absolute bottom-0 left-0 right-0 pointer-events-none"
                                            )}>
                                                <div>
                                                    <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                                        {project.title}
                                                    </h3>
                                                    <span className="text-white/80 text-lg font-serif italic block mb-6">
                                                        {project.category}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-white font-bold group/btn w-fit">
                                                    <span className="border-b border-white group-hover/btn:border-accent transition-colors">View Case Study</span>
                                                    <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="vibe"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Bento Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                {vibeProjects.map((project, index) => (
                                    <motion.div
                                        key={project.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.08, duration: 0.5 }}
                                        className={cn(
                                            project.span === "large" && "md:col-span-2"
                                        )}
                                    >
                                        {project.url ? (
                                            <a
                                                href={project.url}
                                                target={project.url.startsWith('/') ? undefined : "_blank"}
                                                rel={project.url.startsWith('/') ? undefined : "noopener noreferrer"}
                                                className="block"
                                            >
                                                <VibeBentoCard project={project} index={index} />
                                            </a>
                                        ) : (
                                            <VibeBentoCard project={project} index={index} />
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Bottom */}
                            <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <p className="text-white/30 text-sm font-mono">
                                    More shipping soon — the backlog never sleeps.
                                </p>
                                <div className="flex items-center gap-2 text-white/20 text-xs font-mono">
                                    <Sparkles className="w-3 h-3" />
                                    Built with AI as my engineering partner
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

/* ── Vibe Bento Card with browser mockup + 3D tilt ── */

function VibeBentoCard({ project, index }: { project: VibeProject; index: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const isLarge = project.span === "large";

    // Detect touch device — disable 3D tilt for mobile
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }, []);

    // 3D tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 20 });
    const springY = useSpring(y, { stiffness: 200, damping: 20 });
    const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-6, 6]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current || isTouchDevice) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={isTouchDevice ? {} : { rotateX, rotateY, transformPerspective: 800 }}
            className="group relative rounded-2xl overflow-hidden cursor-pointer will-change-transform"
        >
            {/* Background glow on hover */}
            <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                style={{
                    background: `linear-gradient(135deg, ${project.accent}30, transparent 60%)`,
                }}
            />

            <div className="relative z-10 rounded-2xl overflow-hidden bg-[#111113] border border-white/[0.06] group-hover:border-white/[0.12] transition-colors duration-500">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1D] border-b border-white/[0.04]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="flex-1 mx-3">
                        <div className="bg-[#0D0D0F] rounded-md px-3 py-1 text-[10px] text-white/20 font-mono truncate">
                            {project.url || `${project.title.toLowerCase().replace(/\s+/g, '-')}.app`}
                        </div>
                    </div>
                    <div className="text-white/20 group-hover:text-white/40 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                </div>

                {/* Screenshot area */}
                <div className={cn(
                    "relative overflow-hidden",
                    isLarge ? "aspect-[16/10] md:aspect-[2.4/1]" : "aspect-[16/10] md:aspect-[4/3]"
                )}>
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                    {/* Fallback gradient for missing images */}
                    <div
                        className="absolute inset-0 -z-10"
                        style={{
                            background: `linear-gradient(135deg, ${project.accent}15, ${project.accent}05 50%, transparent)`,
                        }}
                    />
                    {/* Bottom gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/20 to-transparent" />

                    {/* Hover overlay with accent color */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-soft-light"
                        style={{ background: project.accent }}
                    />
                </div>

                {/* Content bar */}
                <div className={cn(
                    "p-5 md:p-6",
                    isLarge && "md:flex md:items-end md:justify-between md:gap-8"
                )}>
                    <div className={cn(isLarge && "md:flex-1")}>
                        {/* Title row */}
                        <div className="flex items-center gap-2.5 mb-2">
                            <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight group-hover:text-white transition-colors">
                                {project.title}
                            </h3>
                            <span className={cn(
                                "text-[9px] font-mono uppercase tracking-[0.15em] px-2.5 py-1 rounded-full",
                                project.status === "Live"
                                    ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/15"
                                    : "text-amber-400 bg-amber-400/10 border border-amber-400/15"
                            )}>
                                {project.status === "Live" ? "● Live" : "◐ WIP"}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-white/40 text-sm leading-relaxed mb-4 max-w-lg">
                            {project.description}
                        </p>
                    </div>

                    {/* Tags + Arrow */}
                    <div className={cn(
                        "flex items-center justify-between gap-3",
                        isLarge && "md:shrink-0"
                    )}>
                        <div className="flex flex-wrap gap-1.5">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2.5 py-1 text-[10px] font-mono text-white/25 bg-white/[0.03] rounded-md group-hover:text-white/35 group-hover:bg-white/[0.05] transition-all duration-300"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 group-hover:scale-110"
                            style={{
                                borderColor: `${project.accent}30`,
                                color: `${project.accent}80`,
                            }}
                        >
                            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
