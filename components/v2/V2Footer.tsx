"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { useScrollProgress } from "./scrollReveal";
import { useGravityWordmark } from "./useGravityWordmark";
import agentStyles from "./AgentAssembly.module.css";
import styles from "./V2Footer.module.css";

const SOCIALS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uiuxoladimeji/", analytics: "Social: LinkedIn (uiuxoladimeji)" },
  { label: "X", href: "https://x.com/uxdimeji", analytics: "Social: X / Twitter (@uxdimeji)" },
  { label: "Instagram", href: "https://www.instagram.com/uxdimeji", analytics: "Social: Instagram (@uxdimeji)" },
  { label: "TikTok", href: "https://www.tiktok.com/@uxdimeji", analytics: "Social: TikTok (@uxdimeji)" },
];

const WORDMARK = "OLADIMEJI";

// What the day probably looks like in Kwara, by local hour.
const STATUS: [number, string][] = [
  [6, "asleep, dreaming in auto layout"],
  [9, "making tea, opening Figma"],
  [13, "deep in a design file"],
  [14, "on lunch, back soon"],
  [18, "shipping something"],
  [22, "on a side project"],
  [24, "one more push before bed"],
];

function KwaraClock() {
  const [now, setNow] = useState<{ time: string; status: string } | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const update = () => {
      const parts = format.formatToParts(new Date());
      const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
      const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
      const time = `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
      setNow({ time, status: STATUS.find(([until]) => hour < until)?.[1] ?? "" });
    };
    update();
    const timer = setInterval(update, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className={styles.clock}>
      <span className={styles.pulse} aria-hidden="true" />
      <span>
        <strong>{now?.time ?? "--:--"}</strong> in Kwara
      </span>
      <span className={styles.status}>{now ? `probably ${now.status}` : " "}</span>
    </p>
  );
}

// A multiplayer-style name tag that follows the visitor's mouse around the footer.
function useVisitorTag(footerRef: React.RefObject<HTMLElement | null>, tagRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const footer = footerRef.current;
    const tag = tagRef.current;
    if (!footer || !tag || !document.documentElement.hasAttribute("data-build-animate")) return;
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = footer.getBoundingClientRect();
      tag.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0)`;
      tag.dataset.show = "";
    };
    const leave = () => delete tag.dataset.show;
    footer.addEventListener("pointermove", move);
    footer.addEventListener("pointerleave", leave);
    return () => {
      footer.removeEventListener("pointermove", move);
      footer.removeEventListener("pointerleave", leave);
    };
  }, [footerRef, tagRef]);
}

export default function V2Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  // 0 when the footer's top enters the viewport, 1 when its bottom reaches the bottom edge.
  useScrollProgress(footerRef, { start: 1, end: 1 });
  useVisitorTag(footerRef, tagRef);
  const { ready, loose, hint, undoKey, controls } = useGravityWordmark(footerRef, markRef, agentRef);

  return (
    <footer ref={footerRef} className={styles.footer}>
      <span className={styles.frameLabel} aria-hidden="true">
        <svg viewBox="0 0 12 12">
          <path d="M3.5 1v10M8.5 1v10M1 3.5h10M1 8.5h10" />
        </svg>
        Footer / The end
      </span>

      <div className={styles.board}>
        <div className={styles.intro}>
          <p className={styles.statement}>
            Product designer
            <br />
            who{" "}
            <span className={styles.ships}>
              ships.
              <svg className={styles.sea} viewBox="0 0 200 24" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 14c16-8 32-8 48 0s32 8 48 0 32-8 48 0 32 8 50 0" />
              </svg>
              <svg className={styles.boat} viewBox="0 0 40 32" aria-hidden="true">
                <path className={styles.sail} d="M19 1v19H5zM22 6v14h11z" />
                <path className={styles.hull} d="M1 22h38l-6 8H7z" />
              </svg>
            </span>
          </p>
          <div className={styles.meta}>
            <span className={styles.name}>Oladimeji Abubakar</span>
            <KwaraClock />
          </div>
        </div>

        <div className={styles.notes}>
          <nav className={`${styles.note} ${styles.noteYellow}`} aria-label="Social profiles" data-solid>
            <span className={styles.noteTitle}>find me elsewhere</span>
            {SOCIALS.map(({ label, href, analytics }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-analytics-label={analytics}>
                {label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>

          <nav className={`${styles.note} ${styles.noteCoral}`} aria-label="Site" data-solid>
            <span className={styles.noteTitle}>around here</span>
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
              <span aria-hidden="true">↗</span>
            </a>
          </nav>

          <a href="#top" className={styles.backTop} aria-label="Back to top" data-solid="circle">
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
      </div>

      {/* Physical wordmark: plain text until the engine loads, then every letter can be
          grabbed, thrown, swiped and tidied back (useGravityWordmark). */}
      <div ref={markRef} className={styles.wordmark} aria-hidden="true">
        {WORDMARK.split("").map((letter, i) => (
          <span key={i} data-letter style={{ "--i": i } as React.CSSProperties}>
            {letter}
          </span>
        ))}
        {ready && (
          <p className={styles.hint} data-show={hint || undefined}>
            oops. your turn, throw them around
            <svg viewBox="0 0 60 64" fill="none">
              <path d="M8 4C2 22 14 44 44 52" />
              <path d="M34 42l11 10-14 5" />
            </svg>
          </p>
        )}
      </div>

      {ready && (
        <div ref={agentRef} className={`${agentStyles.cursor} ${styles.agent}`} data-agent="3" aria-hidden="true">
          <i className={styles.ripple} data-agent-ripple />
          <svg width="22" height="25" viewBox="0 0 22 25" fill="none">
            <path d="M2 2 19 12 11 14 7 22 2 2Z" fill="currentColor" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span>
            <b data-agent-label>Agent / physics</b>
            <i />
          </span>
        </div>
      )}

      <span ref={tagRef} className={styles.visitor} aria-hidden="true">
        you
      </span>

      <div className={styles.bottom}>
        <span>
          &copy; <span data-year>{new Date().getFullYear()}</span> Oladimeji Abubakar
        </span>
        {ready && (
          <button type="button" className={styles.toggle} onClick={() => (loose ? controls.current.tidy() : controls.current.knock())}>
            {loose ? (
              <>
                Put it back <kbd>{undoKey}</kbd>
              </>
            ) : (
              "Knock it over"
            )}
          </button>
        )}
        <span>Designed in Figma, built in code</span>
      </div>
    </footer>
  );
}
