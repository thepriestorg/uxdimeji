"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const storyChapters = [
    {
        title: "THE INITIATE",
        role: "Intern",
        company: "LeftLane",
        period: "Jun 2022 — Dec 2022",
        narrative: "Cut my teeth on consumer products where every pixel is scrutinized. I learned that in the B2C world, speed matters, but the user experience matters more.",
        highlight: "Consumer Tech"
    },
    {
        title: "THE ARCHITECT",
        role: "Contract Designer",
        company: "Alta Inc",
        period: "Nov 2022 — Jan 2023",
        narrative: "Democratizing development. I worked on a no-code mobile app builder that empowers creators to launch products without writing code. Transforming complex logic into an intuitive visual interface.",
        highlight: "No-Code SaaS"
    },
    {
        title: "THE SOCIALITE",
        role: "Contract Designer",
        company: "TheClub",
        period: "Jan 2023 — Aug 2023",
        narrative: "Rhythm and connection. I designed a specialized social platform for DJs to stream live sets, connect with fans, and grow their community digitally.",
        highlight: "Social Streaming"
    },
    {
        title: "THE MECHANIC",
        role: "Contract Designer",
        company: "RoomService",
        period: "Nov 2023 — Feb 2024",
        narrative: "Culinary commerce. I focused on optimizing the food delivery experience, streamlining the user journey from discovery to checkout to maximize conversion.",
        highlight: "Food E-commerce"
    },
    {
        title: "THE NAVIGATOR",
        role: "Contract Designer",
        company: "LoopWise",
        period: "Mar 2025 — Jun 2025",
        narrative: "Freight at your fingertips. I designed the mobile experience for shippers and carriers, streamlining complex logistics—from trucking to air cargo—into a seamless tracking and booking flow.",
        highlight: "Logistics Mobile App"
    },
    {
        title: "THE BUILDER",
        role: "Product Designer × Vibe Coder",
        company: "Vibe Coding",
        period: "2025 — Present",
        narrative: "A product designer with a builder mindset. I leverage AI to go from idea to shipped product — designing, prompting, and building full applications myself. No handoffs, no waiting. Just a designer who refuses to stop at mockups.",
        highlight: "AI-Powered Building"
    },
    {
        title: "THE VISIONARY",
        role: "Product Designer",
        company: "Elevayt",
        period: "Jan 2026 — Present",
        narrative: "Elevating the standard. Currently partnering with government bodies to revolutionize education systems. Building the digital infrastructure that will power the next generation of learning.",
        highlight: "GovTech & Edu"
    }
];

/* ─────────────────────────────────────────────
   Light Experience Story Chapter
   ───────────────────────────────────────────── */

