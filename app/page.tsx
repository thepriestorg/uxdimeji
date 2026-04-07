import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Noise from "@/components/Noise";
import About from "@/components/About";
import Projects from "@/components/Projects";
import WorkGallery from "@/components/WorkGallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-accent selection:text-white">
      <Noise />
      <Navbar />
      <Hero />
      <WorkGallery />
      <Projects />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
