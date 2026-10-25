"use client";

import { useEffect, type RefObject } from "react";

// Motion is opt-in: the <head> script in the root layout sets this attribute only for real
// browsers that allow motion. Crawlers and reduced-motion visitors keep the final state.
const motionAllowed = () => document.documentElement.hasAttribute("data-build-animate");

/**
 * Writes the element's scroll progress (0 → 1) to `--progress` once per frame.
 * 0 when its top reaches `start` of the viewport height, 1 when its bottom reaches `end`.
 * CSS defaults `--progress` to 1, so without JS everything renders fully revealed.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  { start = 0.9, end = 0.55 }: { start?: number; end?: number } = {}
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const from = vh * start;
      const to = vh * end - rect.height;
      const progress = Math.min(1, Math.max(0, (from - rect.top) / (from - to)));
      el.style.setProperty("--progress", progress.toFixed(4));
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
  }, [ref, start, end]);
}

/**
 * Marks every `[data-reveal]` inside the root with `data-inview` the first time it enters
 * the viewport. CSS only hides un-revealed elements under `:root[data-build-animate]`.
 */
export function useRevealOnEnter(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !motionAllowed()) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).dataset.inview = "";
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [ref]);
}
