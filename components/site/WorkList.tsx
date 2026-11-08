"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ViewportGif, ViewportVideo } from "@/components/v2/ViewportMedia";
import { getLocalGif } from "@/lib/local-media";
import { getOptimizedImageUrl, getOptimizedVideoUrl, getVideoPoster, isGifUrl, isVideoUrl } from "@/lib/media";
import type { Project } from "@/lib/projects";
import styles from "./Work.module.css";

export type WorkItem = Pick<
  Project,
  | "id" | "title" | "slug" | "year" | "category" | "kind" | "made_for" | "client_name" | "role"
  | "has_case_study" | "live_url" | "featured_image" | "metrics" | "summary"
>;

type Filter = { id: string; label: string; match: (item: WorkItem) => boolean };

const FILTERS: Filter[] = [
  { id: "all", label: "All work", match: () => true },
  { id: "case-studies", label: "Case studies", match: (item) => item.has_case_study },
  { id: "live", label: "Live", match: (item) => !!item.live_url },
  { id: "client", label: "Client", match: (item) => item.made_for === "client" },
  { id: "personal", label: "Personal", match: (item) => item.made_for === "personal" },
];

function Media({ src, alt, eager, sizes }: { src: string | null; alt: string; eager: boolean; sizes: string }) {
  if (!src) return <div className={styles.mediaEmpty} aria-hidden="true" />;
  if (isVideoUrl(src)) {
    return (
      <ViewportVideo
        className={styles.mediaFill}
        src={getOptimizedVideoUrl(src)}
        mobileSrc={getOptimizedVideoUrl(src, 720)}
        poster={getVideoPoster(src)}
        ariaLabel={alt}
        eager={eager}
      />
    );
  }
  if (isGifUrl(src)) return <ViewportGif className={styles.mediaFill} src={getLocalGif(src) ?? src} alt={alt} />;
  // Width and height only seed the box; the image keeps its own proportions once it loads.
  return (
    <Image
      className={styles.mediaFill}
      src={getOptimizedImageUrl(src, 1600)}
      alt={alt}
      width={1600}
      height={1000}
      priority={eager}
      quality={88}
      sizes={sizes}
    />
  );
}

// One card for every kind of work. The type label and the action are what tell them apart.
function WorkCard({ item, featured, index }: { item: WorkItem; featured: boolean; index: number }) {
  const href = item.has_case_study ? `/projects/${item.slug}` : item.live_url;
  const external = !item.has_case_study;
  const action = item.has_case_study ? "Read more" : "Visit site";
  const label = item.has_case_study
    ? `${item.title}: read the case study`
    : `${item.title}: open the live project in a new tab`;

  const body = (
    <>
      <div className={styles.frame}>
        <div className={styles.media}>
          <Media
            src={item.featured_image}
            alt={`${item.title} preview`}
            eager={index < 2}
            sizes={featured ? "(max-width: 900px) calc(100vw - 32px), 680px" : "(max-width: 760px) calc(100vw - 32px), 560px"}
          />
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>
            {/* The title link stretches over the whole card, so links inside the excerpt stay valid and clickable. */}
            {!href ? (
              item.title
            ) : external ? (
              <a className={styles.stretch} href={href} aria-label={label} target="_blank" rel="noopener noreferrer">{item.title}</a>
            ) : (
              <Link className={styles.stretch} href={href} aria-label={label}>{item.title}</Link>
            )}
          </h3>
          {item.has_case_study ? (
            <span className={styles.tag}>Case study</span>
          ) : (
            <span className={`${styles.tag} ${styles.tagLive}`}><i aria-hidden="true" />Live</span>
          )}
          {item.year && <span className={styles.year}>{item.year}</span>}
        </div>
        {(item.summary || href) && (
          <div className={styles.summary}>
            {item.summary && <div className={styles.summaryBody} dangerouslySetInnerHTML={{ __html: item.summary }} />}
            {href && (
              <span className={styles.more} aria-hidden="true">
                {action}
                {external && <ArrowUpRight />}
              </span>
            )}
          </div>
        )}

        {item.metrics.length > 0 && (
          <ul className={styles.metrics}>
            {item.metrics.slice(0, featured ? 3 : 2).map((metric) => (
              <li key={`${metric.value}-${metric.label}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  const className = `${styles.card}${featured ? ` ${styles.featured}` : ""}`;
  return (
    <article className={className}>
      <div className={`${styles.cardLink}${href ? ` ${styles.linked}` : ""}`}>{body}</div>
    </article>
  );
}

export default function WorkList({ items }: { items: WorkItem[] }) {
  const [filterId, setFilterId] = useState("all");
  const filters = FILTERS.map((filter) => ({ ...filter, count: items.filter(filter.match).length })).filter(
    (filter) => filter.id === "all" || filter.count > 0,
  );
  const active = filters.find((filter) => filter.id === filterId) ?? filters[0];
  const visible = items.filter(active.match);
  // The top project in the admin order leads as the featured card.
  const [lead, ...rest] = visible;

  return (
    <section className={styles.work} id="work" aria-labelledby="work-title">
      <div className={styles.shell}>
        <header className={styles.head}>
          <div>
            <p className="mono-label">Selected work</p>
            <h2 id="work-title" className={styles.heading}>
              Things I&apos;ve designed <span>&amp; shipped</span>
            </h2>
          </div>
          <p className={styles.count}>{String(items.length).padStart(2, "0")} projects</p>
        </header>

        <div className={styles.tabs} role="group" aria-label="Filter work">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              aria-pressed={filter.id === active.id}
              className={filter.id === active.id ? styles.tabActive : undefined}
              onClick={() => setFilterId(filter.id)}
            >
              {filter.label}
              <span>{filter.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.list} key={active.id}>
          {lead && <WorkCard item={lead} featured index={0} />}
          {rest.length > 0 && (
            <div className={styles.grid}>
              {rest.map((item, index) => (
                <WorkCard key={item.id} item={item} featured={false} index={index + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
