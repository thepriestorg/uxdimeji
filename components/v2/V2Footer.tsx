"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ReceiptPrinter from "./ReceiptPrinter";
import { RECEIPT_EMAIL as EMAIL, type Receipt, type ReceiptLine } from "./receipt";
import styles from "./V2Footer.module.css";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/uiuxoladimeji/",
    analytics: "Social: LinkedIn (uiuxoladimeji)",
  },
  { label: "X", href: "https://x.com/uxdimeji", analytics: "Social: X / Twitter (@uxdimeji)" },
  { label: "Instagram", href: "https://www.instagram.com/uxdimeji", analytics: "Social: Instagram (@uxdimeji)" },
  { label: "TikTok", href: "https://www.tiktok.com/@uxdimeji", analytics: "Social: TikTok (@uxdimeji)" },
];

/* ─── Visit ledger ──────────────────────────────────────────
   Parts of the site the receipt itemises. Time goes to whichever item sits across the
   middle of the viewport; sub-items (single projects) count inside their parent. */
type ItemDef = { selector: string; label: string | ((el: Element) => string | null | undefined); sub?: boolean };
const ITEMS: ItemDef[] = [
  { selector: "#top[data-assembly]", label: "Hero" },
  { selector: "#work", label: "Selected work" },
  { selector: "#work .project-row", label: (el) => el.querySelector("h3")?.textContent, sub: true },
  { selector: "#interface-title", label: "UI lab" },
  { selector: "#about", label: "Profile" },
  { selector: ".blog-stream-container", label: "Writing" },
  { selector: ".article-reader-container", label: (el) => el.querySelector("h1")?.textContent },
  { selector: "#comments", label: "Comments" },
  { selector: '[aria-label="Interface studies"]', label: "Interface studies" },
  { selector: "footer[data-receipt]", label: "This footer" },
];

type Entry = ReceiptLine & { order: number };

function useVisitLedger() {
  const ledger = useRef({ entries: new Map<Element, Entry>(), wander: 0 });

  useEffect(() => {
    const { entries } = ledger.current;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(1000, now - last);
      last = now;
      if (document.hidden) return;
      const middle = innerHeight / 2;
      let counted = false;
      ITEMS.forEach(({ selector, label, sub = false }) => {
        document.querySelectorAll(selector).forEach((el) => {
          let entry = entries.get(el);
          if (!entry) {
            const name = (typeof label === "string" ? label : label(el))?.trim();
            if (!name) return;
            entry = { label: name, sub, ms: 0, order: entries.size };
            entries.set(el, entry);
          }
          const rect = el.getBoundingClientRect();
          if (rect.top > middle || rect.bottom < middle) return;
          entry.ms += elapsed;
          if (!sub) counted = true;
        });
      });
      if (!counted) ledger.current.wander += elapsed;
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // A frozen copy of the visit so far, for printing.
  return (): Receipt => {
    const all = Array.from(ledger.current.entries.values()).sort((a, b) => a.order - b.order);
    const subs = all
      .filter((entry) => entry.sub && entry.ms >= 1000)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 3);
    const lines: ReceiptLine[] = all.filter((entry) => !entry.sub || subs.includes(entry));
    const wander = ledger.current.wander;
    if (wander >= 1000) lines.push({ label: "Scrolling around", sub: false, ms: wander });
    const now = new Date();
    const zone = { timeZone: "Africa/Lagos" } as const;
    return {
      order: String(1000 + Math.floor(Math.random() * 9000)),
      date: now.toLocaleDateString("en-GB", { ...zone, day: "2-digit", month: "short", year: "numeric" }).toUpperCase(),
      time: now.toLocaleTimeString("en-US", { ...zone, hour: "numeric", minute: "2-digit" }),
      lines,
      total: lines.filter((line) => !line.sub).reduce((sum, line) => sum + line.ms, 0),
    };
  };
}

export default function V2Footer() {
  const snapshot = useVisitLedger();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(EMAIL).then(
      () => setCopied(true),
      () => {},
    );
  };

  return (
    <footer className={styles.footer} data-receipt>
      <div className={styles.main}>
        <div className={styles.sign}>
          <p className={styles.tagline}>
            Product designer
            <br />
            who <em>ships.</em>
          </p>

          <div className={styles.contact}>
            <span className={styles.label}>Got something worth shipping?</span>
            <a
              className={styles.email}
              href={`mailto:${EMAIL}`}
              data-analytics-label={`Footer: Email Link Click (${EMAIL})`}
            >
              {EMAIL}
              <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className={styles.copy} onClick={copy}>
              {copied ? "Copied ✓" : "Copy email"}
            </button>
          </div>

          <p className={styles.where}>
            Based in Kwara, Nigeria. Working worldwide. Available for select collaborations.
          </p>

          <div className={styles.links}>
            <nav aria-label="Social profiles">
              <span className={styles.label}>Elsewhere</span>
              {SOCIALS.map(({ label, href, analytics }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" data-analytics-label={analytics}>
                  {label}
                </a>
              ))}
            </nav>
            <nav aria-label="Site">
              <span className={styles.label}>Around here</span>
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
          </div>
        </div>

        {/* Prints a receipt of this visit when it comes into view. */}
        <div className={styles.printerSlot}>
          <ReceiptPrinter snapshot={snapshot} />
        </div>
      </div>

      <div className={styles.bottom}>
        <span>
          &copy; <span data-year>{new Date().getFullYear()}</span> Oladimeji Abubakar
        </span>
        <a href="#top">Back to top ↑</a>
        <span>Designed in Figma, built in code</span>
      </div>
    </footer>
  );
}
