import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Noise from "@/components/Noise";
import About from "@/components/About";
import Projects from "@/components/Projects";
import WorkGallery from "@/components/WorkGallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import V2Animations from "@/components/dev/V2Animations";

export const metadata: Metadata = {
  title: "Oladimeji Abubakar - Light Mode",
  description: "A light-mode version of Oladimeji Abubakar's portfolio homepage.",
};

export default function V2Home() {
  return (
    <main className="v2-light min-h-screen bg-background text-primary antialiased selection:bg-accent selection:text-white">
      <Noise />
      <Navbar basePath="/v2" />
      <V2Animations>
        <Hero />
        <WorkGallery />
        <Projects variant="light" />
        <About variant="light" />
        <Contact />
        <Footer />
      </V2Animations>
    </main>
  );
}
