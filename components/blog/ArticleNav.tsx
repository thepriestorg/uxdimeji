"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ChevronUp } from "lucide-react";

type Heading = { id: string; text: string };

/* Reading aids for an article: a progress bar pinned to the top, a sticky contents rail on wide
   screens, and a floating dock that shows where you are and how much is left. */
export default function ArticleNav({ headings, minutes }: { headings: Heading[]; minutes: number }) {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.querySelector<HTMLElement>(".article-body");
    const end = document.querySelector<HTMLElement>(".post-end");
    if (!body) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = body.getBoundingClientRect();
      const read = window.innerHeight * 0.35 - rect.top;
      setProgress(Math.min(1, Math.max(0, read / rect.height)));

      let current: string | null = null;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.3) current = id;
      }
      setActive(current);

      const endTop = end?.getBoundingClientRect().top ?? Infinity;
      setDocked(rect.top < window.innerHeight * 0.4 && endTop > window.innerHeight * 0.75);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !dockRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const left = Math.max(1, Math.ceil(minutes * (1 - progress)));
  const status = progress >= 0.98 ? "All read ✨" : progress === 0 ? `${minutes} min read` : `${left} min left`;
  const current = headings.find((h) => h.id === active);
  const ring = (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="progress-ring">
      <circle cx="10" cy="10" r="8" />
      <circle cx="10" cy="10" r="8" pathLength={100} strokeDasharray={`${progress * 100} 100`} />
    </svg>
  );

  const list = (onPick?: () => void) => (
    <ol>
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className={active === heading.id ? "is-active" : undefined}
            aria-current={active === heading.id ? "location" : undefined}
            onClick={onPick}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <div className="read-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <nav className="post-toc" aria-label="In this note">
        <p className="post-toc-status">
          {ring}
          <span>{status}</span>
        </p>
        {headings.length > 0 && list()}
      </nav>

      <div ref={dockRef} className={`read-dock${docked ? " is-on" : ""}${open && docked ? " is-open" : ""}`} aria-hidden={!docked}>
        {headings.length > 0 && (
          <div className="read-dock-sheet" id="read-dock-sections">
            <p>Jump to a section</p>
            {list(() => setOpen(false))}
          </div>
        )}
        <div className="read-dock-bar">
          {ring}
          {headings.length > 0 ? (
            <button
              type="button"
              className="read-dock-where"
              aria-expanded={open && docked}
              aria-controls="read-dock-sections"
              tabIndex={docked ? 0 : -1}
              onClick={() => setOpen(!(open && docked))}
            >
              <span>{current?.text ?? "Intro"}</span>
              <ChevronUp aria-hidden="true" />
            </button>
          ) : (
            <span className="read-dock-where">Reading</span>
          )}
          <span className="read-dock-left">{status}</span>
          <button
            type="button"
            className="read-dock-top"
            aria-label="Back to top"
            tabIndex={docked ? 0 : -1}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp aria-hidden="true" />
          </button>
        </div>
      </div>
    </>
  );
}
