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
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
        <Link className="identity" href="/" aria-label="Dimeji A., home">
          <strong>Dimeji A.</strong>
          <span>Product designer</span>
        </Link>
        <p className="header-status">
          <i />
          Lagos, Nigeria / Available worldwide
        </p>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">Profile</a>
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
        <a href="#work" onClick={closeMenu}>
          <span>01</span>Selected work
        </a>
        <a href="#about" onClick={closeMenu}>
          <span>02</span>Profile
        </a>
        <a href="mailto:oladimejiuiux@gmail.com" onClick={closeMenu}>
          <span>03</span>Get in touch
        </a>
      </nav>
    </>
  );
}
