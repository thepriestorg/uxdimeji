"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

export default function V2Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    const frame = window.requestAnimationFrame(handleScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const headerClasses = [
    "site-header",
    scrolled ? "scrolled" : "",
    menuOpen ? "menu-active" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <header className={headerClasses}>
        <Link className="identity" href="/" aria-label="Oladimeji Abubakar, home">
          <strong>Oladimeji Abubakar</strong>
          <span>Product designer</span>
        </Link>
        <p className="header-status">
          <i />
          Kwara, Nigeria / Available worldwide
        </p>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#work">Work</Link>
          <Link href="/#about">Profile</Link>
          <Link href="/blog">Writing</Link>
          <a href="mailto:oladimejiuiux@gmail.com">Email</a>
        </nav>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      <nav
        className={`mobile-menu${menuOpen ? " open" : ""}`}
        id="mobile-menu"
        aria-label="Mobile navigation"
      >
        <Link href="/#work" onClick={closeMenu}>
          <span>01</span>Selected work
        </Link>
        <Link href="/#about" onClick={closeMenu}>
          <span>02</span>Profile
        </Link>
        <Link href="/blog" onClick={closeMenu}>
          <span>03</span>Writing
        </Link>
        <a href="mailto:oladimejiuiux@gmail.com" onClick={closeMenu}>
          <span>04</span>Get in touch
        </a>
      </nav>
    </>
  );
}
