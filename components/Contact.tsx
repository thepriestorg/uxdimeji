"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Contact() {
    return (
        <section className="min-h-[100dvh] py-24 md:py-32 flex flex-col items-center justify-center bg-accent text-black relative z-40 overflow-hidden">

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
                        Chapter 08
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-7xl md:text-9xl lg:text-[10rem] font-serif italic mb-6 md:mb-12 tracking-tighter leading-none"
                    >
                        What's Next?
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-xl md:text-3xl lg:text-4xl font-medium max-w-4xl mx-auto leading-[1.5] mb-12 md:mb-16 px-4"
                    >
                        <p className="mb-4 text-black/80 font-serif italic">
                            Interfaces should be felt, not just seen. I've spent half a decade mastering the architecture of digital emotion. Now, I'm looking for the next vision that deserves my absolute obsession.
                        </p>
                        <p className="font-serif italic text-black mt-10">
                            Start Chapter 08 here.
                        </p>
                    </motion.div>

                    <motion.a
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        href="mailto:oladimejiuiux@gmail.com"
                        className="inline-flex items-center gap-4 px-10 md:px-12 py-5 md:py-6 bg-black text-white rounded-full font-sans text-sm md:text-base font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        Start Conversation <ArrowUpRight className="w-5 h-5" />
                    </motion.a>
                </div>
            </div>
        </section>
    );
}


