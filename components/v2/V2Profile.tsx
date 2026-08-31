"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { trackCustomEvent } from "@/components/AnalyticsTracker";
import GithubActivity from "./GithubActivity";
import styles from "./V2Profile.module.css";

/* ─── Blue Verified Checkmark Badge SVG ─────────────────── */
function VerifiedBadge() {
  return (
    <svg
      className={styles.verifiedBadge}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified Designer"
    >
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
        fill="#0099ff"
      />
      <path
        d="M10.2 16.2L6 12l1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4-7.8 7.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

/* ─── Real Nigeria Flag Graphic SVG ─────────────────────── */
function NigeriaFlag() {
  return (
    <svg
      className={styles.flagSvg}
      viewBox="0 0 30 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Nigeria Flag"
    >
      <rect width="30" height="20" rx="2.5" fill="#ffffff" />
      <rect width="10" height="20" rx="2.5" fill="#008751" />
      <rect x="20" width="10" height="20" rx="2.5" fill="#008751" />
      <rect
        x="0.5"
        y="0.5"
        width="29"
        height="19"
        rx="2"
        stroke="rgba(0,0,0,0.12)"
      />
    </svg>
  );
}

/* ─── Inline Figma Logo Badge SVG ───────────────────────── */
function InlineFigmaBadge() {
  return (
    <svg
      className={styles.figmaInlineSvg}
      viewBox="0 0 38 57"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Figma"
    >
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  );
}

/* ─── Inline Code Terminal Badge SVG ────────────────────── */
function InlineCodeBadge() {
  return (
    <svg
      className={styles.codeInlineSvg}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Code"
    >
      <rect width="22" height="22" rx="6" fill="#181816" />
      <rect
        x="0.5"
        y="0.5"
        width="21"
        height="21"
        rx="5.5"
        stroke="rgba(255,255,255,0.12)"
      />
      <path
        d="M7 8L4.5 11L7 14M15 8L17.5 11L15 14M12.5 6.5L9.5 15.5"
        stroke="#38bdf8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Official Real Tool Vector Logos ───────────────────── */
function FigmaLogo() {
  return (
    <svg
      viewBox="0 0 38 57"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Figma"
    >
      <path
        d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
        fill="#1ABCFE"
      />
      <path
        d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
        fill="#0ACF83"
      />
      <path
        d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
        fill="#FF7262"
      />
      <path
        d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
        fill="#F24E1E"
      />
      <path
        d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
        fill="#A259FF"
      />
    </svg>
  );
}

function GithubLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="GitHub"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  );
}

function ChatGPTLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ChatGPT"
    >
      <path
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
        fill="#10A37F"
      />
    </svg>
  );
}

function ClaudeLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Claude"
    >
      <path
        d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z"
        fill="#D97706"
      />
    </svg>
  );
}

function FramerLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Framer"
    >
      <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
    </svg>
  );
}

function VSCodeLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VS Code"
    >
      <path
        d="M17.6 2.2L11.3 8.3 6.9 4.9 3.5 6.5l3.2 5.5-3.2 5.5 3.4 1.6 4.4-3.4 6.3 6.1 5.9-2.9V5.1l-5.9-2.9zm1.9 15.4l-5-4.8 5-4.8v9.6z"
        fill="#007ACC"
      />
    </svg>
  );
}

/* ─── Stack Tools List ──────────────────────────────────── */
const stackTools = [
  { name: "Figma", icon: FigmaLogo },
  { name: "Framer", icon: FramerLogo },
  { name: "VS Code", icon: VSCodeLogo },
  { name: "Claude", icon: ClaudeLogo },
  { name: "ChatGPT", icon: ChatGPTLogo },
  { name: "GitHub", icon: GithubLogo },
];

/* ─── Bio Description Story Tokens ──────────────────────── */
type BioToken =
  | { type: "text"; content: string }
  | { type: "flag" }
  | { type: "figma" }
  | { type: "code" };

const bioTokens: BioToken[] = [
  { type: "text", content: "Hey, I'm Oladimeji, a product designer based in Kwara, Nigeria" },
  { type: "flag" },
  { type: "text", content: ". With over half a decade of experience, I design products that look good, feel great, and are easy to use. I don't stop at Figma, I can take your idea from conception, through Figma" },
  { type: "figma" },
  { type: "text", content: ", and all the way to code" },
  { type: "code" },
  { type: "text", content: "." },
];

const TOTAL_BIO_LENGTH = bioTokens.reduce((acc, token) => {
  return acc + (token.type === "text" ? token.content.length : 1);
}, 0);

