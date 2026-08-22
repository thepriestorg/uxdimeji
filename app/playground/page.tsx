import type { Metadata } from "next";
import V2Header from "@/components/v2/V2Header";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import PlaygroundGallery from "@/components/v2/PlaygroundGallery";
import V2Footer from "@/components/v2/V2Footer";

export const metadata: Metadata = {
  title: "Playground",
  description: "Interface studies, product UI shots, motion experiments, and visual explorations by Oladimeji Abubakar.",
  alternates: { canonical: "/playground" },
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return (
    <main className="v2-design playground-page" id="main">
      <V2ScrollEffects />
      <V2Header />
      <section className="playground-intro">
        <span>Playground</span>
        <h1>UI shots & experiments.</h1>
        <p>Images, motion, and interface ideas—nothing else.</p>
      </section>
      <PlaygroundGallery />
      <V2Footer />
    </main>
  );
}
