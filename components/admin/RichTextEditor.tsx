"use client";

import { useEditor, EditorContent, Node, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { common, createLowlight } from "lowlight";
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, Code, Quote, ImageIcon,
    Youtube as YoutubeIcon, Link as LinkIcon, Undo, Redo,
    Minus, Upload, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useCallback, useRef } from "react";

const lowlight = createLowlight(common);

// ─── Custom Figure Node (image + caption) ────────────────────────────────────

const Figure = Node.create({
    name: "figure",
    group: "block",
    content: "inline*",
    draggable: true,

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: "" },
            caption: { default: "" },
        };
    },

    parseHTML() {
        return [{ tag: "figure" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "figure",
            { class: "cs-figure" },
            ["img", mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.alt }, { class: "cs-figure__img" })],
            ["figcaption", { class: "cs-figure__caption" }, HTMLAttributes.caption || ""],
        ];
    },

    addNodeView() {
        return ({ node, getPos, editor }) => {
            const dom = document.createElement("figure");
            dom.className = "cs-figure";

            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || "";
            img.className = "cs-figure__img";

            const caption = document.createElement("figcaption");
            caption.className = "cs-figure__caption";
            caption.contentEditable = "true";
            caption.textContent = node.attrs.caption || "";
            caption.setAttribute("data-placeholder", "Add a caption…");

            caption.addEventListener("input", () => {
                const pos = typeof getPos === "function" ? getPos() : undefined;
                if (pos !== undefined) {
                    editor.commands.command(({ tr }) => {
                        tr.setNodeMarkup(pos, undefined, {
                            ...node.attrs,
                            caption: caption.textContent || "",
                        });
                        return true;
                    });
                }
            });

            // Prevent ProseMirror from swallowing caption keystrokes
            caption.addEventListener("keydown", (e) => {
                e.stopPropagation();
            });

            dom.appendChild(img);
            dom.appendChild(caption);

            return { dom };
        };
    },
});

// ─── Props ───────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

// ─── WYSIWYG editor styles (injected once) ───────────────────────────────────

