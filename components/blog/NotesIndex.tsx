import Link from "next/link";
import Image from "next/image";
import styles from "@/app/blog/Writing.module.css";

export type NoteSummary = {
  slug: string;
  title: string;
  category: string;
  date: string;
  minutes: number;
  views: string;
  cover: string | null;
};

const topicEmoji: Record<string, string> = {
  process: "⚙️",
  journey: "🧭",
  design: "🎨",
  craft: "🛠️",
  code: "💻",
  ai: "🤖",
  life: "🌱",
  career: "🚀",
};

const emojiFor = (topic: string) => topicEmoji[topic.trim().toLowerCase()] ?? "✍️";

/* Every note as a big line of type with its cover beside it, newest first. */
export default function NotesIndex({ notes }: { notes: NoteSummary[] }) {
  return (
    <section className={styles.notes} aria-labelledby="all-notes">
      <div className={styles.notesHead}>
        <h2 id="all-notes">Every note</h2>
        <span className="mono-label">{String(notes.length).padStart(2, "0")}</span>
      </div>

      <ol className={styles.list}>
        {notes.map((note, n) => (
          <li key={note.slug}>
            <Link href={`/blog/${note.slug}`} className={styles.line}>
              <span className={styles.lineNum}>{String(n + 1).padStart(2, "0")}</span>
              <span className={styles.lineMain}>
                <span className={styles.lineTitle}>
                  {note.title}
                  {n === 0 && <em className={styles.lineNew}>new</em>}
                </span>
                <span className={styles.lineMeta}>
                  {note.category && (
                    <span>
                      {emojiFor(note.category)} {note.category}
                    </span>
                  )}
                  <span>{note.date}</span>
                  <span>{note.minutes} min read</span>
                  <span>{note.views}</span>
                </span>
              </span>
              {note.cover && (
                <span className={styles.lineThumb}>
                  <Image
                    src={note.cover}
                    alt=""
                    width={480}
                    height={320}
                    sizes="(max-width: 680px) 96px, 240px"
                    priority={n === 0}
                    unoptimized
                  />
                </span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
