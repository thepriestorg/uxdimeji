"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

const navigation = [
  { label: "Work", href: "/#work" },
  { label: "Profile", href: "/#about" },
  { label: "Writing", href: "/blog" },
];

export default function V2Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleScroll = useCallback(() => setScrolled(window.scrollY > 20), []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    const frame = window.requestAnimationFrame(handleScroll);
    return () => { window.cancelAnimationFrame(frame); window.removeEventListener("scroll", handleScroll); };
  }, [handleScroll]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const active = (href: string) => href === "/blog" ? pathname.startsWith("/blog") : href === "/#work" && pathname === "/";

  return (
    <>
      <header className={`site-header creative-header${scrolled ? " scrolled" : ""}${menuOpen ? " menu-active" : ""}`}>
        <div className="header-shell">
          <Link className="identity" href="/" aria-label="Oladimeji Abubakar, home">
            <span className="identity-wordmark" aria-hidden="true">oladimeji<span>.</span></span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link href={item.href} key={item.label} className={active(item.href) ? "active" : ""} aria-current={active(item.href) ? "page" : undefined}>{item.label}</Link>
            ))}
          </nav>

          <a className="header-contact" href="mailto:oladimejiuiux@gmail.com">Let&apos;s talk <ArrowUpRight aria-hidden="true" /></a>
          <button className="menu-button" type="button" aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span />
          </button>
        </div>
      </header>

      <nav className={`mobile-menu creative-mobile-menu${menuOpen ? " open" : ""}`} id="mobile-menu" aria-label="Mobile navigation">
        <div className="mobile-menu-links">
          {navigation.map((item, index) => (
            <Link href={item.href} onClick={closeMenu} key={item.label}><span>0{index + 1}</span>{item.label}</Link>
          ))}
        </div>
        <a className="mobile-contact" href="mailto:oladimejiuiux@gmail.com" onClick={closeMenu}>Start a conversation <ArrowUpRight aria-hidden="true" /></a>
      </nav>
    </>
  );
}
