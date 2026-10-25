"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./V2Footer.module.css";

const EMAIL = "oladimejiuiux@gmail.com";

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

type Entry = { label: string; sub: boolean; ms: number; order: number };
type Line = { label: string; sub: boolean; ms: number };
type Receipt = { order: string; date: string; time: string; lines: Line[]; total: number };

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
    const lines: Line[] = all.filter((entry) => !entry.sub || subs.includes(entry));
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

const clock = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
// Barcode bars derived from the email address, so it is stable and unique to it.
const BARS = Array.from(EMAIL)
  .flatMap((char, i) => {
    const code = char.charCodeAt(0);
    return [
      { w: (code % 3) + 1, gap: ((code >> 2) % 3) + 1 },
      { w: ((code + i) % 2) + 1, gap: 1 },
    ];
  })
  .reduce<{ x: number; w: number }[]>((bars, { w, gap }) => {
    const prev = bars[bars.length - 1];
    return [...bars, { x: prev ? prev.x + prev.w + gap : 0, w }];
  }, []);
const BARCODE_WIDTH = BARS[BARS.length - 1].x + BARS[BARS.length - 1].w;

function Barcode() {
  return (
    <svg className={styles.barcode} viewBox={`0 0 ${BARCODE_WIDTH} 40`} preserveAspectRatio="none" aria-hidden="true">
      {BARS.map((bar, i) => (
        <rect key={i} x={bar.x} width={bar.w} height="40" />
      ))}
    </svg>
  );
}

function Row({ label, value, sub = false }: { label: string; value: string; sub?: boolean }) {
  return (
    <p className={`${styles.row} ${sub ? styles.sub : ""}`}>
      <span>{sub ? `└ ${label}` : label}</span>
      <i aria-hidden="true" />
      <span>{value}</span>
    </p>
  );
}

type PrintState = "waiting" | "printing" | "done";

export default function V2Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const snapshot = useVisitLedger();
  const snapshotRef = useRef(snapshot);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [print, setPrint] = useState<PrintState>("waiting");
  const [copied, setCopied] = useState(false);
  const printTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  });

  const run = (reprint: boolean) => {
    printTimers.current.forEach(clearTimeout);
    const motion = document.documentElement.hasAttribute("data-build-animate");
    if (!motion) {
      setReceipt(snapshotRef.current());
      setPrint("done");
      return;
    }
    // A reprint pulls the old receipt back in before feeding a fresh one out.
    if (reprint) setPrint("waiting");
    printTimers.current = [
      setTimeout(
        () => {
          setReceipt(snapshotRef.current());
          setPrint("printing");
        },
        reprint ? 450 : 0,
      ),
      setTimeout(() => setPrint("done"), (reprint ? 450 : 0) + 2900),
    ];
  };
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

  // Prints once, the first time the receipt slot comes into view.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        runRef.current(false);
      },
      { threshold: 0.35 },
    );
    observer.observe(slot);
    const timers = printTimers.current;
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

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
    <footer ref={footerRef} className={styles.footer} data-receipt data-print={print}>
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

        {/* The receipt prints out of the slot when it comes into view, itemising this visit. */}
        <div className={styles.printer}>
          <div className={styles.slot} ref={slotRef}>
            <i className={styles.led} aria-hidden="true" />
            <span aria-hidden="true">RCPT-01</span>
            <button type="button" className={styles.reprint} onClick={() => run(true)} disabled={print === "printing"}>
              ↻ Reprint
            </button>
          </div>
          <div className={styles.feed}>
            <div className={styles.sheet}>
              <div className={styles.paper}>
                <div className={styles.head}>
                  <strong>Oladimeji Abubakar</strong>
                  <span>Product designer who ships</span>
                  <span>Kwara, Nigeria · WAT</span>
                </div>
                <hr />
                <Row label={`Order #${receipt?.order ?? "----"}`} value={receipt?.date ?? "--"} />
                <Row label="Visitor: you" value={receipt?.time ?? "--:--"} />
                <hr />
                <Row label="Item" value="Time" />
                {receipt ? (
                  receipt.lines.map((line, i) => (
                    <Row
                      key={i}
                      label={line.label}
                      sub={line.sub}
                      value={line.ms < 1000 ? "skipped" : clock(line.ms)}
                    />
                  ))
                ) : (
                  <Row label="Your visit" value="--:--" />
                )}
                <hr />
                <Row label="Total attention" value={receipt ? clock(receipt.total) : "--:--"} />
                <Row label="Paid with" value="Curiosity" />
                <Row label="Status" value="Shipped" />
                <hr />
                <p className={styles.center}>Questions about your order?</p>
                <a className={styles.reply} href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
                <hr />
                <Barcode />
                <p className={styles.center}>
                  Thank you for scrolling
                  <br />
                  No refunds. Ideas: always.
                </p>
                <span className={styles.stamp} aria-hidden="true">
                  Shipped
                </span>
              </div>
            </div>
          </div>
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
