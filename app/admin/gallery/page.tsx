"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2, RefreshCcw, Pencil, X, Check } from "lucide-react";
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

interface ProjectOption {
    id: string;
    title: string;
    slug: string;
}

interface GalleryImage {
    id: string;
    image_url: string;
    display_order: number;
    title: string | null;
    description: string | null;
    project_id: string | null;
}

export default function GalleryAdmin() {
    const supabase = useMemo(() => createClient(), []);
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [projects, setProjects] = useState<ProjectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editProjectId, setEditProjectId] = useState<string>("");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchImages = useCallback(async () => {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching images:', error);
        } else {
            setImages(data || []);
        }
        setLoading(false);
    }, [supabase]);

    const fetchProjects = useCallback(async () => {
        const { data } = await supabase
            .from('projects')
            .select('id, title, slug')
            .order('order', { ascending: true });
        if (data) setProjects(data);
    }, [supabase]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            void fetchImages();
            void fetchProjects();
        });

        return () => window.cancelAnimationFrame(frame);
    }, [fetchImages, fetchProjects]);

    const handleAddImages = async (urls: string[]) => {
        if (!urls.length) return;
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

    const startEditing = (img: GalleryImage) => {
        setEditingId(img.id);
        setEditTitle(img.title || "");
        setEditDescription(img.description || "");
        setEditProjectId(img.project_id || "");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTitle("");
        setEditDescription("");
        setEditProjectId("");
    };

    const saveEditing = async () => {
        if (!editingId) return;

        const { error } = await supabase
            .from('gallery_images')
            .update({
                title: editTitle || null,
                description: editDescription || null,
                project_id: editProjectId || null,
            })
            .eq('id', editingId);

        if (error) {
            console.error('Error updating image:', error);
            alert("Failed to update image");
        } else {
            setImages(images.map(img =>
                img.id === editingId
                    ? { ...img, title: editTitle || null, description: editDescription || null, project_id: editProjectId || null }
                    : img
            ));
            cancelEditing();
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                persistOrder(newItems);
                return newItems;
            });
        }
    };

    const persistOrder = async (newItems: GalleryImage[]) => {
        setSavingOrder(true);
        try {
            await Promise.all(newItems.map((item, index) =>
                supabase.from('gallery_images').update({ display_order: index }).eq('id', item.id)
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
                    <p className="text-white/60 text-sm">Manage images in the work gallery. Add title and description for the Kinetic Wall display.</p>
                </div>
                <div className="flex items-center gap-2">
                    {savingOrder && <span className="text-xs text-white/50 animate-pulse">Saving order...</span>}
                    <button
                        onClick={() => {
                            setLoading(true);
                            void fetchImages();
                        }}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {images.map((img) => (
                                <SortableGalleryItem
                                    key={img.id}
                                    id={img.id}
                                    disabled={editingId === img.id}
                                >
                                    <div className="group relative rounded-xl overflow-hidden bg-black border border-white/10">
                                        {/* Image */}
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={getOptimizedUrl(img.image_url, 600)}
                                                alt={img.title || 'Gallery image'}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover pointer-events-none"
                                                loading="lazy"
                                                placeholder="blur"
                                                blurDataURL={getBlurUrl(img.image_url)}
                                            />

                                            {/* Action buttons overlay */}
                                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(img)}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    className="p-2 bg-white/90 hover:bg-white text-black rounded-full transition-colors cursor-pointer"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(img.id)}
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Meta info */}
                                        <div className="p-3 border-t border-white/10">
                                            {editingId === img.id ? (
                                                /* ── Editing mode ─── */
                                                <div
                                                    className="flex flex-col gap-2"
                                                    onPointerDown={(e) => e.stopPropagation()}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                >
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        placeholder="Title (e.g., Financial overview)"
                                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent"
                                                    />
                                                    <textarea
                                                        value={editDescription}
                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                        placeholder="Description"
                                                        rows={2}
                                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent resize-none"
                                                    />
                                                    <select
                                                        value={editProjectId}
                                                        onChange={(e) => setEditProjectId(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                                                    >
                                                        <option value="">No linked project</option>
                                                        {projects.map((p) => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <X className="w-4 h-4 text-white/60" />
                                                        </button>
                                                        <button
                                                            onClick={saveEditing}
                                                            className="p-2 bg-accent hover:bg-accent/80 rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Check className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* ── Display mode ─── */
                                                <div className="min-h-[40px]">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {img.title || <span className="text-white/25 italic">No title</span>}
                                                    </p>
                                                    {img.description && (
                                                        <p className="text-white/50 text-xs mt-1 line-clamp-2">
                                                            {img.description}
                                                        </p>
                                                    )}
                                                    {img.project_id && (
                                                        <span className="inline-block mt-1.5 px-2 py-0.5 bg-accent/20 text-accent text-[10px] rounded-full font-mono uppercase tracking-wider">
                                                            Linked to project
                                                        </span>
                                                    )}
                                                </div>
                                            )}
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
