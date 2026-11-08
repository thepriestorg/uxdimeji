"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpRight, ChevronDown, ChevronUp, ChevronsUp, Eye, EyeOff, GripVertical, Pencil, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { kindLabel, legacyFeatured, madeForLabel, type Project } from "@/lib/projects";

type Row = Pick<
  Project,
  "id" | "title" | "slug" | "year" | "featured_image" | "kind" | "made_for" | "client_name" | "has_case_study" | "live_url" | "is_published" | "order"
>;

type Filter = "all" | "case_study" | "live" | "client" | "personal" | "hidden";

const FILTERS: { id: Filter; label: string; match: (row: Row) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "case_study", label: "Case studies", match: (row) => row.has_case_study },
  { id: "live", label: "Live only", match: (row) => !row.has_case_study },
  { id: "client", label: "Client", match: (row) => row.made_for === "client" },
  { id: "personal", label: "Personal", match: (row) => row.made_for === "personal" },
  { id: "hidden", label: "Hidden", match: (row) => !row.is_published },
];

const isVideoUrl = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url) || url.includes("/video/upload/");

function Thumb({ url, title }: { url: string | null; title: string }) {
  if (!url) return <div className="w-14 h-14 rounded-lg bg-white/10 shrink-0" />;
  return isVideoUrl(url) ? (
    <video src={url} aria-label={title} className="w-14 h-14 rounded-lg object-cover shrink-0" muted playsInline preload="metadata" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
  );
}

type RowProps = {
  row: Row;
  index: number;
  total: number;
  draggable: boolean;
  onTogglePublished: (row: Row) => void;
  onMove: (row: Row, to: number) => void;
};

const iconButton = "p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none";

function ProjectRow({ row, index, total, draggable, onTogglePublished, onMove }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id, disabled: !draggable });
  const who = madeForLabel(row);
  const isSpotlight = draggable && index === 0 && row.is_published;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-zinc-950 touch-none select-none ${draggable ? "cursor-grab active:cursor-grabbing" : ""} ${isDragging ? "relative z-10 shadow-2xl ring-1 ring-accent/60" : "hover:bg-zinc-900"} ${row.is_published ? "" : "opacity-50"}`}
      {...(draggable ? listeners : {})}
      {...attributes}
      aria-roledescription="Draggable project"
    >
      <span className={`flex w-10 shrink-0 items-center gap-1 font-mono text-xs ${draggable ? "text-white/40" : "invisible"}`}>
        <GripVertical className="w-4 h-4 text-white/25 group-hover:text-white/60" />
        {String(index + 1).padStart(2, "0")}
      </span>

      <Thumb url={row.featured_image} title={row.title} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={`/admin/projects/${row.slug}`} className="font-bold text-white truncate hover:text-accent">
            {row.title}
          </Link>
          {isSpotlight && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-accent" title="The top project is the homepage's featured card">
              <Star className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/45">
          <span>{kindLabel(row.kind)}</span>
          {who && <><span>·</span><span>{who}</span></>}
          {row.year && <><span>·</span><span>{row.year}</span></>}
          <span>·</span>
          <span className={row.has_case_study ? "text-white/70" : ""}>{row.has_case_study ? "Case study" : "Links out"}</span>
        </div>
      </div>

      <div className="flex items-center gap-1" onPointerDown={(event) => event.stopPropagation()}>
        {draggable && (
          <div className="mr-2 flex items-center gap-0.5 rounded-xl border border-white/10 p-0.5">
            <button type="button" className={iconButton} title="Move to top" disabled={index === 0} onClick={() => onMove(row, 0)}>
              <ChevronsUp className="w-4 h-4" />
            </button>
            <button type="button" className={iconButton} title="Move up" disabled={index === 0} onClick={() => onMove(row, index - 1)}>
              <ChevronUp className="w-4 h-4" />
            </button>
            <button type="button" className={iconButton} title="Move down" disabled={index === total - 1} onClick={() => onMove(row, index + 1)}>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
        {(row.has_case_study || row.live_url) && (
          <a
            href={row.has_case_study ? `/projects/${row.slug}` : row.live_url!}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
            title="Open on site"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onTogglePublished(row)}
          className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white"
          title={row.is_published ? "Hide from site" : "Show on site"}
        >
          {row.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <Link href={`/admin/projects/${row.slug}`} className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white" title="Edit">
          <Pencil className="w-4 h-4" />
        </Link>
      </div>
    </li>
  );
}

export default function ProjectsList({ initial }: { initial: Row[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = rows.filter(active.match);
  // Order only means something across the whole list, so reordering works on "All".
  const draggable = filter === "all";

  // Moves one project and saves only the rows whose position changed.
  const reorder = async (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || to >= rows.length) return;
    setError(null);
    const next = arrayMove(rows, from, to).map((row, order) => ({ ...row, order }));
    const previous = rows;
    setRows(next);
    const results = await Promise.all(
      next
        .filter((row, i) => previous[i]?.id !== row.id || previous[i]?.order !== row.order)
        .map((row) => supabase.from("projects").update({ order: row.order }).eq("id", row.id)),
    );
    const failed = results.find((result) => result.error);
    if (failed) {
      setRows(previous);
      setError(failed.error!.message);
    }
  };

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (!over || dragged.id === over.id) return;
    void reorder(
      rows.findIndex((row) => row.id === dragged.id),
      rows.findIndex((row) => row.id === over.id),
    );
  };

  const moveRow = (row: Row, to: number) => void reorder(rows.findIndex((r) => r.id === row.id), to);

  const togglePublished = async (row: Row) => {
    const is_published = !row.is_published;
    setRows((current) => current.map((r) => (r.id === row.id ? { ...r, is_published } : r)));
    const { error: saveError } = await supabase
      .from("projects")
      .update({ is_published, is_featured: legacyFeatured({ is_published, has_case_study: row.has_case_study }) })
      .eq("id", row.id);
    if (saveError) {
      setRows((current) => current.map((r) => (r.id === row.id ? row : r)));
      setError(saveError.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => {
          const count = rows.filter(f.match).length;
          if (f.id !== "all" && count === 0) return null;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-full border text-sm font-bold transition-colors ${
                filter === f.id ? "bg-accent text-black border-accent" : "border-white/10 text-white/60 hover:text-white"
              }`}
            >
              {f.label} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">{error}</div>}

      <p className="mb-3 text-sm text-white/40">
        {draggable
          ? "Drag any row, or use the arrows, to set the homepage order. The top project becomes the featured card."
          : "Switch to All to reorder."}
      </p>

      <div className="border border-white/10 rounded-2xl overflow-hidden">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visible.map((row) => row.id)} strategy={verticalListSortingStrategy}>
            <ul>
              {visible.map((row, index) => (
                <ProjectRow
                  key={row.id}
                  row={row}
                  index={index}
                  total={visible.length}
                  draggable={draggable}
                  onTogglePublished={togglePublished}
                  onMove={moveRow}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
