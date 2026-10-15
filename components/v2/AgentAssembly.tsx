"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./AgentAssembly.module.css";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  label?: string;
  as?: "section" | "div";
  variant?: "hero" | "profile" | "activity";
};

type BuildJob = { agent: number; start: number; draw: number; stagger: number; settle: number };

// Three independent tracks overlap intentionally. Each agent owns a part of the canvas.
const jobs: Record<NonNullable<Props["variant"]>, Record<string, BuildJob>> = {
  hero: {
    intro: { agent: 0, start: 180, draw: 300, stagger: 150, settle: 350 },
    identity: { agent: 1, start: 320, draw: 600, stagger: 160, settle: 350 },
    copy: { agent: 2, start: 450, draw: 500, stagger: 225, settle: 400 },
    status: { agent: 0, start: 1800, draw: 300, stagger: 100, settle: 400 },
    role: { agent: 0, start: 3000, draw: 300, stagger: 100, settle: 400 },
    location: { agent: 1, start: 3500, draw: 300, stagger: 100, settle: 400 },
    actions: { agent: 2, start: 4800, draw: 400, stagger: 170, settle: 350 },
  },
  profile: {
    intro: { agent: 0, start: 180, draw: 300, stagger: 100, settle: 350 },
    portrait: { agent: 0, start: 1200, draw: 350, stagger: 100, settle: 350 },
    identity: { agent: 1, start: 300, draw: 450, stagger: 160, settle: 300 },
    role: { agent: 1, start: 1700, draw: 250, stagger: 100, settle: 300 },
    copy: { agent: 2, start: 400, draw: 400, stagger: 175, settle: 300 },
    actions: { agent: 0, start: 3000, draw: 300, stagger: 100, settle: 350 },
    stack: { agent: 1, start: 3400, draw: 250, stagger: 100, settle: 300 },
    tools: { agent: 1, start: 4300, draw: 400, stagger: 160, settle: 350 },
  },
  activity: {
    summary: { agent: 0, start: 180, draw: 300, stagger: 100, settle: 350 },
    grid: { agent: 1, start: 320, draw: 400, stagger: 55, settle: 300 },
    legend: { agent: 2, start: 450, draw: 300, stagger: 100, settle: 350 },
  },
};

