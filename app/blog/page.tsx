import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { formatPostDate, formatViews, getPublishedPosts, readingTime } from "@/lib/blog";
import { socialMetadata } from "@/lib/seo";
import "./blog.css";
import styles from "./Writing.module.css";

// Serve the list from cache; new posts show up within a minute.
export const revalidate = 60;

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
  const [latest, ...rest] = posts;

  return (
    <main className={`v2-design site-page ${styles.page}`} id="top">
      <SiteHeader />

      <div className={styles.shell}>
        <header className={styles.head}>
          <p className="mono-label">Writing · {String(posts.length).padStart(2, "0")}</p>
          <h1>
            Notes from my desk.
            <span> On design, craft and building things.</span>
          </h1>
        </header>

        {latest ? (
          <>
            <Link href={`/blog/${latest.slug}`} className={styles.latest}>
              {latest.cover_image && (
                <div className={styles.latestCover}>
                  <Image
                    src={latest.cover_image}
                    alt={latest.title}
                    width={1600}
                    height={1000}
                    sizes="(max-width: 900px) 100vw, 640px"
                    unoptimized
                  />
                </div>
              )}
              <div className={styles.latestCopy}>
                <p className={styles.meta}>
                  <span className={styles.newTag}>Latest</span>
                  {formatPostDate(latest.published_at)} · {readingTime(latest.content)}
                </p>
                <h2>{latest.title}</h2>
                {latest.excerpt && <p className={styles.excerpt}>{latest.excerpt}</p>}
                <span className={styles.read}>
                  Read the note <ArrowUpRight aria-hidden="true" />
                </span>
              </div>
            </Link>

            {rest.length > 0 && (
              <ol className={styles.index} aria-label="All notes">
                {rest.map((post) => (
                  <li key={post.id}>
                    <Link href={`/blog/${post.slug}`} className={styles.row}>
                      <time className={styles.date}>{formatPostDate(post.published_at)}</time>
                      <div className={styles.rowCopy}>
                        <h2>{post.title}</h2>
                        {post.excerpt && <p>{post.excerpt}</p>}
                      </div>
                      <span className={styles.rowMeta}>
                        {readingTime(post.content)}
                        <br />
                        {formatViews(post.views)}
                      </span>
                      <ArrowUpRight className={styles.arrow} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </>
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
