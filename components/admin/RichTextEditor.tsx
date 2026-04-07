"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import {
    Bold, Italic, Heading1, Heading2, Heading3,
    List, ListOrdered, Code, Quote, ImageIcon,
    Youtube as YoutubeIcon, Link as LinkIcon, Undo, Redo
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showYoutubeModal, setShowYoutubeModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rounded-xl max-w-full",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-accent underline",
                },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: "rounded-xl overflow-hidden",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: content ? JSON.parse(content) : "",
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()));
        },
        editorProps: {
            attributes: {
                class: "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[360px] px-6 py-4",
            },
        },
    });

    const addImage = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl("");
            setShowImageModal(false);
        }
    }, [editor, imageUrl]);

    const addLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
            setLinkUrl("");
            setShowLinkModal(false);
        }
    }, [editor, linkUrl]);

    const addYoutube = useCallback(() => {
        if (youtubeUrl && editor) {
            editor.commands.setYoutubeVideo({ src: youtubeUrl });
            setYoutubeUrl("");
            setShowYoutubeModal(false);
        }
    }, [editor, youtubeUrl]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.url && editor) {
                editor.chain().focus().setImage({ src: data.url }).run();
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    if (!editor) return null;

    const ToolbarButton = ({
        onClick,
        isActive = false,
        children,
        title
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
    }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-2 rounded-lg transition-colors",
                isActive ? "bg-accent text-black" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {/* Toolbar */}
            <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur p-2 flex flex-wrap items-center gap-1">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                    title="Code Block"
                >
                    <Code className="w-4 h-4" />
                </ToolbarButton>

                <div className="w-px h-6 bg-white/10 mx-1" />

                <ToolbarButton onClick={() => setShowLinkModal(true)} title="Add Link">
                    <LinkIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => setShowImageModal(true)} title="Add Image">
                    <ImageIcon className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton onClick={() => setShowYoutubeModal(true)} title="Embed YouTube">
                    <YoutubeIcon className="w-4 h-4" />
                </ToolbarButton>

                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </ToolbarButton>
            </div>

            {/* Editor */}
            <div className="max-h-[70vh] overflow-y-auto">
                <EditorContent editor={editor} />
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Add Link</h3>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent mb-4"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowLinkModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white">Cancel</button>
                            <button onClick={addLink} className="flex-1 px-4 py-2 rounded-xl bg-accent text-black font-bold">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Add Image</h3>
                        <div className="mb-4">
                            <label className="block text-sm text-white/50 mb-2">Upload from device</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full text-white/60"
                            />
                        </div>
                        <div className="text-center text-white/30 mb-4">— or —</div>
                        <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="Paste image URL"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent mb-4"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowImageModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white">Cancel</button>
                            <button onClick={addImage} className="flex-1 px-4 py-2 rounded-xl bg-accent text-black font-bold">Add</button>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Modal */}
            {showYoutubeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Embed YouTube</h3>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent mb-4"
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowYoutubeModal(false)} className="flex-1 px-4 py-2 rounded-xl border border-white/10 text-white">Cancel</button>
                            <button onClick={addYoutube} className="flex-1 px-4 py-2 rounded-xl bg-accent text-black font-bold">Embed</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
