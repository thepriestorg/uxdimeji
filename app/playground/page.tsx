import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import PlaygroundGallery from "@/components/v2/PlaygroundGallery";
import SiteFooter from "@/components/site/SiteFooter";
import { socialMetadata } from "@/lib/seo";
import styles from "./Playground.module.css";

const description = "UI shots and product design explorations by Nigerian product and UI/UX designer Oladimeji Abubakar.";

export const metadata: Metadata = {
  title: "UI/UX Design Playground",
  description,
  alternates: { canonical: "/playground" },
  robots: { index: true, follow: true },
  ...socialMetadata({ title: "UI/UX Design Playground", description, path: "/playground" }),
};

export default function PlaygroundPage() {
  return (
    <main className={`v2-design site-page ${styles.page}`} id="main">
      <V2ScrollEffects />
      <SiteHeader />
      <header className={styles.intro}>
        <p className="mono-label">Playground</p>
        <h1>
          Made along the way. <span>Smaller than case studies.</span>
        </h1>
        <p>UI shots and product ideas I&apos;ve explored between projects. Not every idea needs a case study to be worth sharing.</p>
      </header>
      <PlaygroundGallery />
      <SiteFooter />
    </main>
  );
}
