"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2, RefreshCcw } from "lucide-react";
import MediaUploader from "@/components/admin/MediaUploader";
import Image from "next/image";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from "@dnd-kit/sortable";
import SortableGalleryItem from "@/components/admin/SortableGalleryItem";

// Optimize Cloudinary URL with transformations for faster loading
const getOptimizedUrl = (url: string, width: number = 400) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

// Generate a tiny blur placeholder URL
const getBlurUrl = (url: string) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    return url.replace('/upload/', '/upload/f_auto,q_10,w_20,e_blur:1000/');
};

export default function GalleryAdmin() {
    const supabase = createClient();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [savingOrder, setSavingOrder] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchImages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            // Using display_order for sorting.
            // If display_order is null, it might mess up, ideally it should have a default.
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching images:', error);
        } else {
            console.log("Fetched images:", data);
            setImages(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleAddImages = async (urls: string[]) => {
        if (!urls.length) return;
        setUploading(true);

        // Get the current max display_order
        let maxOrder = 0;
        if (images.length > 0) {
            maxOrder = Math.max(...images.map(img => img.display_order || 0));
        }

        const rows = urls.map((url, index) => ({
            image_url: url,
            display_order: maxOrder + index + 1
        }));

        const { error } = await supabase
            .from('gallery_images')
            .insert(rows);

        if (error) {
            console.error('Error adding images:', error);
            alert("Failed to add images");
        } else {
            fetchImages();
        }
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        const { error } = await supabase
            .from('gallery_images')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting image:', error);
            alert("Failed to delete image");
        } else {
            setImages(images.filter(img => img.id !== id));
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Persist the new order in the background
                persistOrder(newItems);

                return newItems;
            });
        }
    };

    // Helper to persist order to Supabase
    const persistOrder = async (newItems: any[]) => {
        setSavingOrder(true);
        const updates = newItems.map((item, index) => ({
            id: item.id,
            display_order: index,
            // Keep other fields if necessary, or check if upsert works with partials (it usually expects all required fields or PK)
            // gallery_images table structure matters. If I assume only ID and display_order are needed for update.
            // Using rpc or simple upsert loop might be safer if we don't know constraints perfectly, 
            // but loop is slow. Let's try upsert with just ID and display_order.
            image_url: item.image_url // include this to be safe for upsert if needed, though update is better.
        }));

        // Supabase update doesn't support bulk update with different values easily in one query without RPC.
        // We can loop for now since n is likely small (< 100), or use upsert. 
        // Upsert requires all non-nullable columns if not providing defaults.

        try {
            // Updating one by one is safest for now to avoid complexity, though slower.
            // Or simpler: create an RPC for this later if it's too slow.
            // For ~20 images, parallel promises are fine.
            await Promise.all(updates.map(update =>
                supabase.from('gallery_images').update({ display_order: update.display_order }).eq('id', update.id)
            ));
        } catch (error) {
            console.error("Error saving order:", error);
        }
        setSavingOrder(false);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                        Gallery
                    </h1>
                    <p className="text-white/60 text-sm">Manage images in the work gallery.</p>
                </div>
                <div className="flex items-center gap-2">
                    {savingOrder && <span className="text-xs text-white/50 animate-pulse">Saving order...</span>}
                    <button
                        onClick={fetchImages}
                        className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <RefreshCcw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Upload Area */}
            <div className="mb-12 bg-white/5 rounded-3xl p-8 border border-white/10">
                <div className="max-w-md">
                    <MediaUploader
                        multiple={true}
                        onBatchComplete={handleAddImages}
                        label="Upload New Images (Drag & Drop Multiple)"
                    />
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={images.map(img => img.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {images.map((img) => (
                                <SortableGalleryItem key={img.id} id={img.id}>
                                    <div className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10 h-full w-full">
                                        <Image
                                            src={getOptimizedUrl(img.image_url, 400)}
                                            alt={`Gallery image`}
                                            fill
                                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none" // pointer-events-none prevents dragging the image itself naturally
                                            loading="lazy"
                                            placeholder="blur"
                                            blurDataURL={getBlurUrl(img.image_url)}
                                        />

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            {/* Delete button needs to stop propagation to prevent drag start over it? No, sortable handle is usually the whole item. 
                                                If we click the button, DndKit might start dragging. We should make the button interactive. 
                                                Using class 'no-drag' if configured? Or simply onPointerDown stop propagation? 
                                                Actually, button click works fine in dnd-kit usually if not heavily nested or if simple click.
                                                But let's add onPointerDown={(e) => e.stopPropagation()} to be safe.
                                            */}
                                            <button
                                                onClick={(e) => {
                                                    // Prevent drag?
                                                    handleDelete(img.id);
                                                }}
                                                onPointerDown={(e) => e.stopPropagation()} // Important to prevent dragging when trying to click delete
                                                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300 cursor-pointer"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </SortableGalleryItem>
                            ))}
                            {images.length === 0 && (
                                <div className="col-span-full py-20 text-center text-white/40 font-mono uppercase tracking-widest text-sm">
                                    No images found. Upload some above.
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
