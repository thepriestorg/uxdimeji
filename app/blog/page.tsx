import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Mail } from "lucide-react";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { formatPostDate, getPublishedPosts, readingTime } from "@/lib/blog";
import "./blog.css";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "A quiet space for thoughts on product design, craft, interfaces, and code by Oladimeji Abubakar.",
  alternates: { canonical: "/blog" },
};

/* ─── Blue Verified Badge SVG ───────────────────────────── */
function VerifiedBadge() {
  return (
    <svg
      className="blog-verified-badge"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified Designer"
    >
      <path
        d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6z"
        fill="#0099ff"
      />
      <path
        d="M10.2 16.2L6 12l1.4-1.4 2.8 2.8 6.4-6.4 1.4 1.4-7.8 7.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

/* ─── Double Underline Sketch SVG ───────────────────────── */
function UnderlineSketch() {
  return (
    <svg
      className="blog-handwriting-underline"
      viewBox="0 0 70 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2 3C22 1.5 48 2 68 3.5"
        stroke="#181816"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M6 6.5C26 5 44 5.5 62 6.5"
        stroke="#181816"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="v2-design blog-page" id="top">
      <V2Header />

      {/* ── Centered Stream Container ── */}
      <section className="blog-stream-container">
        {/* ── Personal Hero Header ── */}
        <header className="blog-hero-centered">
          <div className="blog-section-header">
            <span>NOTES & WRITING</span>
          </div>

          {/* Squircle Avatar with Live Online Beacon */}
          <div className="blog-avatar-wrapper">
            <div className="blog-avatar">
              <Image
                src="/images/oladimeji.png"
                alt="Oladimeji Abubakar"
                width={74}
                height={74}
                className="blog-avatar-img"
                priority
              />
            </div>
            <span className="blog-online-dot" aria-label="Online" />
          </div>

          {/* "from my desk" handwriting script */}
          <div className="blog-handwriting-header">
            <span className="blog-handwriting-text">from my desk</span>
            <UnderlineSketch />
          </div>

          {/* Title & Verified Badge */}
          <div className="blog-title-row">
            <h1 className="blog-main-title">Writing</h1>
            <VerifiedBadge />
          </div>

          {/* Intro Copy */}
          <p className="blog-intro-paragraph">
            A quiet space where I share thoughts on product design, craft, my
            journey in tech, life observations, and other things I find
            interesting along the way.
          </p>
        </header>

        {/* ── Horizontal Editorial Feed List or Cozy Empty State ── */}
        {posts.length > 0 ? (
          <div className="blog-feed-list" aria-label="Published articles">
            <div className="blog-feed-meta-bar">
              <span>All Articles</span>
              <span>
                {posts.length} {posts.length === 1 ? "Piece" : "Pieces"}
              </span>
            </div>

            {posts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                className="blog-row-item"
                key={post.id}
              >
                {/* Left Copy & Metadata */}
                <div className="blog-row-copy">
                  <div className="blog-row-meta">
                    <span className="blog-row-category">
                      {post.category || "Essay"}
                    </span>
                    <span>·</span>
                    <time>{formatPostDate(post.published_at)}</time>
                    <span>·</span>
                    <span>{readingTime(post.content)}</span>
                  </div>

                  <h2 className="blog-row-title">{post.title}</h2>
                  {post.excerpt && (
                    <p className="blog-row-excerpt">{post.excerpt}</p>
                  )}

                  <span className="blog-row-read-action">
                    Read piece <ArrowRight size={13} aria-hidden="true" />
                  </span>
                </div>

                {/* Right Visual Thumbnail */}
                {post.cover_image && (
                  <div className="blog-row-thumbnail">
                    <Image
                      src={post.cover_image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 680px) 100vw, 180px"
                      className="blog-row-img"
                      unoptimized
                    />
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="blog-empty-state-unboxed">
            <p className="blog-empty-unboxed-title">
              Currently drafting new thoughts ✍️
            </p>
            <p className="blog-empty-unboxed-note">
              Field notes and essays on product systems, design-to-code
              workflows, and interface craft are on the way. In the meantime, feel
              free to explore my playground or say hello.
            </p>
            <div className="blog-empty-unboxed-actions">
              <Link
                href="/playground"
                className="signoff-btn-pill signoff-btn-primary"
              >
                <Sparkles size={13} aria-hidden="true" />
                <span>Explore Playground</span>
              </Link>
              <a
                href="mailto:oladimejiuiux@gmail.com"
                className="signoff-btn-pill"
              >
                <Mail size={13} aria-hidden="true" />
                <span>Start a conversation</span>
              </a>
            </div>
          </div>
        )}
      </section>

      <V2Footer />
    </main>
  );
}
