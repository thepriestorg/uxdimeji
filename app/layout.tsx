import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"; // We'll need to create this util or remove if not using yet

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Abubakar Oladimeji | Product Designer",
  description: "Portfolio of Abubakar Oladimeji, a Product Designer focusing on clear, useful interfaces.",
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
