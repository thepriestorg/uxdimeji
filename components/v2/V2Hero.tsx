"use client";

import { ArrowUpRight, Instagram, Linkedin, Music2 } from "lucide-react";

const socialLinks = [
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

    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousBehavior;
    });
  };

  return (
    <section className="hero" id="top">
      <div className="hero-index reveal">
        <span>Independent product designer</span>
        <span>5 years in practice</span>
      </div>
      <div className="hero-copy">
        <h1 className="reveal">
          <span className="hero-line">
            <span className="hero-line-inner">
              I design how products <em>think, move,</em> and work.
            </span>
          </span>
        </h1>
        <div className="hero-support reveal">
          <p>
            I do not stop at Figma. I take products through strategy,
            interaction design, interface systems, and functional builds.
          </p>
          <div className="hero-actions">
            <a
              className="hero-work-link"
              href="#work"
              onClick={jumpToSelectedWork}
            >
              View selected work
              <span className="arrow-icon arrow-down" aria-hidden="true" />
            </a>
            <a
              className="hero-cv-button"
              href="https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read CV
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <nav className="hero-socials" aria-label="Social profiles">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                key={label}
              >
                {Icon ? <Icon aria-hidden="true" /> : <b aria-hidden="true">X</b>}
              </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="hero-capabilities reveal" aria-label="Core capabilities">
        <span>Product strategy</span>
        <span>UX and interaction</span>
        <span>Interface systems</span>
        <span>Functional builds</span>
      </div>
    </section>
  );
}
