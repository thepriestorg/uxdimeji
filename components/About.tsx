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
        title: "THE CATALYST",
        role: "Product Designer",
        company: "NasDigit",
        period: "Dec 2025 — Present",
        narrative: "Digital transformation at scale. Working on enterprise-grade solutions that require precision, scalability, and robust design systems.",
        highlight: "Enterprise UX"
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

function Chapter({ data, index }: { data: typeof storyChapters[0], index: number }) {
    return (
        <div className="min-h-screen flex items-center justify-center py-20 sticky top-0 bg-background/5 border-t border-white/5 backdrop-blur-3xl overflow-hidden">
            <div className="max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">

                {/* Left: The Title Card */}
                <div className="md:col-span-5 md:text-right relative z-10">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: "-20%" }}
                        transition={{ duration: 0.5 }}
                        className="font-mono text-accent text-sm tracking-[0.2em] mb-4 block"
                    >
                        CHAPTER 0{index + 1}
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: false, margin: "-20%" }}
                        transition={{ duration: 0.6 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.85]"
                    >
                        <span className="block text-transparent text-stroke opacity-20">{data.title.split(" ")[0]}</span>
                        <span className="block text-white mt-[-0.2em] relative z-20">{data.title.split(" ").slice(1).join(" ")}</span>
                    </motion.h2>
                </div>

                {/* Right: The Narrative */}
                <div className="md:col-span-7 md:pl-12">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, margin: "-20%" }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative pl-8 border-l border-accent/30"
                    >
                        <span className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-accent rounded-full shadow-[0_0_10px_#7C3AED]" />

                        <div className="mb-6">
                            <h3 className="text-3xl text-white font-serif italic">{data.company}</h3>
                            <p className="text-white/70 font-mono text-sm mt-1">{data.role} // {data.period}</p>
                        </div>

                        <p className="text-xl md:text-3xl text-white/90 leading-relaxed font-serif mb-8">
                            "{data.narrative}"
                        </p>

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-violet-300 uppercase tracking-widest">
                            {data.highlight}
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}

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

            {/* Profile Intro */}
            <div className="sticky top-0 z-0 min-h-screen flex items-center justify-center py-20 px-6 bg-background">
                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 items-start">

                    {/* Left: Label */}
                    <div className="md:col-span-2">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="block font-mono text-accent text-xs tracking-[0.2em] uppercase sticky top-32"
                        >
                            (002) <br /> Profile
                        </motion.span>
                    </div>

                    {/* Right: Content */}
                    <div className="md:col-span-10 flex flex-col gap-12 md:gap-24">
                        {/* Headline */}
                        <div className="max-w-4xl">
                            <motion.h2
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="text-5xl md:text-8xl font-serif italic text-white leading-[0.9] mb-8"
                            >
                                I don't just design interfaces. <br />
                                <span className="text-white/70 not-italic font-sans font-bold tracking-tighter">I engineer clarity.</span>
                            </motion.h2>
                        </div>

                        {/* Restored Bio */}
                        <div className="max-w-2xl ml-auto border-l border-white/10 pl-8 md:pl-12">
                            <motion.p
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-lg md:text-xl text-white/70 leading-relaxed font-medium"
                            >
                                I’m <span className="text-white">Oladimeji Abubakar</span>, a Product Designer with 5 years of experience crafting intuitive and scalable digital products.
                                <br /><br />
                                Backed by a <span className="text-white">First Class degree in Computer Science</span>, I design with structure, clarity, and intent, bridging user needs and business goals through thoughtful interfaces.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.4 }}
                                className="mt-8 flex items-center gap-4 text-xs font-mono text-accent uppercase tracking-widest"
                            >
                                <span>Scroll to explore the journey</span>
                                <div className="w-12 h-[1px] bg-accent" />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
            {/* Spacer for scroll buffer */}
            <div className="h-[50vh]" />

            {/* The Chapters */}
            <div className="relative z-10">
                {storyChapters.map((chapter, i) => (
                    <Chapter key={i} data={chapter} index={i} />
                ))}
            </div>

            {/* Outro removed - Moved to Contact.tsx */}

        </section >
    );
}
