"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2, RefreshCcw } from "lucide-react";
const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false });

if (error) {
    console.error('Error fetching images:', error);
} else {
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

    const rows = urls.map(url => ({ image_url: url }));
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

return (
    <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">
                    Gallery
                </h1>
                <p className="text-white/60 text-sm">Manage images in the work gallery.</p>
            </div>
            <button
                onClick={fetchImages}
                className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
            >
                <RefreshCcw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {images.map((img) => (
                    <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-white/10">
                        <img
                            src={img.image_url}
                            alt="Gallery"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                                onClick={() => handleDelete(img.id)}
                                className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transform scale-90 group-hover:scale-100 transition-all duration-300"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
                {images.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/40 font-mono uppercase tracking-widest text-sm">
                        No images found. Upload some above.
                    </div>
                )}
            </div>
        )}
    </div>
);
}
