import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import V2Header from "@/components/v2/V2Header";
import V2Footer from "@/components/v2/V2Footer";
import { formatPostDate, getPublishedPosts, readingTime } from "@/lib/blog";
import "./blog.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Writing, observations, ideas, and whatever else feels worth sharing by Oladimeji Abubakar.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <main className="v2-design blog-page" id="top">
      <V2Header />
      <section className="blog-hero">
        <p className="eyebrow">The blog</p>
        <h1>Things I felt like<br /><em>writing down.</em></h1>
        <p className="blog-hero-note">
          No fixed theme. Just ideas, observations, stories, design, life, and whatever else stays on my mind long enough.
        </p>
      </section>

      {featured ? (
        <section className="post-archive" aria-label="Published articles">
          <div className="archive-heading">
            <p className="eyebrow">Latest writing</p>
            <p>{posts.length.toString().padStart(2, "0")} {posts.length === 1 ? "piece" : "pieces"}</p>
          </div>
          <div className="post-grid">
            {[featured, ...rest].map((post, index) => (
              <Link href={`/blog/${post.slug}`} className="post-card" key={post.id}>
                <div className="post-card-media">
                  {post.cover_image ? <Image src={post.cover_image} alt="" fill sizes="(max-width: 800px) 100vw, 44vw" unoptimized /> : <span>OA / {String(index + 1).padStart(2, "0")}</span>}
                </div>
                <div className="post-card-copy">
                  <div className="post-kicker"><span>{post.category}</span><span>{String(index + 1).padStart(2, "0")} / {formatPostDate(post.published_at)}</span></div>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <div className="post-card-foot"><span>{readingTime(post.content)}</span><b>Read article <i className="arrow-icon arrow-out" aria-hidden="true" /></b></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="blog-empty">
          <p>Nothing published yet.</p>
        </section>
      )}
      <V2Footer />
    </main>
  );
}
