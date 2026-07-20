"use client";

import Link from "next/link";

export default function V2Footer() {
  return (
    <footer className="site-footer">
      <span>
        &copy; <span data-year>{new Date().getFullYear()}</span> Oladimeji Abubakar
      </span>
      <div>
        <Link href="/blog">Writing</Link>
        <a
          href="https://www.linkedin.com/in/uiuxoladimeji/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
        <a href="https://x.com/uxdimeji" target="_blank" rel="noopener noreferrer">
          X
        </a>
        <a href="https://www.instagram.com/uxdimeji" target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        <a href="https://www.tiktok.com/@uxdimeji" target="_blank" rel="noopener noreferrer">
          TikTok
        </a>
        <a
          href="https://drive.google.com/file/d/1IsLsaqiIbkBeLbse-dz8QaVgegscdreC/view?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read CV
        </a>
      </div>
      <a href="#top">
        Back to top <span className="arrow-icon arrow-up" aria-hidden="true" />
      </a>
    </footer>
  );
}
