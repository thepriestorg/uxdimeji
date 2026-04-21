"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDownRight } from "lucide-react";

export default function Hero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={containerRef} className="layout-gutter relative flex min-h-screen flex-col justify-end overflow-hidden pt-0 pb-12 md:pt-0 md:pb-20">

            {/* Background Elements */}
            <div className="pointer-events-none absolute top-0 right-0 h-[80vw] w-[80vw] rounded-full bg-accent/10 blur-[150px] mix-blend-screen md:h-[min(42vw,760px)] md:w-[min(42vw,760px)]" />

            <motion.div style={{ y, opacity }} className="layout-shell relative z-10">
                {/* Top Meta Line */}
                <div className="mb-4 grid grid-cols-1 gap-4 border-b border-white/10 pb-4 md:mb-8 md:grid-cols-[auto,minmax(220px,360px)] md:items-end md:justify-between md:gap-8">
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs md:text-sm font-mono text-accent tracking-widest uppercase"
                    >
             // Product Designer & Vibe Coder <br /> Based in Nigeria
                    </motion.span>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-right hidden md:block"
                    >
                        <p className="text-xs text-secondary max-w-[200px] leading-relaxed">
                            Crafting digital experiences that bridge the gap between complex logic and human intuition.
                        </p>
                    </motion.div>
                </div>

                {/* Massive Headline */}
                <div className="flex flex-col gap-0 select-none">
                    <div className="overflow-hidden">
                        <motion.h1
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
                            className="text-[clamp(4.5rem,14vw,18rem)] leading-[0.82] font-bold text-white tracking-tighter mix-blend-difference"
                        >
                            OLADIMEJI
                        </motion.h1>
                    </div>
                    <div className="overflow-hidden flex items-center gap-4 md:gap-12">
                        <motion.h1
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
                            className="text-[clamp(4.5rem,14vw,18rem)] leading-[0.82] font-bold text-transparent text-stroke tracking-tighter"
                        >
                            ABUBAKAR
                        </motion.h1>
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="hidden md:flex items-center justify-center rounded-full bg-accent text-black h-[clamp(4rem,7vw,8.5rem)] w-[clamp(4rem,7vw,8.5rem)]"
                        >
                            <ArrowDownRight className="w-1/2 h-1/2" />
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="mt-12 flex flex-col md:flex-row gap-8 items-start md:items-end md:justify-between"
                >
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-secondary uppercase tracking-widest">Current Status</span>
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-white font-medium">Available for new projects</span>
                        </div>
                    </div>

                    <a href="mailto:oladimejiuiux@gmail.com" className="group flex items-center gap-4 text-xl md:text-2xl text-white font-heading font-medium hover:text-accent transition-colors">
                        Start a Collaboration
                        <span className="block h-[1px] w-12 bg-white group-hover:w-24 group-hover:bg-accent transition-all duration-300" />
                    </a>
                </motion.div>
            </motion.div>
        </section>
    );
}