export default function V2Profile() {
  const [copied, setCopied] = useState(false);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [revealedChars, setRevealedChars] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const email = "oladimejiuiux@gmail.com";

  const handleCopy = useCallback((triggerType: "click" | "keyboard_c" = "click") => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email);
      setCopied(true);
      trackCustomEvent("outbound_click", {
        label: "Copied Email (Press C / Click)",
        action: "copy_email",
        trigger: triggerType,
        email,
      });
      setTimeout(() => setCopied(false), 2400);
    }
  }, [email]);

  /* ── 100% Bulletproof Mobile & Desktop Viewport Observer ── */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      setRevealedChars(TOTAL_BIO_LENGTH);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setRevealedChars(0);
        }
      },
      {
        threshold: 0.25,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Fast, Punchy Character-by-Character Typewriter ── */
  useEffect(() => {
    if (!isVisible) return;

    const delayTimer = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count = Math.min(count + 5, TOTAL_BIO_LENGTH);
        setRevealedChars(count);
        if (count >= TOTAL_BIO_LENGTH) {
          clearInterval(interval);
        }
      }, 12);

      return () => clearInterval(interval);
    }, 100);

    return () => clearTimeout(delayTimer);
  }, [isVisible]);

  /* ── Keyboard Copy Shortcut ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        if (!e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          setIsKeyPressed(true);
          handleCopy("keyboard_c");
          setTimeout(() => setIsKeyPressed(false), 300);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopy]);

  const isTypingDone = revealedChars >= TOTAL_BIO_LENGTH;

  // Helper to render tokens progressively up to revealedChars
  let charCounter = 0;

  return (
    <section
      ref={sectionRef}
      className={styles.profileSection}
      id="about"
      aria-label="About Me"
    >
      <div className={styles.profileContainer}>
        {/* ── Section Header ── */}
        <div
          className={`${styles.sectionHeader} ${
            isVisible ? styles.visible : ""
          }`}
        >
          <span>ABOUT ME</span>
        </div>

        {/* ── Avatar with Live Online Status ── */}
        <div
          className={`${styles.avatarWrapper} ${
            isVisible ? styles.visible : ""
          }`}
        >
          <div className={styles.avatar}>
            <Image
              src="/images/oladimeji.png"
              alt="Oladimeji Abubakar"
              width={74}
              height={74}
              className={styles.avatarImage}
              priority
            />
          </div>
          <span className={styles.onlineDot} aria-label="Online" />
        </div>

        {/* ── Name & Verified Badge ── */}
        <div
          className={`${styles.nameRow} ${isVisible ? styles.visible : ""}`}
        >
          <h2 className={styles.name}>Oladimeji Abubakar</h2>
          <VerifiedBadge />
        </div>

        {/* ── Role Title ── */}
        <p className={`${styles.role} ${isVisible ? styles.visible : ""}`}>
          Product Designer
        </p>

        {/* ── Bio Paragraph (Natural Flow & Preserved Spacing) ── */}
        <p className={styles.bioText}>
          {bioTokens.map((token, idx) => {
            if (token.type === "text") {
              const start = charCounter;
              const len = token.content.length;
              charCounter += len;

              if (revealedChars <= start) {
                return null;
              }

              const visibleSlice = token.content.slice(
                0,
                Math.max(0, revealedChars - start)
              );

              return (
                <span key={idx} className={styles.animatedWord}>
                  {visibleSlice}
                </span>
              );
            }

            // Inline badge tokens (flag, figma, code)
            const badgeIndex = charCounter;
            charCounter += 1;

            if (revealedChars < badgeIndex) {
              return null;
            }

            if (token.type === "flag") {
              return (
                <span key={idx} className={styles.inlineBadge}>
                  <NigeriaFlag />
                </span>
              );
            }

            if (token.type === "figma") {
              return (
                <span key={idx} className={styles.inlineBadge}>
                  <InlineFigmaBadge />
                </span>
              );
            }

            if (token.type === "code") {
              return (
                <span key={idx} className={styles.inlineBadge}>
                  <InlineCodeBadge />
                </span>
              );
            }

            return null;
          })}

          {isVisible && !isTypingDone && (
            <span className={styles.typingCursor} aria-hidden="true" />
          )}
        </p>

        {/* ── Press C to copy email Widget ── */}
        <div
          className={`${styles.copyActionRow} ${
            isVisible ? styles.visible : ""
          }`}
          onClick={handleCopy}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleCopy()}
          aria-label="Click or press C to copy email to clipboard"
        >
          <span>Press</span>
          <kbd
            className={`${styles.kbd} ${isKeyPressed ? styles.kbdActive : ""}`}
          >
            C
          </kbd>
          <span>to copy my email</span>

          {copied && (
            <div className={styles.toast} role="status">
              Copied to clipboard! 📋
            </div>
          )}
        </div>

        {/* ── Stack & Activity Subsection ── */}
        <div
          className={`${styles.stackSection} ${
            isVisible ? styles.visible : ""
          }`}
        >
          <p className={styles.stackHeader}>STACK &amp; ACTIVITY</p>
          <div className={styles.stackDock}>
            {stackTools.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className={styles.stackIconTile}
                title={name}
                aria-label={name}
              >
                <Icon />
                <span className={styles.stackTooltip}>{name}</span>
              </div>
            ))}
          </div>

          <GithubActivity />
        </div>
      </div>
    </section>
  );
}
