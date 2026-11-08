"use client";

import { useEffect, useState } from "react";
import { SOCIALS } from "./SocialIcons";
import styles from "./SiteFooter.module.css";

const EMAIL = "oladimejiuiux@gmail.com";
const RESUME = "https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing";

export default function SiteFooter() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = () => {
    navigator.clipboard?.writeText(EMAIL).then(
      () => setCopied(true),
      () => {},
    );
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.top}>
          <div>
            <h2 className={styles.heading}>
              Have a project in mind? <span>Let&apos;s talk.</span>
            </h2>
            <div className={styles.mail}>
              <a href={`mailto:${EMAIL}`} data-analytics-label={`Footer: Email Link Click (${EMAIL})`}>
                {EMAIL}
              </a>
              <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
            </div>
          </div>

          <nav className={styles.socials} aria-label="Social profiles">
            {SOCIALS.map(({ label, href, Icon, analytics }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                data-analytics-label={analytics}
              >
                <Icon aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>

        <div className={styles.bottom}>
          <span>&copy; {new Date().getFullYear()} Oladimeji Abubakar</span>
          <div className={styles.links}>
            <a
              href={RESUME}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-label="Read CV / Resume (Google Drive)"
              data-analytics-event="file_download"
            >
              Résumé
            </a>
            <a href="#top">Back to top</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
