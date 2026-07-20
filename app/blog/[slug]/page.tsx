import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import ArticleAudio from "@/components/blog/ArticleAudio";
import QuoteTools from "@/components/blog/QuoteTools";
import CommentSection from "@/components/blog/CommentSection";
import { formatPostDate, getPublishedPost, readingTime } from "@/lib/blog";
import "../blog.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article", images: post.cover_image ? [post.cover_image] : undefined },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();
  const spokenText = post.content
    .replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "and")
    .replace(/\s+/g, " ")
    .trim();

  return (
    <main className="v2-design blog-page article-page" id="top">
      <V2Header />
      <article>
        <header className="article-header">
          <Link href="/blog" className="article-back">← All writing</Link>
          <p className="eyebrow">{post.category}</p>
          <h1>{post.title}</h1>
          <p className="article-deck">{post.excerpt}</p>
          <div className="article-byline">
            <span>By Oladimeji Abubakar</span>
            <time>{formatPostDate(post.published_at)}</time>
            <span>{readingTime(post.content)}</span>
          </div>
          <ArticleAudio title={post.title} text={spokenText} />
        </header>
        {post.cover_image && <div className="article-cover"><Image src={post.cover_image} alt="" fill sizes="100vw" unoptimized /></div>}
        <div className="article-layout">
          <aside><span>Share</span><a href={`https://x.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://uxdimeji.com/blog/${post.slug}`)}`} target="_blank" rel="noreferrer">X</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://uxdimeji.com/blog/${post.slug}`)}`} target="_blank" rel="noreferrer">In</a></aside>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />
          <QuoteTools />
        </div>
        <CommentSection postSlug={post.slug} />
        <footer className="article-end">
          <p className="eyebrow">End note</p>
          <h2>Thanks for reading.</h2>
          <Link href="/blog">Browse all writing <i className="arrow-icon arrow-out" /></Link>
        </footer>
      </article>
      <V2Footer />
    </main>
  );
}
