import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const manrope = localFont({
  src: "../public/assets/Manrope-Variable.ttf",
  variable: "--font-manrope",
});
const flux = localFont({
  src: "../public/assets/Flux-Variable.woff2",
  variable: "--font-flux",
  display: "swap",
});
const handwriting = localFont({
  src: "../public/assets/JustMeAgainDownHere.woff2",
  variable: "--font-handwriting",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL("https://uxdimeji.com"),
  applicationName: "Oladimeji Abubakar — Product Designer in Nigeria",
  title: {
    default: "Oladimeji Abubakar — Product Designer in Nigeria",
    template: "%s | Oladimeji Abubakar",
  },
  description:
    "Oladimeji Abubakar is a product and UI/UX designer based in Kwara and working across Nigeria and worldwide, creating intuitive digital products, scalable design systems, and thoughtful SaaS experiences.",
  keywords: [
    "Oladimeji Abubakar",
    "Product Designer Nigeria",
    "Product Designer in Nigeria",
    "Product Designer Kwara",
    "Product Designer in Kwara",
    "UX Designer Nigeria",
    "UI/UX Designer in Nigeria",
    "UI/UX Designer in Kwara",
    "UI UX Designer",
    "Product Design Portfolio",
    "Design Systems",
    "SaaS Product Design",
  ],
  authors: [{ name: "Oladimeji Abubakar", url: "https://uxdimeji.com" }],
  creator: "Oladimeji Abubakar",
  publisher: "Oladimeji Abubakar",
  category: "Product Design",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Oladimeji Abubakar — Product Designer in Nigeria",
    description:
      "Nigeria-based product and UI/UX designer creating digital products from strategy and interaction through scalable interface systems and development.",
    type: "website",
    url: "/",
    locale: "en_US",
    siteName: "Oladimeji Abubakar",
    images: [
      {
        url: "/og-image",
        width: 1200,
        height: 630,
        alt: "Oladimeji Abubakar — Product Designer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Oladimeji Abubakar — Product Designer in Nigeria",
    description:
      "Nigeria-based product and UI/UX designer creating thoughtful digital products from strategy to functional builds.",
    creator: "@uxdimeji",
    images: ["/og-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const seoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://uxdimeji.com/#person",
        name: "Oladimeji Abubakar",
        alternateName: "uxdimeji",
        url: "https://uxdimeji.com",
        image: "https://uxdimeji.com/icon.png",
        description: "Product and UI/UX designer based in Kwara and working across Nigeria and worldwide, with over five years of experience designing digital products and interface systems.",
        jobTitle: "Product Designer and UI/UX Designer",
        email: "mailto:oladimejiuiux@gmail.com",
        nationality: {
          "@type": "Country",
          name: "Nigeria",
        },
        address: {
          "@type": "PostalAddress",
          addressRegion: "Kwara",
          addressCountry: "NG",
        },
        homeLocation: {
          "@type": "Place",
          name: "Kwara, Nigeria",
          address: {
            "@type": "PostalAddress",
            addressRegion: "Kwara",
            addressCountry: "NG",
          },
        },
        knowsAbout: [
          "Product Design",
          "UI Design",
          "UX Design",
          "Interaction Design",
          "Design Systems",
          "SaaS Product Design",
          "Product Prototyping",
        ],
        sameAs: [
          "https://www.linkedin.com/in/uiuxoladimeji/",
          "https://www.behance.net/oladimejiabubakar",
          "https://contra.com/uxdimeji",
          "https://www.instagram.com/uxdimeji",
          "https://x.com/uxdimeji",
          "https://www.tiktok.com/@uxdimeji",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://uxdimeji.com/#website",
        url: "https://uxdimeji.com",
        name: "Oladimeji Abubakar",
        alternateName: ["uxdimeji", "Oladimeji Abubakar Portfolio"],
        description: "The product design portfolio of Oladimeji Abubakar, a product and UI/UX designer based in Kwara and working across Nigeria and worldwide.",
        inLanguage: "en-NG",
        publisher: { "@id": "https://uxdimeji.com/#person" },
      },
    ],
  };

  return (
    <html lang="en-NG" className="dark">
      <body className={`${jakarta.variable} ${playfair.variable} ${manrope.variable} ${flux.variable} ${handwriting.variable} font-sans bg-background text-secondary antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoJsonLd) }}
        />
        {children}
        <AnalyticsTracker />
      </body>
    </html>
  );
}
