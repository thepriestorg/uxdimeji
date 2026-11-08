import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import V2ScrollEffects from "@/components/v2/V2ScrollEffects";
import SiteHero from "@/components/site/SiteHero";
import Work from "@/components/site/Work";
import StackActivity from "@/components/site/StackActivity";
import SiteFooter from "@/components/site/SiteFooter";

// Serve the homepage from cache; admin edits show up within a minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: "Oladimeji Abubakar — Product Designer in Nigeria" },
  description:
    "Oladimeji Abubakar is a product and UI/UX designer in Nigeria creating intuitive digital products, scalable systems, and thoughtful SaaS experiences.",
  alternates: {
    canonical: "/",
  },
};

// Marks the homepage as the canonical profile of the Person defined in the root layout.
const profilePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  "@id": "https://uxdimeji.com/#profilepage",
  url: "https://uxdimeji.com",
  name: "Oladimeji Abubakar — Product Designer in Nigeria",
  inLanguage: "en-NG",
  isPartOf: { "@id": "https://uxdimeji.com/#website" },
  // Named inline as well as by @id, since the full Person graph lives in a separate script.
  mainEntity: {
    "@type": "Person",
    "@id": "https://uxdimeji.com/#person",
    name: "Oladimeji Abubakar",
    alternateName: ["uxdimeji", "Oladimeji", "Dimeji", "Abubakar Oladimeji"],
    url: "https://uxdimeji.com",
    image: "https://uxdimeji.com/images/oladimeji.jpg",
    jobTitle: "Product Designer",
  },
};

export default function Home() {
  return (
    <main className="v2-design" id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageJsonLd) }}
      />
      <V2ScrollEffects />
      <SiteHeader />
      <SiteHero />
      <Work />
      {/* Render date for time-based fallbacks, so server and client HTML agree. */}
      <StackActivity today={new Date().toISOString().slice(0, 10)} />
      <SiteFooter />
    </main>
  );
}
