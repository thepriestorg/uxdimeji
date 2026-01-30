"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Contact() {
    return (
        <section className="min-h-screen flex flex-col items-center justify-center bg-accent text-black relative z-40 overflow-hidden">

            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
            </div>

            <div className="max-w-7xl w-full px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
                <div className="md:col-span-12 text-center">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="font-mono text-black/60 text-sm tracking-[0.2em] mb-6 block uppercase"
                    >
                        Chapter 07
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-[15vw] md:text-[12vw] font-serif italic leading-[0.8] mb-12 tracking-tighter"
                    >
                        What's Next?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-xl md:text-3xl font-medium max-w-2xl mx-auto leading-relaxed mb-12"
                    >
                        I’ve spent 5 years <span className="text-black font-bold">designing products</span> that scale. Now, I’m looking for a challenge that redefines the standard.
                        <br /><br />
                        <span className="font-serif italic text-black">Are you ready to be Chapter 07?</span>
                    </motion.p>

                    <motion.a
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        href="mailto:oladimejiuiux@gmail.com"
                        className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white rounded-full font-sans font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Start Conversation <ArrowUpRight className="w-5 h-5" />
                    </motion.a>
                </div>
            </div>
        </section>
    );
}