const EDITOR_STYLES = `
/* === Rich Text Editor WYSIWYG Styles === */
.rte-editor {
    color: rgba(255,255,255,0.8);
    font-size: 1rem;
    line-height: 1.75;
}

/* Headings */
.rte-editor h1 {
    font-size: 2.25rem;
    font-weight: 800;
    line-height: 1.15;
    color: #ffffff;
    margin: 1.75rem 0 0.75rem;
    letter-spacing: -0.02em;
}
.rte-editor h2 {
    font-size: 1.75rem;
    font-weight: 700;
    line-height: 1.2;
    color: #ffffff;
    margin: 1.5rem 0 0.6rem;
    letter-spacing: -0.01em;
}
.rte-editor h3 {
    font-size: 1.35rem;
    font-weight: 600;
    line-height: 1.3;
    color: #ffffff;
    margin: 1.25rem 0 0.5rem;
}
.rte-editor h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    margin: 1rem 0 0.4rem;
}

/* Paragraph */
.rte-editor p {
    color: rgba(255,255,255,0.75);
    line-height: 1.75;
    margin: 0.5rem 0;
}
.rte-editor p:empty { min-height: 1.5em; }

/* Inline marks */
.rte-editor strong, .rte-editor b  { color: #fff; font-weight: 700; }
.rte-editor em, .rte-editor i      { color: rgba(255,255,255,0.85); font-style: italic; }
.rte-editor u                      { text-decoration: underline; text-underline-offset: 3px; }
.rte-editor s, .rte-editor del     { text-decoration: line-through; color: rgba(255,255,255,0.45); }
.rte-editor a                      { color: #7C3AED; text-decoration: underline; cursor: pointer; }
.rte-editor a:hover                { color: #a78bfa; }
.rte-editor mark                   { background: rgba(124,58,237,0.3); color: #fff; padding: 0 2px; border-radius: 2px; }

/* Inline code */
.rte-editor code {
    background: rgba(124,58,237,0.15);
    border: 1px solid rgba(124,58,237,0.25);
    padding: 0.1em 0.4em;
    border-radius: 5px;
    font-size: 0.875em;
    color: #c4b5fd;
    font-family: 'Fira Code', 'Cascadia Code', monospace;
}

/* Code block */
.rte-editor pre {
    background: rgba(0,0,0,0.55);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    margin: 1.25rem 0;
    position: relative;
}
.rte-editor pre::before {
    content: 'code';
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: rgba(255,255,255,0.2);
    font-family: monospace;
}
.rte-editor pre code {
    background: none;
    border: none;
    padding: 0;
    color: rgba(255,255,255,0.85);
    font-size: 0.875rem;
    line-height: 1.7;
}

/* Blockquote */
.rte-editor blockquote {
    border-left: 3px solid #7C3AED;
    padding: 0.75rem 0 0.75rem 1.25rem;
    margin: 1.25rem 0;
    color: rgba(255,255,255,0.55);
    font-style: italic;
    background: rgba(124,58,237,0.04);
    border-radius: 0 8px 8px 0;
}
.rte-editor blockquote p { color: inherit; margin: 0; }

/* Lists */
.rte-editor ul {
    list-style: none;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
    color: rgba(255,255,255,0.75);
}
.rte-editor ul li { margin: 0.3rem 0; line-height: 1.7; position: relative; }
.rte-editor ul li::before {
    content: '•';
    position: absolute;
    left: -1.25rem;
    color: #7C3AED;
    font-weight: bold;
}
.rte-editor ol {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
    color: rgba(255,255,255,0.75);
}
.rte-editor ol li { margin: 0.3rem 0; line-height: 1.7; }
.rte-editor ol li::marker { color: #7C3AED; font-weight: 600; }

/* Nested lists */
.rte-editor ul ul, .rte-editor ol ul { list-style: none; margin: 0.25rem 0; }
.rte-editor ul ul li::before { content: '◦'; }
.rte-editor ol ol { list-style: lower-alpha; }

/* Horizontal rule */
.rte-editor hr {
    border: none;
    border-top: 1px solid rgba(255,255,255,0.1);
    margin: 2rem 0;
}

/* Images */
.rte-editor img {
    border-radius: 0.75rem;
    max-width: 100%;
    display: block;
    margin: 0.5rem 0;
}

/* Figure / captioned image */
.rte-editor .cs-figure {
    display: block;
    margin: 1.5rem 0;
}
.rte-editor .cs-figure__img {
    border-radius: 0.75rem;
    max-width: 100%;
    display: block;
    width: 100%;
    object-fit: cover;
}
.rte-editor .cs-figure__caption {
    display: block;
    text-align: center;
    font-size: 0.8rem;
    color: rgba(255,255,255,0.35);
    font-style: italic;
    margin-top: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    outline: none;
    min-height: 1.6em;
    cursor: text;
    transition: background 0.15s;
}
.rte-editor .cs-figure__caption:focus {
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.55);
}
.rte-editor .cs-figure__caption:empty::before {
    content: attr(data-placeholder);
    color: rgba(255,255,255,0.18);
    font-style: italic;
    pointer-events: none;
}

/* YouTube embed */
.rte-editor iframe {
    border-radius: 0.75rem;
    width: 100%;
    aspect-ratio: 16/9;
    border: none;
    display: block;
    margin: 1rem 0;
}

/* Placeholder */
.rte-editor .is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: rgba(255,255,255,0.18);
    pointer-events: none;
    float: left;
    height: 0;
}

/* Selection */
.rte-editor ::selection { background: rgba(124,58,237,0.35); }
`;

// ─── Component ───────────────────────────────────────────────────────────────

