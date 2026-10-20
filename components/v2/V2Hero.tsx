"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Linkedin,
  Instagram,
  Music2,
  FileText,
} from "lucide-react";
import styles from "./V2Hero.module.css";
import AgentAssembly from "./AgentAssembly";

/* ─── Social & Resume Links ─────────────────────────────── */
const socialLinks = [
  {
    label: "Resume",
    href: "https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing",
    icon: FileText,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/uiuxoladimeji/",
    icon: Linkedin,
  },
  {
    label: "X",
    href: "https://x.com/uxdimeji",
    icon: null,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/uxdimeji",
    icon: Instagram,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@uxdimeji",
    icon: Music2,
  },
];

/* ─── Live Clock ────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div className={styles.liveClock}>{time || "7:00:00 PM"}</div>;
}

/* ─── Figma 8 Selection Handles ─────────────────────────── */
const selectionHandles = [
  { top: -4, left: -4 },
  { top: -4, left: "calc(50% - 4px)" },
  { top: -4, right: -4 },
  { top: "calc(50% - 4px)", right: -4 },
  { bottom: -4, right: -4 },
  { bottom: -4, left: "calc(50% - 4px)" },
  { bottom: -4, left: -4 },
  { top: "calc(50% - 4px)", left: -4 },
];

/* ─── Decorative SVGs ───────────────────────────────────── */
function GreenSwirlIcon() {
  return (
    <span className={styles.iconWrapper} aria-hidden="true" data-build-fragment>
      <svg
        className={styles.inlineIcon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="10" stroke="#2eb67d" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="6" stroke="#2eb67d" strokeWidth="2" />
        <circle cx="12" cy="12" r="2.5" fill="#2eb67d" />
      </svg>
    </span>
  );
}

function PinkFlowerIcon() {
  return (
    <span className={styles.iconWrapper} aria-hidden="true" data-build-fragment>
      <svg
        className={styles.inlineIcon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="12" r="3.5" fill="#e01e5a" />
        <circle cx="12" cy="4" r="2.5" fill="#e01e5a" />
        <circle cx="12" cy="20" r="2.5" fill="#e01e5a" />
        <circle cx="4" cy="12" r="2.5" fill="#e01e5a" />
        <circle cx="20" cy="12" r="2.5" fill="#e01e5a" />
        <circle cx="6.3" cy="6.3" r="2.3" fill="#e01e5a" />
        <circle cx="17.7" cy="17.7" r="2.3" fill="#e01e5a" />
        <circle cx="6.3" cy="17.7" r="2.3" fill="#e01e5a" />
        <circle cx="17.7" cy="6.3" r="2.3" fill="#e01e5a" />
      </svg>
    </span>
  );
}

function YellowCursor() {
  return (
    <svg
      className={styles.yellowCursorSvg}
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 2L17.5 10.5L9.5 12.5L6 19.5L2.5 2Z"
        fill="#fbb03b"
        stroke="#181816"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinkCursor() {
  return (
    <svg
      className={styles.pinkCursorSvg}
      viewBox="0 0 20 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 2L17.5 10.5L9.5 12.5L6 19.5L2.5 2Z"
        fill="#e01e5a"
        stroke="#181816"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UnderlineSketch() {
  return (
    <svg
      className={styles.sketchUnderline}
      data-build-fragment
      viewBox="0 0 70 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 3C22 1.5 48 2 68 3.5"
        pathLength="1" strokeDasharray="1" data-build-stroke
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 6.5C26 5 44 5.5 62 6.5"
        pathLength="1" strokeDasharray="1" data-build-stroke
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BuildWords({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, index) =>
    /^\s+$/.test(part) ? part : <span key={index} data-build-fragment>{part}</span>
  );
}

/* ─── Main Hero Component ───────────────────────────────── */
export default function V2Hero() {
  return (
    <AgentAssembly as="section" className={styles.heroCanvas} id="top" variant="hero">
      {/* ── Center Stage ── */}
      <div className={styles.centerStage}>
        <div className={styles.introGroup} data-build-piece="Intro / handwritten" data-build-kind="intro">
          {/* Live Clock */}
          <div className={styles.liveClockWrapper} data-build-fragment>
            <LiveClock />
          </div>

          {/* "hello, I am" handwriting text */}
          <div className={styles.nameHeader}>
            <span className={styles.nameHeaderHand}><BuildWords text="hello, I am" /></span>
            <UnderlineSketch />
          </div>
        </div>

        {/* Figma Selection Box Container */}
        <div className={styles.selectionWrapper} data-build-piece="Identity / Oladimeji" data-build-kind="identity">
          {/* Avatar Bubble - Left (Portrait) */}
          <div className={styles.avatarBubbleLeft} data-build-fragment>
            <div className={styles.avatarCirclePhoto}>
              <Image
                src="/images/oladimeji.png"
                alt="Oladimeji Abubakar"
                width={34}
                height={34}
                className={styles.avatarHeroPhoto}
              />
            </div>
            <div className={styles.bubbleTailLeft} />
          </div>

          {/* Figma Selection Box */}
          <div className={styles.figmaBox}>
            {selectionHandles.map((pos, idx) => (
              <div
                key={idx}
                className={styles.figmaHandle}
                style={pos as React.CSSProperties}
              />
            ))}
            <h1 className={styles.designerName} aria-label="Oladimeji">
              {"OLADIMEJI".split("").map((letter, index) => (
                <span key={index} data-build-fragment aria-hidden="true">{letter}</span>
              ))}
            </h1>
          </div>

          {/* Avatar Bubble - Right (UX) */}
          <div className={styles.avatarBubbleRight} data-build-fragment>
            <div className={styles.avatarCircle}>
              <span>UX</span>
            </div>
            <div className={styles.bubbleTailRight} />
          </div>
        </div>

        {/* Status Line: Cyan Dot + Text */}
        <div className={styles.statusRow} data-build-piece="Availability" data-build-kind="status">
          <span className={styles.statusDot} />
          <span className={styles.statusText}>
            CURRENTLY OPEN TO ROLES
          </span>
        </div>
      </div>

      {/* ── Floating Badge 1: PRODUCT DESIGNER ── */}
      <div className={styles.badgeProductDesignerWrapper} data-build-piece="Role / product designer" data-build-kind="role">
        <div className={styles.badgeProductDesigner}>
          <span className={styles.badgeText}>PRODUCT DESIGNER</span>
          <YellowCursor />
        </div>
      </div>

      {/* ── Floating Badge 2: KWARA, NIGERIA ── */}
      <div className={styles.badgeLocationWrapper} data-build-piece="Location / Nigeria" data-build-kind="location">
        <div className={styles.badgeLocation}>
          <PinkCursor />
          <span className={styles.badgeLocationText}>KWARA, NIGERIA</span>
        </div>
      </div>

      {/* ── Bottom Section: Headline Copy + WORK WITH ME + Socials ── */}
      <div className={styles.bottomSection}>
        {/* 2-line balanced tagline */}
        <h2 className={styles.taglineHeading} data-build-piece="What I do" data-build-kind="copy">
          <span className={styles.taglineRow}>
            <span><BuildWords text="I design" /></span>
            <GreenSwirlIcon />
            <span data-build-fragment>products,</span>
          </span>
          <span className={styles.taglineRow}>
            <span><BuildWords text="and help bring them to life" /></span>
            <PinkFlowerIcon />
            <span className={styles.taglinePeriod} data-build-fragment>.</span>
          </span>
        </h2>

        {/* CTA + Socials Row */}
        <div className={styles.actionsRow} data-build-piece="Connect / ready" data-build-kind="actions">
          {/* WORK WITH ME CTA Button */}
          <a
            href="mailto:oladimejiuiux@gmail.com"
            className={styles.contactButton}
            aria-label="Work with Oladimeji Abubakar"
            data-build-fragment
          >
            <div className={styles.contactIconSquare}>
              <span className={styles.contactChevron}>»</span>
            </div>
            <span className={styles.contactButtonText}>WORK WITH ME</span>
          </a>

          {/* Rounded Social & Resume Links */}
          <nav className={styles.socialNav} aria-label="Social profiles and resume">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={styles.socialBtn}
                data-build-fragment
              >
                {Icon ? (
                  <Icon size={15} strokeWidth={1.8} />
                ) : (
                  <b aria-hidden>𝕏</b>
                )}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </AgentAssembly>
  );
}
