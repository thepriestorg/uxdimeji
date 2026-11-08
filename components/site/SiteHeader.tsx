"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

const EMAIL = "oladimejiuiux@gmail.com";

const navigation = [
  { label: "Work", href: "/#work" },
  { label: "Writing", href: "/blog" },
  { label: "Playground", href: "/playground" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/blog") return pathname.startsWith("/blog");
    if (href === "/playground") return pathname.startsWith("/playground");
    return pathname === "/" || pathname.startsWith("/projects/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link className={styles.brand} href="/" aria-label="Oladimeji Abubakar, home">
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
      </div>
    </header>
  );
}
