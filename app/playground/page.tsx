import type { Metadata } from "next";
import V2Header from "@/components/v2/V2Header";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import PlaygroundGallery from "@/components/v2/PlaygroundGallery";
import V2Footer from "@/components/v2/V2Footer";
import styles from "./Playground.module.css";

export const metadata: Metadata = {
  title: "Playground",
  description: "Interface studies, product UI shots, motion experiments, and visual explorations by Oladimeji Abubakar.",
  alternates: { canonical: "/playground" },
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return (
    <main className={`v2-design ${styles.page}`} id="main">
      <V2ScrollEffects />
      <V2Header />
      <section className={styles.intro}>
        <div className={styles.introMeta}>
          <span>Playground</span>
          <span>Selected interface studies</span>
        </div>
        <div className={styles.introCopy}>
          <h1>Made along the way.</h1>
          <p>A collection of UI shots and product ideas I&apos;ve created along the way—smaller than case studies, but no less worth sharing.</p>
        </div>
      </section>
      <PlaygroundGallery />
      <V2Footer />
    </main>
  );
}
