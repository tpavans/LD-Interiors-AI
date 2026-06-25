import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({
  subsets: ["sans-serif", "latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "LD Interiors & Furnitures | Curated Premium Design Showcase",
  description: "Browse high-quality interior design galleries updated daily. Discover bespoke living rooms, bedrooms, workspaces, and kitchen concepts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-800 antialiased font-sans">
        <Navbar />
        <main className="flex-grow wood-plank-bg">
          {children}
        </main>
        <Footer />
        <ClientWrapper />
      </body>
    </html>
  );
}
