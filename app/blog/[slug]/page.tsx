import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Share2, Mail, Linkedin } from "lucide-react";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import ArticleAudio from "@/components/blog/ArticleAudio";
import QuoteTools from "@/components/blog/QuoteTools";
import CommentSection from "@/components/blog/CommentSection";
import { formatPostDate, getPublishedPost, readingTime } from "@/lib/blog";
import { richTextToHtml, richTextToPlainText } from "@/lib/rich-text";
import "../blog.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found" };
  const shareImage = post.cover_image || "/og-image";

  return {
    title: `${post.title} | Oladimeji Abubakar`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blog/${post.slug}`,
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at,
      authors: ["Oladimeji Abubakar"],
      images: [{ url: shareImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      creator: "@uxdimeji",
      images: [shareImage],
    },
  };
}

/* ─── Blue Verified Badge SVG ───────────────────────────── */
function VerifiedBadge() {
  return (
    <svg
      className="signoff-verified-badge"
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
      className="signoff-sketch-underline"
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

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const renderedContent = richTextToHtml(post.content);
  const spokenText = richTextToPlainText(post.content);

  return (
    <main className="v2-design blog-page" id="top">
      <V2Header />

      {/* ── Unboxed Centered Article Reader ── */}
      <article className="article-reader-container">
        {/* Back link */}
        <Link href="/blog" className="article-back-nav">
          <ArrowLeft size={13} aria-hidden="true" />
          <span>All writing</span>
        </Link>

        {/* Category */}
        {post.category && (
          <span className="article-category-badge">{post.category}</span>
        )}

        {/* Title & Deck */}
        <h1 className="article-reader-title">{post.title}</h1>
        {post.excerpt && <p className="article-reader-deck">{post.excerpt}</p>}

        {/* Author Byline */}
        <div className="article-reader-byline">
          <div className="article-byline-avatar">
            <Image
              src="/images/oladimeji.png"
              alt="Oladimeji Abubakar"
              width={40}
              height={40}
            />
          </div>
          <div className="article-byline-text">
            <span className="article-byline-name">Oladimeji Abubakar</span>
            <span className="article-byline-sub">
              {formatPostDate(post.published_at)} · {readingTime(post.content)}
            </span>
          </div>
        </div>

        {/* Featured Cover Image */}
        {post.cover_image && (
          <div className="article-reader-cover">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 680px"
              unoptimized
            />
          </div>
        )}

        <ArticleAudio title={post.title} text={spokenText} />

        {/* Article Body */}
        <div
          className="article-reader-body"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />

        <QuoteTools />

        {/* ── Redesigned "Thanks for reading" Personal Sign-off Card ── */}
        <div className="article-signoff-card">
          <div className="article-signoff-top">
            <div className="signoff-avatar-wrapper">
              <div className="signoff-avatar">
                <Image
                  src="/images/oladimeji.png"
                  alt="Oladimeji Abubakar"
                  width={52}
                  height={52}
                  className="signoff-avatar-img"
                />
              </div>
              <span className="signoff-online-dot" aria-label="Online" />
            </div>

            <div className="signoff-author-details">
              <div className="signoff-author-name-row">
                <strong>Oladimeji Abubakar</strong>
                <VerifiedBadge />
              </div>
              <span>Product Designer & Builder</span>
            </div>
          </div>

          <div className="signoff-handwriting-wrap">
            <span className="signoff-handwriting-text">
              thanks for reading — oladimeji
            </span>
            <UnderlineSketch />
          </div>

          <h2 className="signoff-headline">Thanks for spending time here.</h2>
          <p className="signoff-body">
            I write about product craft, interaction nuance, and bridging the
            gap between Figma and production code. If anything here resonated
            with you, sparked a question, or you&apos;d like to collaborate, I&apos;d
            love to hear from you.
          </p>

          <div className="signoff-actions">
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                post.title
              )}&url=${encodeURIComponent(
                `https://uxdimeji.com/blog/${post.slug}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="signoff-btn-pill"
            >
              <Share2 size={13} aria-hidden="true" />
              <span>Share on 𝕏</span>
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                `https://uxdimeji.com/blog/${post.slug}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="signoff-btn-pill"
            >
              <Linkedin size={13} aria-hidden="true" />
              <span>LinkedIn</span>
            </a>
            <a
              href="mailto:oladimejiuiux@gmail.com"
              className="signoff-btn-pill signoff-btn-primary"
            >
              <Mail size={13} aria-hidden="true" />
              <span>Say hello</span>
            </a>
          </div>
        </div>

        {/* ── Redesigned Comments Section ── */}
        <CommentSection postSlug={post.slug} />
      </article>

      <V2Footer />
    </main>
  );
}
