"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lenis from "lenis";

export default function V2Animations({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {/* Page Reveal Animation */}
      <motion.div
        key="v2-reveal-overlay"
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
      >
        <motion.div 
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="font-mono text-xs uppercase tracking-[0.3em] text-white/50"
        >
            Loading Experience
        </motion.div>
      </motion.div>

      {/* Main Content Wrapper */}
      <motion.div
        key="v2-content"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.4 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