function StoryChapter({ chapter, index }: { chapter: typeof storyChapters[0]; index: number }) {
    const isPresent = chapter.period.includes("Present");
    const chapterRef = useRef(null);

    return (
        <motion.div
            ref={chapterRef}
            className="relative py-20 md:py-32"
        >
            <div className="layout-shell layout-gutter">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-12">

                    {/* Left — Chapter number + period */}
                    <div className="md:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="md:sticky md:top-32"
                        >
                            <span className="mb-3 block font-mono text-[80px] font-bold leading-none text-black/[0.04] md:text-[120px]">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-black/30">
                                {chapter.period}
                            </span>
                            {isPresent && (
                                <span className="mt-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-600">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    </span>
                                    Current
                                </span>
                            )}
                        </motion.div>
                    </div>

                    {/* Right — Story content */}
                    <div className="md:col-span-9 lg:col-span-8">
                        <motion.h3
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mb-3 font-serif text-4xl italic text-black md:text-6xl lg:text-7xl"
                        >
                            {chapter.title}
                        </motion.h3>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mb-8 text-sm font-medium text-accent"
                        >
                            {chapter.role} <span className="text-accent/30">—</span> {chapter.company}
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="mb-8 max-w-2xl text-xl leading-[1.65] font-light text-black/55 md:text-2xl lg:text-3xl"
                        >
                            {chapter.narrative}
                        </motion.p>

                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                            className="inline-block rounded-full bg-black/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black/30"
                        >
                            {chapter.highlight}
                        </motion.span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface AboutProps {
    variant?: "dark" | "light";
}

export default function About({ variant = "dark" }: AboutProps) {
    const isLight = variant === "light";
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 40]);

    return (
        <section ref={containerRef} id="about" className={cn("relative z-20", isLight ? "bg-white text-black" : "bg-black text-white")}>

            {/* ── Profile Intro ──────────────────────── */}
            <div className={cn("layout-gutter relative pt-32 pb-24 md:pt-48 md:pb-32", isLight && "border-t border-black/[0.06]")}>
                <div className="layout-shell grid w-full grid-cols-1 items-start gap-12 md:grid-cols-12">
                    
                    {/* Left: Label */}
                    <div className="md:col-span-3 lg:col-span-4">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className={cn(
                                "block font-mono text-accent text-[11px] tracking-[0.2em] uppercase sticky top-32",
                                isLight && "text-accent/80"
                            )}
                        >
                            (002) <br className="hidden md:block my-2" /> Profile
                        </motion.span>
                    </div>

                    {/* Right: Content */}
                    <div className="md:col-span-9 lg:col-span-8 flex flex-col gap-12 md:gap-20">
                        {/* Headline */}
                        <div className="max-w-3xl">
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "text-4xl md:text-6xl lg:text-7xl font-light tracking-normal leading-[1.1] mb-4",
                                    isLight ? "text-black" : "text-white"
                                )}
                            >
                                I don't just design interfaces. <br />
                                <span className={isLight ? "text-black/40" : "text-white/40"}>I engineer clarity.</span>
                            </motion.h2>
                        </div>

                        {/* Bio paragraphs */}
                        <div className="w-full">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "text-xl md:text-2xl leading-[1.6] font-light max-w-2xl mb-8",
                                    isLight ? "text-black/70" : "text-white/80"
                                )}
                            >
                                I'm <span className={cn("font-medium", isLight ? "text-black" : "text-white")}>Oladimeji Abubakar</span>, a Product Designer with 5 years of experience crafting intuitive and scalable digital products.
                            </motion.p>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "text-xl md:text-2xl leading-[1.6] font-light max-w-2xl",
                                    isLight ? "text-black/70" : "text-white/80"
                                )}
                            >
                                Backed by a <span className={cn("font-medium", isLight ? "text-black" : "text-white")}>First Class degree in Computer Science</span>, I design with structure, clarity, and intent, bridging user needs and business goals through thoughtful interfaces.
                            </motion.p>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── Experience Section ──────────────────── */}
            {isLight ? (
                /* ── LIGHT: Story-driven scroll experience ─── */
                <div className="relative bg-white">
                    {/* Section intro */}
                    <div className="layout-gutter py-20 md:py-32">
                        <div className="layout-shell">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="max-w-3xl"
                            >
                                <span className="mb-5 block font-mono text-[11px] uppercase tracking-[0.25em] text-accent/70">
                                    The Journey
                                </span>
                                <h2 className="text-5xl font-light leading-[1.05] tracking-tight text-black md:text-7xl lg:text-8xl">
                                    Every chapter shaped
                                    <span className="block font-serif italic text-black/25">a sharper perspective.</span>
                                </h2>
                            </motion.div>
                        </div>
                    </div>

                    {/* Story chapters — each one reveals like a page turn */}
                    <div className="relative">
                        {storyChapters.map((chapter, i) => (
                            <div key={i}>
                                {/* Subtle divider */}
                                <div className="layout-gutter">
                                    <div className="layout-shell">
                                        <motion.div
                                            initial={{ scaleX: 0 }}
                                            whileInView={{ scaleX: 1 }}
                                            viewport={{ once: true, margin: "-10%" }}
                                            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                                            className="h-px w-full origin-left bg-black/[0.06]"
                                        />
                                    </div>
                                </div>
                                <StoryChapter chapter={chapter} index={i} />
                            </div>
                        ))}

                        {/* Final divider */}
                        <div className="layout-gutter">
                            <div className="layout-shell">
                                <div className="h-px w-full bg-black/[0.06]" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── DARK: Original stacking chapters ──── */
                <div className="relative border-t border-white/5 bg-[#050505]">
                    <div className="w-full flex flex-col relative">
                        {storyChapters.map((chapter, i) => (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-15%" }}
                                transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                                key={i} 
                                className="layout-gutter sticky top-0 flex h-[100dvh] w-full flex-col justify-center overflow-hidden py-24 border-t border-white/5 bg-[#050505] shadow-2xl"
                                style={{ zIndex: i }}
                            >
                                <div className="max-w-4xl mx-auto w-full">
                                    {/* Chapter Header */}
                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        <span className="font-mono text-accent text-[13px] tracking-[0.2em] uppercase font-bold">
                                            CHAPTER 0{i + 1}
                                        </span>
                                        <span className="w-8 h-[1px] bg-white/20" />
                                        <span className="font-mono text-[13px] tracking-widest uppercase text-white/50">
                                            {chapter.period}
                                        </span>
                                    </div>
                                    
                                    {/* Chapter Title & Role */}
                                    <div className="mb-8">
                                        <h3 className="text-4xl font-serif italic mb-4 text-white md:text-6xl">
                                            {chapter.title}
                                        </h3>
                                        <p className="font-mono text-sm uppercase tracking-[0.15em] text-white/70">
                                            {chapter.role} <span className="mx-2 text-accent/50">—</span> {chapter.company}
                                        </p>
                                    </div>

                                    {/* The Narrative */}
                                    <p className="text-2xl leading-[1.35] font-light mb-10 tracking-normal text-white/90 md:text-4xl">
                                        {chapter.narrative}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex items-center gap-3">
                                        <span className="px-5 py-2.5 rounded-full border border-white/10 text-xs font-mono uppercase tracking-widest text-white/60 bg-white/5">
                                            {chapter.highlight}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

        </section>
    );
}
