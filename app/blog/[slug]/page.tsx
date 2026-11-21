import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Linkedin, Mail } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ArticleAudio from "@/components/blog/ArticleAudio";
import ArticleNav from "@/components/blog/ArticleNav";
import QuoteTools from "@/components/blog/QuoteTools";
import CommentSection from "@/components/blog/CommentSection";
import BlogPostViews from "@/components/blog/BlogPostViews";
import CopyLinkButton from "@/components/blog/CopyLinkButton";
import { UnderlineSketch, VerifiedBadge } from "@/components/blog/BlogMarks";
import { formatPostDate, getPublishedPost, getPublishedPosts, readingTime } from "@/lib/blog";
import { richTextToHtml, richTextToPlainText } from "@/lib/rich-text";
import { absoluteUrl, authorRef, jsonLdScript } from "@/lib/seo";
import "../blog.css";

// Serve articles from cache; admin edits show up within a minute.
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map(({ slug }) => ({ slug }));
}

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
    // The root layout's title template adds the name.
    title: post.title,
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

const decodeEntities = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

/* Give every h2 an id so the contents list can link to it, and collect them in order. */
function withHeadingAnchors(html: string) {
  const headings: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const output = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (_, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]+>/g, "")).trim();
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .slice(0, 60) || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    headings.push({ id, text });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: output, headings };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, allPosts] = await Promise.all([getPublishedPost(slug), getPublishedPosts()]);
  if (!post) notFound();

  const { html: renderedContent, headings } = withHeadingAnchors(richTextToHtml(post.content));
  const spokenText = richTextToPlainText(post.content);
  const minutes = Number.parseInt(readingTime(post.content), 10) || 1;
  const postUrl = `https://uxdimeji.com/blog/${post.slug}`;

  // Keep reading: the next older note, or the newest one when this is the oldest.
  const others = allPosts.filter((item) => item.slug !== post.slug);
  const index = allPosts.findIndex((item) => item.slug === post.slug);
  const nextPost = allPosts.slice(index + 1)[0] ?? others[0];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url: absoluteUrl(`/blog/${post.slug}`),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    image: [absoluteUrl(post.cover_image || "/og-image")],
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    dateModified: post.updated_at,
    author: authorRef,
    publisher: authorRef,
  };

  return (
    <main className="v2-design site-page blog-page" id="top">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd)} />
      <SiteHeader />

      <article className="post">
        <header className="post-hero">
          <Link href="/blog" className="post-back">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>All writing</span>
          </Link>

          <p className="post-kicker">
            {post.category && <span className="stamp post-stamp"><i />{post.category}</span>}
            <time dateTime={post.published_at ?? undefined}>{formatPostDate(post.published_at)}</time>
          </p>

          <h1 className="post-title">{post.title}</h1>
          {post.excerpt && <p className="post-deck">{post.excerpt}</p>}

          <p className="post-mood" aria-hidden="true">
            <span className="post-mood-time">{minutes} min</span>
            <span className="post-mood-note">
              {minutes <= 5 ? "a quick one ⚡" : minutes <= 12 ? "grab a coffee ☕" : "a long one, get comfy 🛋️"}
            </span>
          </p>

          <div className="post-byline">
            <div className="post-author">
              <span className="post-author-avatar">
                <Image src="/images/oladimeji.jpg" alt="" width={44} height={44} />
              </span>
              <span className="post-author-text">
                <span className="post-author-name">
                  Oladimeji Abubakar <VerifiedBadge className="verified-badge" />
                </span>
                <span className="post-author-sub">
                  Product designer &amp; builder ·{" "}
                  <BlogPostViews slug={post.slug} initialViews={post.views} />
                </span>
              </span>
            </div>
            <ArticleAudio title={post.title} text={spokenText} />
          </div>
        </header>

        {post.cover_image && (
          <div className="post-cover">
            <Image
              src={post.cover_image}
              alt=""
              fill
              priority
              sizes="(max-width: 1180px) 100vw, 1120px"
              unoptimized
            />
          </div>
        )}

        <div className="post-layout">
          <aside className="post-rail">
            <ArticleNav headings={headings} minutes={minutes} />
          </aside>

          <div className="article-body" dangerouslySetInnerHTML={{ __html: renderedContent }} />
        </div>

        <QuoteTools />

        <footer className="post-end">
          <p className="post-end-mark" aria-hidden="true">
            <span />✦<span />
          </p>

          {/* Sign-off: who wrote this, and an open door to say hello */}
          <section className="signoff" aria-labelledby="signoff-title">
            <div className="signoff-top">
              <span className="signoff-avatar">
                <Image src="/images/oladimeji.jpg" alt="Oladimeji Abubakar" width={96} height={96} />
                <i aria-label="Online" />
              </span>
              <span className="signoff-who">
                <span className="signoff-name">
                  Oladimeji Abubakar <VerifiedBadge className="verified-badge" />
                </span>
                <span className="signoff-role">Product Designer &amp; Builder</span>
              </span>
            </div>

            <div className="signoff-script">
              <span>thanks for reading — oladimeji</span>
              <UnderlineSketch className="signoff-underline" />
            </div>

            <h2 id="signoff-title" className="signoff-headline">
              Thanks for spending time here. <span className="signoff-wave" aria-hidden="true">👋</span>
            </h2>
            <p className="signoff-body">
              I write about product design, craft, my journey in tech, life observations, and other
              things I find interesting along the way. If anything here resonated with you, sparked a
              question, or you&apos;d like to chat, I&apos;d love to hear from you.
            </p>

            <div className="signoff-actions">
              <a href="mailto:oladimejiuiux@gmail.com" className="signoff-btn signoff-btn-primary">
                <Mail size={14} aria-hidden="true" />
                <span>Say hello</span>
              </a>
              <a
                href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="signoff-btn"
              >
                <span className="signoff-x" aria-hidden="true">𝕏</span>
                <span>Share on X</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="signoff-btn"
              >
                <Linkedin size={14} aria-hidden="true" />
                <span>LinkedIn</span>
              </a>
              <CopyLinkButton url={postUrl} className="signoff-btn" />
            </div>
          </section>

          {nextPost && (
            <Link href={`/blog/${nextPost.slug}`} className="next-read">
              <span className="next-read-copy">
                <span className="next-read-label">Keep reading</span>
                <span className="next-read-title">{nextPost.title}</span>
                <span className="next-read-facts">
                  {formatPostDate(nextPost.published_at)} · {readingTime(nextPost.content)}
                </span>
              </span>
              {nextPost.cover_image ? (
                <span className="next-read-thumb">
                  <Image src={nextPost.cover_image} alt="" width={320} height={200} unoptimized />
                </span>
              ) : null}
              <span className="next-read-go" aria-hidden="true">
                <ArrowRight size={18} />
              </span>
            </Link>
          )}

          <CommentSection postSlug={post.slug} />
        </footer>
      </article>

      <SiteFooter />
    </main>
  );
}
