"use client";

import { useEffect, useRef } from "react";
import styles from "./V2Hero.module.css";

// Canvas backdrop: rulers and a dot field that lights up around the pointer, like
// hovering over a design-tool canvas. Pointer tracking runs on the parent section.
export default function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = ref.current;
    const section = backdrop?.parentElement;
    if (!backdrop || !section) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      backdrop.style.setProperty("--mx", `${x}px`);
      backdrop.style.setProperty("--my", `${y}px`);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const bounds = section.getBoundingClientRect();
      x = event.clientX - bounds.left;
      y = event.clientY - bounds.top;
      backdrop.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const leave = () => {
      backdrop.dataset.active = "false";
    };

    section.addEventListener("pointermove", move);
    section.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", move);
      section.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div ref={ref} className={styles.backdrop} data-active="false" aria-hidden="true">
      <span className={`${styles.aura} ${styles.auraGreen}`} />
      <span className={`${styles.aura} ${styles.auraPink}`} />
      <span className={`${styles.aura} ${styles.auraYellow}`} />
      <span className={styles.dotField} />
      <span className={`${styles.dotField} ${styles.dotSpotlight}`} />
      <span className={styles.rulerTop} />
      <span className={`${styles.rulerTop} ${styles.rulerBottom}`} />
      <span className={styles.rulerLeft} />
      <span className={`${styles.rulerLeft} ${styles.rulerRight}`} />
    </div>
  );
}
