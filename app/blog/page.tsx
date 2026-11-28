import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import NotesIndex, { type NoteSummary } from "@/components/blog/NotesIndex";
import { formatPostDate, formatViews, getPublishedPosts, readingTime } from "@/lib/blog";
import { socialMetadata } from "@/lib/seo";
import styles from "./Writing.module.css";

// Built once and served as a static page. Saving in the admin rebuilds it straight away;
// the daily rebuild is only a safety net.
export const revalidate = 86400;

const description =
  "A quiet space for thoughts on product design, craft, interfaces, and code by Oladimeji Abubakar.";

export const metadata: Metadata = {
  title: "Writing",
  description,
  alternates: { canonical: "/blog" },
  ...socialMetadata({ title: "Writing", description, path: "/blog" }),
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  const notes: NoteSummary[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    date: formatPostDate(post.published_at),
    minutes: Number.parseInt(readingTime(post.content), 10) || 1,
    views: formatViews(post.views),
    cover: post.cover_image,
  }));

  return (
    <main className={`v2-design site-page ${styles.page}`} id="top">
      <SiteHeader />

      <div className={styles.shell}>
        <header className={styles.head}>
          <p className="mono-label">Writing · {String(posts.length).padStart(2, "0")} notes</p>
          <h1>
            Notes from <span className={styles.headDesk}>my desk.</span>
          </h1>
          <p className={styles.headScript} aria-hidden="true">
            <svg viewBox="0 0 60 40" fill="none">
              <path d="M4 6c18 2 34 10 44 26" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M40 30l8 3 1-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            on design, craft &amp; building things
          </p>
        </header>

        {notes.length > 0 ? (
          <NotesIndex notes={notes} />
        ) : (
          <div className={styles.empty}>
            <p>Nothing published yet.</p>
            <span>
              Notes on product systems, design-to-code and interface craft are on the way. Meanwhile,{" "}
              <Link href="/playground">browse the playground</Link>.
            </span>
          </div>
        )}
      </div>

      <SiteFooter />
    </main>
  );
}
