"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
    return (
        <footer id="contact" className="layout-gutter relative z-30 overflow-hidden border-t border-white/10 bg-black py-24 text-white">
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="layout-shell relative z-10 flex min-h-[50vh] flex-col justify-between">

                {/* CTA Section */}
                <div className="mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12 text-[clamp(3.5rem,10vw,14rem)] font-black uppercase leading-[0.82] tracking-tighter"
                    >
                        Ready to<br />Start?
                    </motion.h2>
                    <motion.a
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        href="mailto:oladimejiuiux@gmail.com"
                        className="inline-flex items-center gap-4 text-2xl md:text-4xl font-serif italic border-b border-white pb-2 hover:opacity-70 transition-opacity"
                    >
                        Get in Touch <ArrowUpRight className="w-8 h-8" />
                    </motion.a>
                </div>

                {/* Footer Links - Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/20 pt-12">
                    <div>
                        <span className="block font-mono text-sm opacity-50 mb-4">LOCATION</span>
                        <p className="text-xl font-bold">Based in Nigeria.</p>
                        <p className="text-xl font-bold">Available Worldwide.</p>
                    </div>
                    <div>
                        <span className="block font-mono text-sm opacity-50 mb-4">SOCIALS</span>
                        <div className="flex flex-col gap-2">
                            <a href="https://www.instagram.com/oladimeji.exe" target="_blank" rel="noopener noreferrer" className="text-lg hover:italic transition-all">Instagram</a>
                            <a href="https://x.com/olasdimejiuiux" target="_blank" rel="noopener noreferrer" className="text-lg hover:italic transition-all">Twitter / X</a>
                            <a href="https://www.linkedin.com/in/uiuxoladimeji/" target="_blank" rel="noopener noreferrer" className="text-lg hover:italic transition-all">LinkedIn</a>
                        </div>
                    </div>
                    <div className="md:text-right">
                        <span className="block font-mono text-sm opacity-50 mb-4">COPYRIGHT</span>
                        <p className="text-sm opacity-50">© 2026 OA.</p>
                        <p className="text-sm opacity-50">All Rights Reserved.</p>
                    </div>
                </div>

            </div>
        </footer>
    );
}
