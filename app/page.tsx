import type { Metadata } from "next";
import V2Header from "@/components/v2/V2Header";
import V2Hero from "@/components/v2/V2Hero";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import V2SelectedWork from "@/components/v2/V2SelectedWork";
import V2Profile from "@/components/v2/V2Profile";
import V2Contact from "@/components/v2/V2Contact";
import V2Footer from "@/components/v2/V2Footer";

export const metadata: Metadata = {
  title: { absolute: "Oladimeji Abubakar — Product Designer" },
  description:
    "Oladimeji Abubakar is a product designer creating intuitive digital products, scalable systems, and thoughtful experiences for B2C and SaaS teams.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main className="v2-design" id="main">
      <V2ScrollEffects />
      <V2Header />
      <V2Hero />
      <V2SelectedWork />
      <V2Profile />
      <V2Contact />
      <V2Footer />
    </main>
  );
}
