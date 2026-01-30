"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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

interface ProjectsClientProps {
    projects: Project[];
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

export default function ProjectsClient({ projects }: ProjectsClientProps) {
    const [activeIndex, setActiveIndex] = useState<number>(0);

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
                </div>

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
            </div>
        </section>
    );
}
