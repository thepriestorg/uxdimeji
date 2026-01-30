"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaUploaderProps {
    value?: string;
    onChange?: (url: string) => void;
    onBatchComplete?: (urls: string[]) => void;
    label?: string;
    multiple?: boolean;
}

export default function MediaUploader({ value, onChange, onBatchComplete, label = "Featured Image", multiple = false }: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (files: File[]) => {
        setUploading(true);
        const uploadedUrls: string[] = [];

        try {
            // Upload all files in parallel
            await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();
                if (data.url) {
                    uploadedUrls.push(data.url);
                }
            }));

            if (uploadedUrls.length > 0) {
                if (multiple && onBatchComplete) {
                    onBatchComplete(uploadedUrls);
                } else if (onChange) {
                    onChange(uploadedUrls[0]);
                }
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
        if (droppedFiles.length > 0) {
            if (!multiple && droppedFiles.length > 1) {
                // If not multiple, just take the first
                handleUpload([droppedFiles[0]]);
            } else {
                handleUpload(droppedFiles);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleUpload(Array.from(files));
        }
    };

    return (
        <div>
            <label className="block text-sm font-mono text-white/50 mb-2 uppercase tracking-widest">
                {label}
            </label>

            {!multiple && value ? (
                <div className="relative rounded-2xl overflow-hidden group">
                    <img src={value} alt="Preview" className="w-full h-48 object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-4 py-2 bg-white text-black rounded-lg font-bold text-sm"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange?.("")}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
                        dragOver
                            ? "border-accent bg-accent/10"
                            : "border-white/10 hover:border-white/20"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="w-8 h-8 text-accent mx-auto animate-spin" />
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                            <p className="text-white/50 text-sm">
                                {multiple ? "Drop images here or click to upload" : "Drop image here or click to upload"}
                            </p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}
