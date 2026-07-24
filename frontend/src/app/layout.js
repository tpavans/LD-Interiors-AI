import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import WhatsAppWidget from "@/components/WhatsAppWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL('https://ldinteriors.in'),
  title: "LD Interiors & Furnitures | Premium Custom Woodwork & Interior Design",
  description: "Official online store & portfolio of LD Interiors & Furnitures, Alamuru. Discover handcrafted teak wood furniture, living rooms, bedrooms, kitchens, and custom woodwork.",
  alternates: {
    canonical: 'https://ldinteriors.in',
  },
  openGraph: {
    title: "LD Interiors & Furnitures",
    description: "Handcrafted Teak Wood Furniture & Custom Interior Design Showcase, Alamuru.",
    url: 'https://ldinteriors.in',
    siteName: 'LD Interiors & Furnitures',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-neutral-800 antialiased font-sans">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow wood-plank-bg">
            {children}
          </main>
          <Footer />
          <ClientWrapper />
          <WhatsAppWidget />
        </LanguageProvider>
      </body>
    </html>
  );
}
