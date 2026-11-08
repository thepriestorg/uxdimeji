"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Link as LinkIcon, Underline as UnderlineIcon, Unlink } from "lucide-react";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const toHtml = (value: string) =>
  !value || /<[a-z/]/i.test(value) ? value : value.split(/\n{2,}/).map((p) => `<p>${p.replace(/</g, "&lt;")}</p>`).join("");

/** Small editor for card summaries: paragraphs, bold, italic, underline and links only. */
export default function SummaryEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: toHtml(value),
    editorProps: {
      attributes: {
        class:
          "min-h-[110px] px-4 py-3 text-white/90 leading-relaxed outline-none [&_p+p]:mt-3 [&_a]:text-accent [&_a]:underline [&_.is-editor-empty:first-child::before]:text-white/30 [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:pointer-events-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Keep in sync if the form resets.
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const next = toHtml(value);
    if (next !== editor.getHTML() && !(editor.isEmpty && !next)) editor.commands.setContent(next, { emitUpdate: false });
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const tool = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${active ? "bg-white/15 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"}`;

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 focus-within:border-accent/60">
      <div className="flex items-center gap-1 border-b border-white/10 px-2 py-1.5">
        <button type="button" title="Bold" className={tool(!!editor?.isActive("bold"))} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" title="Italic" className={tool(!!editor?.isActive("italic"))} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" title="Underline" className={tool(!!editor?.isActive("underline"))} onClick={() => editor?.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <button type="button" title="Add link" className={tool(!!editor?.isActive("link"))} onClick={setLink}>
          <LinkIcon className="w-4 h-4" />
        </button>
        {editor?.isActive("link") && (
          <button type="button" title="Remove link" className={tool(false)} onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}>
            <Unlink className="w-4 h-4" />
          </button>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
