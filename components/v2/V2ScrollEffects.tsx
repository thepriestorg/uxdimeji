"use client";

import { useEffect } from "react";

// Scroll progress bar and skip link. Kept free of animation libraries so it adds almost no JavaScript.
export default function V2ScrollEffects() {
  useEffect(() => {
    const progressBar = document.querySelector<HTMLElement>(".page-progress");
    if (!progressBar) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="page-progress" />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
    </>
  );
}
