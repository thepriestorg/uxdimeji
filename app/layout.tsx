import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const manrope = localFont({
  src: "../public/assets/Manrope-Variable.ttf",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://uxdimeji.com"),
  applicationName: "Oladimeji Abubakar — Product Designer",
  title: {
    default: "Oladimeji Abubakar — Product Designer",
    template: "%s | Oladimeji Abubakar",
  },
  description:
    "Oladimeji Abubakar is a product designer creating intuitive digital products, scalable design systems, and thoughtful B2C and SaaS experiences.",
  keywords: [
    "Oladimeji Abubakar",
    "Product Designer Nigeria",
    "UX Designer Nigeria",
    "UI UX Designer",
    "Product Design Portfolio",
    "Design Systems",
    "SaaS Product Design",
    "B2C Product Design",
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
    title: "Oladimeji Abubakar — Product Designer",
    description:
      "I design how digital products think, move, and work—from strategy and interaction to scalable interface systems.",
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
    title: "Oladimeji Abubakar — Product Designer",
    description:
      "I design how digital products think, move, and work—from strategy to functional builds.",
    creator: "@uxdimeji",
    images: ["/og-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Oladimeji Abubakar",
    url: "https://uxdimeji.com",
    image: "https://uxdimeji.com/icon.png",
    jobTitle: "Product Designer",
    email: "mailto:oladimejiuiux@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Kwara",
      addressCountry: "NG",
    },
    sameAs: [
      "https://www.linkedin.com/in/uiuxoladimeji/",
      "https://www.instagram.com/uxdimeji",
      "https://x.com/uxdimeji",
      "https://www.tiktok.com/@uxdimeji",
    ],
  };

  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} ${playfair.variable} ${manrope.variable} font-sans bg-background text-secondary antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
