"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import styles from "./SiteHeader.module.css";

const EMAIL = "oladimejiuiux@gmail.com";

const navigation = [
  { label: "Work", href: "/#work" },
  { label: "Writing", href: "/blog" },
  { label: "Playground", href: "/playground" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("menu-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/blog") return pathname.startsWith("/blog");
    if (href === "/playground") return pathname.startsWith("/playground");
    return pathname === "/" || pathname.startsWith("/projects/");
  };

  const close = () => setMenuOpen(false);

  return (
    <header className={`${styles.header}${menuOpen ? ` ${styles.open}` : ""}`}>
      <div className={styles.bar}>
        <Link className={styles.brand} href="/" aria-label="Oladimeji Abubakar, home" onClick={close}>
          Oladimeji Abubakar
        </Link>

        <nav className={styles.nav} aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={isActive(item.href) ? styles.active : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <a className={styles.contact} href={`mailto:${EMAIL}`}>
            Contact
          </a>
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={styles.panel} id="site-menu" aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={close}
              tabIndex={menuOpen ? 0 : -1}
              className={isActive(item.href) ? styles.active : undefined}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <a className={styles.panelCta} href={`mailto:${EMAIL}`} tabIndex={menuOpen ? 0 : -1}>
          {EMAIL} <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
