"use client";

import { useEffect, useState } from "react";
import {
  Linkedin,
  Instagram,
  Music2,
  FileText,
} from "lucide-react";
import styles from "./V2Hero.module.css";

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
    <span className={styles.iconWrapper} aria-hidden="true">
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
    <span className={styles.iconWrapper} aria-hidden="true">
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
      viewBox="0 0 70 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 3C22 1.5 48 2 68 3.5"
        stroke="#181816"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 6.5C26 5 44 5.5 62 6.5"
        stroke="#181816"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Main Hero Component ───────────────────────────────── */
export default function V2Hero() {
  return (
    <section className={styles.heroCanvas} id="top">
      {/* ── Top-Left Sticker: Currently open to roles ── */}
      <div className={styles.stickerCurrentWrapper}>
        <div className={styles.stickerCurrent}>
          Currently open to roles
        </div>
      </div>

      {/* ── Center Stage ── */}
      <div className={styles.centerStage}>
        {/* Live Clock */}
        <div className={styles.liveClockWrapper}>
          <LiveClock />
        </div>

        {/* "my name is" handwriting text */}
        <div className={styles.nameHeader}>
          <span className={styles.nameHeaderHand}>my name is</span>
          <UnderlineSketch />
        </div>

        {/* Figma Selection Box Container */}
        <div className={styles.selectionWrapper}>
          {/* Avatar Bubble - Left (OA) */}
          <div className={styles.avatarBubbleLeft}>
            <div className={styles.avatarCircle}>
              <span>OA</span>
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
            <h1 className={styles.designerName}>OLADIMEJI</h1>
          </div>

          {/* Avatar Bubble - Right (UX) */}
          <div className={styles.avatarBubbleRight}>
            <div className={styles.avatarCircle}>
              <span>UX</span>
            </div>
            <div className={styles.bubbleTailRight} />
          </div>
        </div>

        {/* Status Line: Cyan Dot + Text */}
        <div className={styles.statusRow}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>
            AVAILABLE FOR THOUGHTFUL PROJECTS
          </span>
        </div>
      </div>

      {/* ── Floating Badge 1: PRODUCT DESIGNER ── */}
      <div className={styles.badgeProductDesignerWrapper}>
        <div className={styles.badgeProductDesigner}>
          <span className={styles.badgeText}>PRODUCT DESIGNER</span>
          <YellowCursor />
        </div>
      </div>

      {/* ── Floating Badge 2: KWARA, NIGERIA ── */}
      <div className={styles.badgeLocationWrapper}>
        <div className={styles.badgeLocation}>
          <PinkCursor />
          <span className={styles.badgeLocationText}>KWARA, NIGERIA</span>
        </div>
      </div>

      {/* ── Bottom Section: Headline Copy + WORK WITH ME + Socials ── */}
      <div className={styles.bottomSection}>
        {/* 2-line balanced tagline */}
        <h2 className={styles.taglineHeading}>
          <span className={styles.taglineRow}>
            <span>I design</span>
            <GreenSwirlIcon />
            <span>products,</span>
          </span>
          <span className={styles.taglineRow}>
            <span>and help bring them to life</span>
            <PinkFlowerIcon />
            <span className={styles.taglinePeriod}>.</span>
          </span>
        </h2>

        {/* CTA + Socials Row */}
        <div className={styles.actionsRow}>
          {/* WORK WITH ME CTA Button */}
          <a
            href="mailto:oladimejiuiux@gmail.com"
            className={styles.contactButton}
            aria-label="Work with Oladimeji Abubakar"
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
    </section>
  );
}