// CSS hides pending pieces in the server HTML, before React or any animation code runs.
export default function AgentAssembly({
  children, className = "", id, label, as: Tag = "div", variant = "hero",
}: Props) {
  const rootRef = useRef<HTMLDivElement & HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!root || !overlay) return;
    if (!Element.prototype.animate || !window.IntersectionObserver) {
      root.dataset.assemblyState = "complete";
      return;
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) {
      root.dataset.assemblyState = "complete";
      return;
    }

    let played = false;
    let running = false;
    let duration = 0;
    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const animations: Animation[] = [];
    const decorations: HTMLElement[] = [];
    const finish = () => {
      played = true;
      running = false;
      animations.forEach((animation) => animation.cancel());
      decorations.forEach((decoration) => decoration.remove());
      root.dataset.assemblyState = "complete";
      clearTimeout(finishTimer);
    };
    finishRef.current = () => finish();
    const animate = (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
      const animation = element.animate(keyframes, { fill: "both", ...options });
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
    };

    const prepare = () => {
      // Prepare only on entry: offscreen sections have no running or completed timeline.
      // Visibility hiding preserves dimensions, so every piece can be measured in place.
      const bounds = root.getBoundingClientRect();
      const pieces = Array.from(root.querySelectorAll<HTMLElement>("[data-build-piece]"))
        .filter((piece) => piece.closest("[data-assembly]") === root && piece.getBoundingClientRect().width > 0);
      const stages = pieces.map((piece) => {
        const selector = variant === "activity" ? "[data-build-column]" : "[data-build-fragment]";
        return {
          piece,
          rect: piece.getBoundingClientRect(),
          fragments: Array.from(piece.querySelectorAll<HTMLElement>(selector))
            .filter((fragment) => fragment.getBoundingClientRect().width > 0)
            .map((element) => ({ element, rect: element.getBoundingClientRect() })),
        };
      });
      const templates = overlay.querySelectorAll<HTMLElement>("[data-agent-template]");
      duration = 0;

      stages.forEach(({ piece, rect, fragments }, index) => {
        const job = jobs[variant][piece.dataset.buildKind || ""] || {
          agent: index % 3, start: 180 + index * 1000, draw: 350, stagger: 100, settle: 350,
        };
        const { agent, start, draw: drawTime, stagger, settle: settleTime } = job;
        const buildStart = start + drawTime + 100;
        const buildLength = fragments.length ? (fragments.length - 1) * stagger + settleTime : settleTime;
        const stageLength = drawTime + 100 + buildLength + 180;

        // A frame is traced first. Its contents do not exist visually until the agent places them.
        const frame = document.createElement("div");
        frame.className = styles.frame;
        frame.dataset.agent = String(agent);
        Object.assign(frame.style, {
          left: `${rect.left - bounds.left - 5}px`, top: `${rect.top - bounds.top - 5}px`,
          width: `${rect.width + 10}px`, height: `${rect.height + 10}px`,
        });
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", `0 0 ${rect.width + 10} ${rect.height + 10}`);
        svg.setAttribute("preserveAspectRatio", "none");
        const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        outline.setAttribute("x", "1");
        outline.setAttribute("y", "1");
        outline.setAttribute("width", String(rect.width + 8));
        outline.setAttribute("height", String(rect.height + 8));
        outline.setAttribute("pathLength", "1");
        outline.setAttribute("rx", "1");
        svg.append(outline);
        const caption = document.createElement("span");
        caption.className = styles.frameCaption;
        caption.textContent = piece.dataset.buildPiece || "Frame";
        frame.append(svg, caption);
        overlay.append(frame);
        decorations.push(frame);
        animate(frame, [
          { opacity: 0 }, { opacity: 1, offset: .08 },
          { opacity: 1, offset: .84 }, { opacity: 0 },
        ], { duration: stageLength, delay: start });
        animate(outline, [
          { strokeDashoffset: "1" }, { strokeDashoffset: "0" },
        ], { duration: drawTime, delay: start, easing: "ease-in-out" });

        animate(piece, fragments.length ? [
          { opacity: 0, visibility: "hidden" },
          { opacity: 1, visibility: "visible" },
        ] : [
          { opacity: 0, visibility: "hidden", clipPath: "inset(0 100% 0 0)", translate: "0px 6px" },
          { opacity: 1, visibility: "visible", clipPath: "inset(0 0% 0 0)", translate: "0px 0px" },
        ], { duration: fragments.length ? 60 : settleTime, delay: buildStart,
          easing: "cubic-bezier(.2,.8,.2,1)" });

        fragments.forEach(({ element }, fragmentIndex) => {
          animate(element, [
            { opacity: 0, visibility: "hidden", translate: "0px 8px" },
            { opacity: 1, visibility: "visible", translate: "0px 0px" },
          ], { duration: settleTime, delay: buildStart + fragmentIndex * stagger,
            easing: "cubic-bezier(.2,.8,.2,1)" });
        });
        piece.querySelectorAll<SVGPathElement>("[data-build-stroke]").forEach((stroke) => {
          const fragmentIndex = fragments.findIndex(({ element }) => element.contains(stroke));
          animate(stroke, [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], {
            duration: 500, delay: buildStart + Math.max(0, fragmentIndex) * stagger,
            easing: "ease-in-out",
          });
        });

        // Each stage gets its own cursor instance, so no future animation can override it.
        const cursor = templates[agent].cloneNode(true) as HTMLElement;
        cursor.removeAttribute("data-agent-template");
        cursor.setAttribute("data-agent-cursor", "");
        overlay.append(cursor);
        decorations.push(cursor);
        const point = (x: number, y: number) => {
          const safeX = Math.max(8, Math.min(x - bounds.left, bounds.width - 112));
          const safeY = Math.max(8, Math.min(y - bounds.top, bounds.height - 48));
          return `translate3d(${safeX}px,${safeY}px,0)`;
        };
        const path: Keyframe[] = [
          { transform: point(rect.left - 18, rect.top - 24), opacity: 0, offset: 0 },
          { transform: point(rect.left, rect.top), opacity: 1, offset: Math.min(.05, drawTime / stageLength / 2) },
          { transform: point(rect.right, rect.bottom), opacity: 1, offset: drawTime / stageLength },
        ];
        fragments.forEach(({ rect: fragmentRect }, fragmentIndex) => {
          path.push({
            transform: point(fragmentRect.right - 3, fragmentRect.bottom + 3),
            opacity: 1, offset: (drawTime + 100 + fragmentIndex * stagger) / stageLength,
            easing: "cubic-bezier(.2,.7,.3,1)",
          });
        });
        const last = path[path.length - 1];
        path.push({ ...last, opacity: 1, offset: Math.max(.9, Number(last.offset)) }, { ...last, opacity: 0, offset: 1 });
        animate(cursor, path, { duration: stageLength, delay: start, easing: "linear" });
        const progress = cursor.querySelector("[data-agent-progress]");
        if (progress) animate(progress, [{ scale: "0 1" }, { scale: "1 1" }], {
          duration: stageLength - drawTime, delay: start + drawTime, easing: "linear",
        });
        duration = Math.max(duration, start + stageLength + 240);
      });
      root.dataset.assemblyDuration = String(duration);
    };
    root.dataset.assemblyState = "waiting";
    const isInView = () => {
      const rect = root.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
      return visibleHeight >= Math.min(80, rect.height * .18);
    };
    const play = () => {
      if (played || document.hidden || !isInView()) return;
      initialWidth = innerWidth;
      initialHeight = innerHeight;
      try {
        prepare();
      } catch (error) {
        finish();
        console.warn("Section build unavailable; showing content.", error);
        return;
      }
      played = true;
      running = true;
      root.dataset.assemblyState = "building";
      animations.forEach((animation) => animation.play());
      finishTimer = setTimeout(() => finish(), duration);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && isInView()) {
        play();
        if (played) observer.disconnect();
      }
    }, { threshold: 0, rootMargin: "0px 0px -96px 0px" });
    observer.observe(root);
    const handleVisibility = () => {
      if (document.hidden && running) {
        animations.forEach((animation) => animation.pause());
        clearTimeout(finishTimer);
      } else if (!document.hidden && running) {
        const elapsed = Number(animations[0]?.currentTime ?? 0);
        animations.forEach((animation) => animation.play());
        finishTimer = setTimeout(() => finish(), Math.max(0, duration - elapsed));
      } else if (!played && isInView()) play();
    };
    const handleMotion = () => { if (motion.matches) finish(); };
    let initialWidth = innerWidth;
    let initialHeight = innerHeight;
    // Ignore mobile browser chrome changes, and never finish an offscreen build on resize.
    const handleResize = () => {
      if (running && (innerWidth !== initialWidth || Math.abs(innerHeight - initialHeight) > 160)) finish();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    motion.addEventListener("change", handleMotion);
    window.addEventListener("resize", handleResize);
    return () => {
      observer.disconnect();
      finish();
      finishRef.current = null;
      document.removeEventListener("visibilitychange", handleVisibility);
      motion.removeEventListener("change", handleMotion);
      window.removeEventListener("resize", handleResize);
    };
  }, [variant]);

  const names = variant === "activity"
    ? ["Agent / data", "Agent / build", "Agent / detail"]
    : ["Agent / layout", "Agent / type", "Agent / content"];
  return (
    <Tag ref={rootRef} className={`${styles.scope} ${className}`} id={id} aria-label={label} data-assembly={variant} data-assembly-state="pending">
      {children}
      <div ref={overlayRef} className={styles.overlay} aria-hidden="true">
        {names.map((name, index) => (
          <div key={name} className={styles.cursor} data-agent-template data-agent={index}>
            <svg width="22" height="25" viewBox="0 0 22 25" fill="none">
              <path d="M2 2 19 12 11 14 7 22 2 2Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span>{name}<i /><em data-agent-progress /></span>
          </div>
        ))}
      </div>
      <button type="button" className={styles.skip} onClick={() => finishRef.current?.()}>
        Skip build <span aria-hidden="true">↗</span>
      </button>
    </Tag>
  );
}
