"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { X, Menu } from "lucide-react";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    const menuVariants = {
        closed: { opacity: 0, y: "-100%" },
        open: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] as const } }
    };

    return (
        <>
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-8 backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl relative z-50">
                    <Link href="/" className="font-heading font-bold text-xl tracking-tight hover:text-white transition-colors">
                        OA<span className="text-accent">.</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <Link href="/#projects" className="relative px-4 py-2 text-sm text-secondary hover:text-white transition-colors group">
                            Work
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300" />
                        </Link>
                        {["About", "Contact"].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                className="relative px-4 py-2 text-sm text-secondary hover:text-white transition-colors group"
                            >
                                {item}
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-accent group-hover:w-full transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] text-secondary uppercase tracking-widest">Local</span>
                            <span className="text-xs font-mono text-white">{currentTime} NG</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    </div>

                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white">
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="fixed inset-0 bg-black z-40 flex flex-col justify-center items-center gap-8"
                    >
                        {/* Mobile Menu Content */}
                        <Link
                            href="/#projects"
                            onClick={() => setIsOpen(false)}
                            className="text-5xl font-heading font-bold text-white hover:text-accent transition-colors"
                        >
                            Work
                        </Link>
                        {["About", "Contact"].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase()}`}
                                onClick={() => setIsOpen(false)}
                                className="text-5xl font-heading font-bold text-white hover:text-accent transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="absolute bottom-10 flex flex-col items-center">
                            <span className="text-secondary text-sm mb-2">Local Time</span>
                            <span className="font-mono text-xl text-white">{currentTime} NG</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
