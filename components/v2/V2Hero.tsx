"use client";

import { ArrowUpRight, Instagram, Linkedin, Music2 } from "lucide-react";
import styles from "./V2Hero.module.css";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/uiuxoladimeji/", icon: Linkedin },
  { label: "X", href: "https://x.com/uxdimeji", icon: null },
  { label: "Instagram", href: "https://www.instagram.com/uxdimeji", icon: Instagram },
  { label: "TikTok", href: "https://www.tiktok.com/@uxdimeji", icon: Music2 },
];

export default function V2Hero() {
  const jumpToSelectedWork = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const section = document.getElementById("work");
    if (!section) return;
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, section.offsetTop);
    window.history.pushState(null, "", "#work");
    requestAnimationFrame(() => { root.style.scrollBehavior = previousBehavior; });
  };

  return (
    <section className={`hero ${styles.hero}`} id="top">
      <div className={`hero-copy ${styles.copy}`}>
        <div className={`hero-index reveal ${styles.badge}`}>
          <span>Independent product designer</span>
          <span>5 years in practice</span>
        </div>
        <h1 className={`reveal ${styles.title}`}>
          <span className="hero-line hero-line-primary"><span className={`hero-line-inner ${styles.glitchLine}`} data-text="Hi, I'm Oladimeji. I design products,">Hi, I&apos;m Oladimeji. I design products,</span></span>
          <span className="hero-line hero-line-secondary"><span className={`hero-line-inner ${styles.glitchLine}`} data-text="and help bring them to life.">and help bring them to life.</span></span>
        </h1>
        <div className={`hero-support reveal ${styles.support}`}>
          <p>With over half a decade of experience, I design products that not only look good, but also deliver the best possible experience for users, from Figma all the way through development.</p>
          <div className={`hero-actions ${styles.actions}`}>
            <a className={`hero-work-link ${styles.primaryAction}`} href="#work" onClick={jumpToSelectedWork}>View selected work <span className="arrow-icon arrow-down" aria-hidden="true" /></a>
            <a className={`hero-cv-button ${styles.secondaryAction}`} href="https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing" target="_blank" rel="noopener noreferrer">Read CV <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <nav className={`hero-socials ${styles.socials}`} aria-label="Social profiles">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} key={label}>
                {Icon ? <Icon aria-hidden="true" /> : <b aria-hidden="true">X</b>}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
