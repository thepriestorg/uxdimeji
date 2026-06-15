import type { Metadata } from "next";
import V2Header from "@/components/v2/V2Header";
import V2Hero from "@/components/v2/V2Hero";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import KineticWall from "@/components/v2/KineticWall";
import V2SelectedWork from "@/components/v2/V2SelectedWork";
import V2Profile from "@/components/v2/V2Profile";
import V2Contact from "@/components/v2/V2Contact";
import V2Footer from "@/components/v2/V2Footer";

export const metadata: Metadata = {
  title: "Dimeji A. — Product Designer",
  description:
    "Dimeji is a product designer creating clear digital products and systems.",
};

export default function Home() {
  return (
    <main className="v2-design">
      <V2ScrollEffects />
      <V2Header />
      <V2Hero />
      <KineticWall />
      <V2SelectedWork />
      <V2Profile />
      <V2Contact />
      <V2Footer />
    </main>
  );
}