export default function RichTextEditor({ content, onChange, placeholder = "Start writing..." }: RichTextEditorProps) {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showYoutubeModal, setShowYoutubeModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageCaption, setImageCaption] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState<{ file: File; preview: string; caption: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Underline,
            Image.configure({
                HTMLAttributes: { class: "rounded-xl max-w-full" },
            }),
            Figure,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-accent underline" },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: { class: "rounded-xl overflow-hidden" },
            }),
            CodeBlockLowlight.configure({ lowlight }),
            Placeholder.configure({ placeholder }),
        ],
        content: (() => {
            try { return content ? JSON.parse(content) : ""; }
            catch { return content || ""; }
        })(),
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()));
        },
        editorProps: {
            attributes: {
                class: "rte-editor focus:outline-none min-h-[400px] px-6 py-5",
            },
        },
    });

    // ── Insert images from the queue ─────────────────────────────────────────

    const insertQueuedImages = useCallback(async () => {
        if (!editor || uploadQueue.length === 0) return;
        setUploading(true);
        try {
            for (const item of uploadQueue) {
                const fd = new FormData();
                fd.append("file", item.file);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (data.url) {
                    editor.chain().focus().insertContent({
                        type: "figure",
                        attrs: { src: data.url, alt: item.file.name, caption: item.caption },
                    }).run();
                }
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setUploading(false);
            setUploadQueue([]);
            setShowImageModal(false);
        }
    }, [editor, uploadQueue]);

    // ── Insert image by URL ───────────────────────────────────────────────────

    const addImageByUrl = useCallback(() => {
        if (imageUrl && editor) {
            editor.chain().focus().insertContent({
                type: "figure",
                attrs: { src: imageUrl, alt: "", caption: imageCaption },
            }).run();
            setImageUrl(""); setImageCaption(""); setShowImageModal(false);
        }
    }, [editor, imageUrl, imageCaption]);

    const addLink = useCallback(() => {
        if (linkUrl && editor) {
            editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
            setLinkUrl(""); setShowLinkModal(false);
        }
    }, [editor, linkUrl]);

    const addYoutube = useCallback(() => {
        if (youtubeUrl && editor) {
            editor.commands.setYoutubeVideo({ src: youtubeUrl });
            setYoutubeUrl(""); setShowYoutubeModal(false);
        }
    }, [editor, youtubeUrl]);

    const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setUploadQueue((prev) => [...prev, ...files.map((f) => ({
            file: f,
            preview: URL.createObjectURL(f),
            caption: "",
        }))]);
        e.target.value = "";
    };

    const removeFromQueue = (idx: number) => {
        setUploadQueue((prev) => {
            URL.revokeObjectURL(prev[idx].preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const updateCaption = (idx: number, caption: string) =>
        setUploadQueue((prev) => prev.map((item, i) => i === idx ? { ...item, caption } : item));

    const closeImageModal = () => { setShowImageModal(false); setUploadQueue([]); setImageUrl(""); setImageCaption(""); };

    if (!editor) return null;

    const Btn = ({
        onClick, isActive = false, children, title,
    }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "p-2 rounded-lg transition-colors text-sm",
                isActive ? "bg-accent text-black" : "text-white/60 hover:text-white hover:bg-white/10"
            )}
        >
            {children}
        </button>
    );

    const Sep = () => <div className="w-px h-6 bg-white/10 mx-0.5 self-center" />;

    return (
        <>
            {/* Inject styles once */}
            <style dangerouslySetInnerHTML={{ __html: EDITOR_STYLES }} />

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">

                {/* ── Toolbar ─────────────────────────────────────────────── */}
                <div className="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur p-2 flex flex-wrap items-center gap-0.5">

                    {/* Text style */}
                    <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold (Ctrl+B)">
                        <Bold className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic (Ctrl+I)">
                        <Italic className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline (Ctrl+U)">
                        <UnderlineIcon className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough">
                        <Strikethrough className="w-4 h-4" />
                    </Btn>

                    <Sep />

                    {/* Headings */}
                    <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
                        <Heading1 className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
                        <Heading2 className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
                        <Heading3 className="w-4 h-4" />
                    </Btn>

                    <Sep />

                    {/* Structure */}
                    <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
                        <List className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
                        <ListOrdered className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Blockquote">
                        <Quote className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")} title="Code Block">
                        <Code className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Divider">
                        <Minus className="w-4 h-4" />
                    </Btn>

                    <Sep />

                    {/* Media */}
                    <Btn onClick={() => setShowLinkModal(true)} title="Add Link">
                        <LinkIcon className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => setShowImageModal(true)} title="Add Image(s)">
                        <ImageIcon className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => setShowYoutubeModal(true)} title="Embed YouTube">
                        <YoutubeIcon className="w-4 h-4" />
                    </Btn>

                    <div className="flex-1" />

                    {/* History */}
                    <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo">
                        <Undo className="w-4 h-4" />
                    </Btn>
                    <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo">
                        <Redo className="w-4 h-4" />
                    </Btn>
                </div>

                {/* ── Editor canvas ────────────────────────────────────────── */}
                <div className="max-h-[70vh] overflow-y-auto">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* ── Link Modal ───────────────────────────────────────────────── */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Add Link</h3>
                        <input
                            autoFocus type="url" value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addLink()}
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

            {/* ── Image Modal ──────────────────────────────────────────────── */}
            {showImageModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">

                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold text-white">Add Image(s)</h3>
                            <button type="button" onClick={closeImageModal} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drop zone */}
                        <div
                            className="border-2 border-dashed border-white/10 hover:border-accent/50 rounded-xl p-6 text-center cursor-pointer transition-colors mb-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-7 h-7 text-white/30 mx-auto mb-2" />
                            <p className="text-white/50 text-sm">Click or drag to add images <span className="text-accent font-medium">(multiple OK)</span></p>
                            <p className="text-white/25 text-xs mt-1">JPG, PNG, GIF, WebP</p>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilePick} className="hidden" />

                        {/* Queue */}
                        {uploadQueue.length > 0 && (
                            <div className="space-y-3 mb-5">
                                <p className="text-xs text-white/40 uppercase tracking-widest font-mono">
                                    {uploadQueue.length} image{uploadQueue.length > 1 ? "s" : ""} selected
                                </p>
                                {uploadQueue.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 items-start bg-white/5 rounded-xl p-3">
                                        <img src={item.preview} alt="" className="w-20 h-16 object-cover rounded-lg flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white/50 text-xs mb-1.5 truncate">{item.file.name}</p>
                                            <input
                                                type="text" value={item.caption}
                                                onChange={(e) => updateCaption(idx, e.target.value)}
                                                placeholder="Caption (optional)"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeFromQueue(idx)} className="p-1 text-white/30 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* URL fallback */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-white/30 text-xs">or paste a URL</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>
                        <div className="space-y-2 mb-5">
                            <input
                                type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            />
                            <input
                                type="text" value={imageCaption} onChange={(e) => setImageCaption(e.target.value)}
                                placeholder="Caption (optional)"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button type="button" onClick={closeImageModal} className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium">
                                Cancel
                            </button>
                            {uploadQueue.length > 0 ? (
                                <button
                                    type="button" onClick={insertQueuedImages} disabled={uploading}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-black font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    {uploading ? "Uploading…" : `Insert ${uploadQueue.length} image${uploadQueue.length > 1 ? "s" : ""}`}
                                </button>
                            ) : (
                                <button
                                    type="button" onClick={addImageByUrl} disabled={!imageUrl}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-black font-bold disabled:opacity-40"
                                >
                                    Insert from URL
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── YouTube Modal ────────────────────────────────────────────── */}
            {showYoutubeModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-white mb-4">Embed YouTube</h3>
                        <input
                            autoFocus type="url" value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && addYoutube()}
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
        </>
    );
}
