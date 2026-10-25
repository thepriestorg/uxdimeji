"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useScrollProgress } from "./scrollReveal";
import styles from "./V2Footer.module.css";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uiuxoladimeji/", analytics: "Social: LinkedIn (uiuxoladimeji)" },
  { label: "X", href: "https://x.com/uxdimeji", analytics: "Social: X / Twitter (@uxdimeji)" },
  { label: "Instagram", href: "https://www.instagram.com/uxdimeji", analytics: "Social: Instagram (@uxdimeji)" },
  { label: "TikTok", href: "https://www.tiktok.com/@uxdimeji", analytics: "Social: TikTok (@uxdimeji)" },
];

const WORDMARK = "OLADIMEJI";
// Flux's width axis runs 300–900 and glyph advance grows linearly with it. Keeping the
// sum of widths fixed keeps the wordmark's total width fixed while letters trade space.
const MIN_W = 300;
const MAX_W = 900;
const AVG_W = 500;

function useAccordionWordmark(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const mark = ref.current;
    if (!mark || !document.documentElement.hasAttribute("data-build-animate")) return;
    const letters = Array.from(mark.querySelectorAll<HTMLSpanElement>("span"));
    const n = letters.length;
    const budget = (AVG_W - MIN_W) * n;
    const current = letters.map(() => AVG_W);
    let pointer: number | null = null;
    let visible = false;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      // Focus follows the pointer, or drifts across the name on its own.
      const focus = pointer ?? (Math.sin((now - start) / 2200) * 0.5 + 0.5) * (n - 1);
      const pull = letters.map((_, i) => Math.exp(-((i - focus) ** 2) / 2.2));
      const total = pull.reduce((sum, p) => sum + p, 0);
      letters.forEach((letter, i) => {
        const target = Math.min(MAX_W, MIN_W + (budget * pull[i]) / total);
        current[i] += (target - current[i]) * 0.12;
        letter.style.fontVariationSettings = `"wdth" ${current[i].toFixed(1)}`;
      });
      frame = visible ? requestAnimationFrame(tick) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    observer.observe(mark);

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = mark.getBoundingClientRect();
      pointer = Math.min(n - 1, Math.max(0, ((event.clientX - rect.left) / rect.width) * n - 0.5));
    };
    const leave = () => {
      pointer = null;
    };
    mark.addEventListener("pointermove", move);
    mark.addEventListener("pointerleave", leave);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      mark.removeEventListener("pointermove", move);
      mark.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
}

export default function V2Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  // 0 when the footer's top enters the viewport, 1 when its bottom reaches the bottom edge.
  useScrollProgress(footerRef, { start: 1, end: 1 });
  useAccordionWordmark(markRef);

  return (
    <footer ref={footerRef} className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.sign}>
          <strong>Oladimeji Abubakar</strong>
          <span>Product designer who ships. Kwara, Nigeria.</span>
        </div>

        <nav className={styles.column} aria-label="Social profiles">
          <span>Elsewhere</span>
          {SOCIALS.map(({ label, href, analytics }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-analytics-label={analytics}>
              {label}
            </a>
          ))}
        </nav>

        <nav className={styles.column} aria-label="Site">
          <span>Site</span>
          <Link href="/blog" data-analytics-label="Navigation: Writing / Blog">
            Writing
          </Link>
          <Link href="/playground" data-analytics-label="Navigation: Playground">
            Playground
          </Link>
          <a
            href="https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="file_download"
            data-analytics-label="Read CV / Resume (Google Drive)"
          >
            Read CV
          </a>
        </nav>

        <a href="#top" className={styles.backTop} aria-label="Back to top">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <path id="footer-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text>
              <textPath href="#footer-ring" textLength="236" lengthAdjust="spacing">
                BACK TO TOP • BACK TO TOP • BACK TO TOP •
              </textPath>
            </text>
          </svg>
          <ArrowUp aria-hidden="true" />
        </a>
      </div>

      {/* Accordion wordmark: letters trade width around the pointer (or a slow drift). */}
      <div ref={markRef} className={styles.wordmark} aria-hidden="true">
        {WORDMARK.split("").map((letter, i) => (
          <span key={i} style={{ "--i": i } as React.CSSProperties}>
            {letter}
          </span>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>
          &copy; <span data-year>{new Date().getFullYear()}</span> Oladimeji Abubakar
        </span>
        <span>Designed in Figma, built in code</span>
      </div>
    </footer>
  );
}
