"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const works = [
    {
        name: "Dap Dashboard",
        type: "Web App",
        color: "from-blue-600 to-cyan-400",
        shadow: "shadow-[0_0_80px_rgba(59,130,246,0.3)]",
        rotate: -1
    },
    {
        name: "The Viral Tool",
        type: "Platform",
        color: "from-purple-600 to-pink-500",
        shadow: "shadow-[0_0_80px_rgba(168,85,247,0.3)]",
        rotate: 1
    },
    {
        name: "SaaS Analytics",
        type: "Dashboard",
        color: "from-orange-500 to-yellow-400",
        shadow: "shadow-[0_0_80px_rgba(249,115,22,0.3)]",
        rotate: -1
    }
];

export default function DevWork() {
    return (
        <section id="work" className="py-24 md:py-40 w-full relative z-10">
            <div className="max-w-6xl mx-auto px-6">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20 md:mb-32"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                        Things I've built
                    </h2>
                </motion.div>

                <div className="flex flex-col gap-16 md:gap-32">
                    {works.map((work, i) => (
                        <motion.div
                            key={work.name}
                            initial={{ opacity: 0, y: 60, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                            whileHover={{ scale: 1.02, rotate: 0 }}
                            className="relative group cursor-pointer"
                        >
                            {/* Gradient Border/Glow Wrap */}
                            <div
                                className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-br ${work.color} opacity-40 blur-xl group-hover:opacity-60 transition-opacity duration-500`}
                            />

                            <div
                                className="relative w-full rounded-[2.5rem] p-[2px] overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)`
                                }}
                            >
                                {/* The Card Inside */}
                                <div className="bg-[#080808] w-full min-h-[400px] md:min-h-[500px] rounded-[2.45rem] p-8 md:p-14 flex flex-col justify-between relative overflow-hidden backdrop-blur-3xl">

                                    {/* Soft interior glow */}
                                    <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br ${work.color} blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />

                                    <div className="relative z-10">
                                        <span className="px-5 py-2.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md border border-white/10">
                                            {work.type}
                                        </span>
                                    </div>

                                    <div className="relative z-10 mt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                                        <h3 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
                                            {work.name}
                                        </h3>
                                        <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center transform group-hover:rotate-45 group-hover:scale-110 transition-all duration-300 shadow-xl shrink-0">
                                            <ArrowUpRight className="w-8 h-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
