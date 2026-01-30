import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; // We'll need to create this util or remove if not using yet

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Oladimeji Abubakar — Product Designer",
  description: "Product Designer crafting intuitive and scalable digital products. Specializing in B2C, SaaS, and Design Systems.",
  keywords: ["Product Designer", "UX Designer", "UI Designer", "Design Systems", "SaaS Design", "B2C Product Design", "Oladimeji Abubakar"],
  openGraph: {
    title: "Oladimeji Abubakar — Product Designer",
    description: "Product Designer crafting intuitive and scalable digital products. Specializing in B2C, SaaS, and Design Systems.",
    type: "website",
    locale: "en_US",
    siteName: "Oladimeji Abubakar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oladimeji Abubakar — Product Designer",
    description: "Product Designer crafting intuitive and scalable digital products.",
    creator: "@uxdimeji", // Assuming handle based on folder name, user can update later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} ${playfair.variable} font-sans bg-background text-secondary antialiased`}>
        {children}
      </body>
    </html>
  );
}
