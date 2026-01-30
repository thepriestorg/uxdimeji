"use client";

import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

// Optimize Cloudinary URL with transformations for faster loading
const getOptimizedUrl = (url: string, width: number = 800) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

interface GalleryImage {
    id: string;
    image_url: string;
    created_at: string;
}

export default function WorkGallery() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
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

    // Scroll animation using requestAnimationFrame
    useEffect(() => {
        if (!scrollRef.current || images.length === 0) return;

        let animationId: number;
        let scrollPosition = 0;
        const speed = 2.5;

        const animate = () => {
            if (!scrollRef.current) return;

            scrollPosition += speed;
            const scrollWidth = scrollRef.current.scrollWidth;
            const resetPoint = scrollWidth / 3;

            if (scrollPosition >= resetPoint) {
                scrollPosition = 0;
            }

            scrollRef.current.style.transform = `translateX(-${scrollPosition}px)`;
            animationId = requestAnimationFrame(animate);
        };

        animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [images]);

    if (images.length === 0) return null;

    // Triple the images for seamless infinite scroll
    const scrollImages = [...images, ...images, ...images];

    return (
        <>
            <section className="relative py-12 md:py-32 bg-background overflow-hidden border-t border-white/5">
                {/* Section Header - Compact on mobile */}
                <div className="px-4 md:px-12 md:max-w-7xl md:mx-auto mb-6 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="font-mono text-accent text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] uppercase block mb-2 md:mb-3">
                            Selected Works
                        </span>
                        <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight">
                            Gallery
                        </h2>
                    </motion.div>
                </div>

                {/* Full-bleed scrolling gallery */}
                <div className="relative overflow-hidden">
                    {/* Subtle gradient overlays - smaller on mobile */}
                    <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 md:w-24 bg-gradient-to-r from-background to-transparent z-10" />
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 md:w-24 bg-gradient-to-l from-background to-transparent z-10" />

                    {/* Scrolling container - taller images on mobile */}
                    <div
                        ref={scrollRef}
                        className="flex gap-2 md:gap-5 will-change-transform"
                        style={{ width: 'max-content' }}
                    >
                        {scrollImages.map((img, i) => (
                            <div
                                key={`${img.id}-${i}`}
                                className="relative flex-shrink-0 cursor-pointer"
                                onClick={() => setSelectedImage(img)}
                            >
                                <div className="relative h-[160px] md:h-[450px] overflow-hidden rounded-lg md:rounded-2xl">
                                    <img
                                        src={getOptimizedUrl(img.image_url, 500)}
                                        alt="Gallery work"
                                        className="h-full w-auto max-w-none object-contain"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lightbox */}
            {selectedImage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/95"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <motion.img
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 25 }}
                        src={getOptimizedUrl(selectedImage.image_url, 1200)}
                        alt="Full size"
                        className="max-w-full max-h-[85vh] object-contain rounded-md"
                        onClick={(e) => e.stopPropagation()}
                    />
                </motion.div>
            )}
        </>
    );
}
