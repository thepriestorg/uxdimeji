"use client";

import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
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
].reverse(); // Reverse story array for logical timeline flow

// (Old chapter component removed)

export default function About() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
    const borderRadius = useTransform(scrollYProgress, [0, 1], [0, 40]);

    return (
        <section ref={containerRef} id="about" className="relative z-20 bg-black text-white">

            {/* Profile Intro - Simple clean scroll approach */}
            <div className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6">
                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Label */}
                    <div className="md:col-span-3 lg:col-span-4">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="block font-mono text-accent text-[11px] tracking-[0.2em] uppercase sticky top-32"
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
                                className="text-4xl md:text-6xl lg:text-7xl font-light tracking-[-0.02em] text-white leading-[1.1] mb-4"
                            >
                                I don't just design interfaces. <br />
                                <span className="text-white/40">I engineer clarity.</span>
                            </motion.h2>
                        </div>

                        {/* Bio paragraphs */}
                        <div className="w-full">
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                viewport={{ once: true }}
                                className="text-xl md:text-2xl text-white/80 leading-[1.6] font-light max-w-2xl mb-8"
                            >
                                I'm <span className="text-white font-medium">Oladimeji Abubakar</span>, a Product Designer with 5 years of experience crafting intuitive and scalable digital products.
                            </motion.p>
                            
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                viewport={{ once: true }}
                                className="text-xl md:text-2xl text-white/80 leading-[1.6] font-light max-w-2xl"
                            >
                                Backed by a <span className="text-white font-medium">First Class degree in Computer Science</span>, I design with structure, clarity, and intent, bridging user needs and business goals through thoughtful interfaces.
                            </motion.p>
                        </div>
                    </div>

                </div>
            </div>

            {/* The Chapters - Editorial Storytelling Flow */}
            <div className="relative border-t border-white/5 bg-[#050505]">
                <div className="max-w-4xl mx-auto px-6 py-32 md:py-48 flex flex-col gap-32 md:gap-48">
                    {storyChapters.map((chapter, i) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-15%" }}
                            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
                            key={i} 
                            className="relative"
                        >
                            {/* Date Marker */}
                            <div className="flex items-center gap-4 mb-8">
                                <span className="w-8 h-[1px] bg-accent/50" />
                                <span className="font-mono text-accent text-sm tracking-widest">{chapter.period}</span>
                            </div>
                            
                            {/* Company & Role */}
                            <div className="mb-6">
                                <h3 className="text-3xl md:text-5xl text-white font-medium tracking-tight mb-2">
                                    {chapter.company}
                                </h3>
                                <p className="text-white/40 font-mono text-xs uppercase tracking-[0.2em]">
                                    {chapter.role}
                                </p>
                            </div>

                            {/* The Narrative (Large & elegant) */}
                            <p className="text-2xl md:text-4xl text-white/90 leading-[1.4] font-light mb-10 tracking-tight">
                                {chapter.narrative}
                            </p>

                            {/* Tags */}
                            <div className="flex items-center gap-3">
                                <span className="px-5 py-2.5 rounded-full border border-white/10 text-white/60 text-xs font-mono uppercase tracking-widest bg-white/5">
                                    {chapter.highlight}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </section >
    );
}
