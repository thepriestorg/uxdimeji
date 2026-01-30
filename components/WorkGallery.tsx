"use client";

import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useAnimationFrame } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

// Utility to wrap a number between a range
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function ParallaxText({ children, baseVelocity = 100 }: { children: React.ReactNode, baseVelocity: number }) {
    const baseX = useMotionValue(0);
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
    const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

    const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

    const directionFactor = useRef<number>(1);
    useAnimationFrame((t, delta) => {
        let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

        if (velocityFactor.get() < 0) {
            directionFactor.current = -1;
        } else if (velocityFactor.get() > 0) {
            directionFactor.current = 1;
        }

        moveBy += directionFactor.current * moveBy * velocityFactor.get();
        baseX.set(baseX.get() + moveBy);
    });

    return (
        <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap">
            <motion.div className="flex flex-nowrap gap-8 md:gap-16" style={{ x }}>
                {children}
                {children}
                {children}
                {children}
            </motion.div>
        </div>
    );
}

export default function WorkGallery() {
    const [images, setImages] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        const fetchImages = async () => {
            const { data } = await supabase
                .from('gallery_images')
                .select('*')
                .order('created_at', { ascending: false });
            if (data) setImages(data);
        };
        fetchImages();
    }, []);

    if (images.length === 0) return null;

    return (
        <section className="relative py-24 md:py-40 bg-background overflow-hidden border-t border-white/5">

            {/* Section Title */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16 md:mb-24">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="font-mono text-accent text-xs tracking-[0.2em] uppercase block"
                >
                    (001) <br /> Selected Works
                </motion.span>
            </div>

            {/* Skewed Container */}
            <div className="-skew-y-2 origin-left">
                <ParallaxText baseVelocity={2.5}>
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className="relative h-[40vh] md:h-[600px] w-auto flex-shrink-0 mx-4 transition-all duration-500"
                        >
                            <img
                                src={img.image_url}
                                alt="Gallery"
                                className="h-full w-auto max-w-none object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    ))}
                </ParallaxText>
            </div>
        </section>
    );
}
