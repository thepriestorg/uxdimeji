"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import styles from "./V2Header.module.css";

const navigation = [
  { label: "Work", href: "/#work" },
  { label: "Playground", href: "/playground" },
  { label: "Profile", href: "/#about" },
  { label: "Writing", href: "/blog" },
];

export default function V2Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/blog") return pathname.startsWith("/blog");
    if (href === "/playground") return pathname.startsWith("/playground");
    return href === "/#work" && (pathname === "/" || pathname.startsWith("/projects/"));
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.shell}>
          <Link className={styles.wordmark} href="/" aria-label="Oladimeji Abubakar, home">
            oladimeji<span>.</span>
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                href={item.href}
                key={item.label}
                className={isActive(item.href) ? styles.active : undefined}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <a className={styles.contact} href="mailto:oladimejiuiux@gmail.com">
            Let&apos;s talk <ArrowUpRight aria-hidden="true" />
          </a>

          <button
            className={`${styles.menuButton}${menuOpen ? ` ${styles.menuButtonOpen}` : ""}`}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <div className={`${styles.mobilePanel}${menuOpen ? ` ${styles.mobilePanelOpen}` : ""}`} id="mobile-navigation">
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <Link href={item.href} onClick={() => setMenuOpen(false)} key={item.label}>
              <span>0{index + 1}</span>{item.label}
            </Link>
          ))}
        </nav>
        <a className={styles.mobileContact} href="mailto:oladimejiuiux@gmail.com" onClick={() => setMenuOpen(false)}>
          Start a conversation <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
