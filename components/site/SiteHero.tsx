"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, FileText, Instagram, Linkedin, Music2 } from "lucide-react";
import { trackCustomEvent } from "@/components/AnalyticsTracker";
import { InlineCodeBadge, InlineFigmaBadge, NigeriaFlag, VerifiedBadge } from "./Badges";
import styles from "./SiteHero.module.css";

const EMAIL = "oladimejiuiux@gmail.com";
const RESUME = "https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing";

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uiuxoladimeji/", icon: Linkedin },
  { label: "X", href: "https://x.com/uxdimeji", icon: null },
  { label: "Instagram", href: "https://www.instagram.com/uxdimeji", icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@uxdimeji", icon: Music2 },
];

// Local time where Oladimeji is, so visitors know when a reply is likely.
function LocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Lagos" });
    const update = () => setTime(format());
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);
  return <span suppressHydrationWarning>{time || "—"}</span>;
}

export default function SiteHero() {
  const [copied, setCopied] = useState(false);
  const [pressed, setPressed] = useState(false);

  const copyEmail = useCallback((trigger: "click" | "keyboard_c") => {
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    trackCustomEvent("outbound_click", { label: "Copied Email (Press C / Click)", action: "copy_email", trigger, email: EMAIL });
    setTimeout(() => setCopied(false), 2400);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if ((event.key === "c" || event.key === "C") && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setPressed(true);
        copyEmail("keyboard_c");
        setTimeout(() => setPressed(false), 250);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copyEmail]);

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <div className={styles.shell}>
        <div className={styles.idRow}>
          <div className={styles.identity}>
            <span className={styles.portrait}>
              <Image src="/images/oladimeji.jpg" alt="Oladimeji Abubakar" width={112} height={112} priority />
              <i className={styles.onlineDot} aria-hidden="true" />
            </span>
            <span>
              <span className={styles.nameRow}>
                <strong>Oladimeji Abubakar</strong>
                <VerifiedBadge className={styles.verified} />
              </span>
              <span className={styles.role}>Product designer who builds</span>
            </span>
          </div>

          <p className={styles.status}>
            <span className={styles.statusPill}><i aria-hidden="true" />Open to roles</span>
            <span className={styles.clock}>Kwara · <LocalTime /></span>
          </p>
        </div>

        <h1 className={styles.statement} id="hero-title">
          I design products,
          <br />
          <span>and help bring them to life.</span>
          <span className="sr-only"> Oladimeji Abubakar, Product Designer in Nigeria.</span>
          <span className={styles.note} aria-hidden="true">from Figma to code ↘</span>
        </h1>

        <p className={styles.bio}>
          I&apos;m a product designer in Kwara, Nigeria
          <NigeriaFlag className={styles.flag} />
          with over half a decade of shipping products that look good, feel great and are easy to use. I
          don&apos;t stop at Figma
          <InlineFigmaBadge className={styles.figma} />
          — I take ideas from the first sketch all the way to code
          <InlineCodeBadge className={styles.code} />. I hold a{" "}
          <strong>first-class BSc in Computer Science</strong> from Ojaja University, and I&apos;m currently
          working on my <strong>MSc</strong> at Al-Hikmah University.
        </p>

        <div className={styles.actions}>
          <a className={styles.primary} href={`mailto:${EMAIL}`}>
            Work with me <ArrowUpRight aria-hidden="true" />
          </a>
          <a className={styles.secondary} href={RESUME} target="_blank" rel="noopener noreferrer">
            <FileText aria-hidden="true" /> Résumé
          </a>
          <nav className={styles.socials} aria-label="Social profiles">
            {socials.map(({ label, href, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                {Icon ? <Icon aria-hidden="true" /> : <b aria-hidden="true">𝕏</b>}
              </a>
            ))}
          </nav>
          <button type="button" className={styles.copyHint} onClick={() => copyEmail("click")} aria-label="Copy email address">
            Press <kbd className={pressed ? styles.kbdPressed : undefined}>C</kbd> to copy my email
            {copied && <span className={styles.toast} role="status">Copied {EMAIL}</span>}
          </button>
        </div>
      </div>
    </section>
  );
}
