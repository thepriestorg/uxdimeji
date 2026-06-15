"use client";

import { useEffect } from "react";

export default function V2ScrollEffects() {
  useEffect(() => {
    // --- Page progress bar ---
    const progressBar = document.querySelector<HTMLElement>(".page-progress");

    const updateProgress = () => {
      if (!progressBar) return;
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? scrollTop / docHeight : 0;
      progressBar.style.transform = `scaleX(${progress})`;
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    // --- Reveal animations via IntersectionObserver ---
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));

    // --- Auto-fill year in [data-year] elements ---
    const yearElements = document.querySelectorAll("[data-year]");
    const currentYear = new Date().getFullYear().toString();
    yearElements.forEach((el) => {
      el.textContent = currentYear;
    });

    // --- Cleanup ---
    return () => {
      window.removeEventListener("scroll", updateProgress);
      revealObserver.disconnect();
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
