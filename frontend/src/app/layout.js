import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientWrapper from "@/components/ClientWrapper";
import { LanguageProvider } from "@/context/LanguageContext";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import InstallAppBanner from "@/components/InstallAppBanner";
import { ThemeProvider } from "@/context/ThemeContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
  metadataBase: new URL('https://www.ldinteriors.in'),
  title: "LD Interiors & Furnitures | Premium Custom Woodwork & Interior Design",
  description: "Official online store & portfolio of LD Interiors & Furnitures, Alamuru. Discover handcrafted teak wood furniture, living rooms, bedrooms, kitchens, and custom woodwork.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LD Interiors',
  },
  alternates: {
    canonical: 'https://www.ldinteriors.in',
  },
  openGraph: {
    title: "LD Interiors & Furnitures | Alamuru",
    description: "Handcrafted Teak Wood Furniture & Custom Interior Design Showcase, Alamuru.",
    url: 'https://www.ldinteriors.in',
    siteName: 'LD Interiors & Furnitures',
    images: [
      {
        url: 'https://www.ldinteriors.in/og-image.jpg',
        secureUrl: 'https://www.ldinteriors.in/og-image.jpg',
        width: 1200,
        height: 1200,
        type: 'image/jpeg',
        alt: 'LD Interiors & Furnitures Logo'
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: 'https://www.ldinteriors.in/logo.png', type: 'image/png' },
      { url: 'https://www.ldinteriors.in/favicon.ico' },
    ],
    shortcut: ['/icons/icon-192x192.png'],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LD Interiors & Furnitures | Alamuru',
    description: 'Handcrafted Teak Wood Furniture & Custom Interior Design Showcase, Alamuru.',
    images: ['https://www.ldinteriors.in/og-image.jpg'],
  },
  other: {
    'p:domain_verify': '6994d5bfbe5409fed21a03c84411',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#0B192C',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  'name': 'LD Interiors & Furnitures',
  'url': 'https://www.ldinteriors.in',
  'logo': 'https://www.ldinteriors.in/logo.png',
  'contactPoint': {
    '@type': 'ContactPoint',
    'telephone': '+916281653998',
    'contactType': 'customer service',
    'areaServed': 'IN',
    'availableLanguage': ['en', 'te']
  },
  'address': {
    '@type': 'PostalAddress',
    'streetAddress': 'Mulasthanam, Alamuru Mandal',
    'addressLocality': 'Konaseema District',
    'addressRegion': 'Andhra Pradesh',
    'postalCode': '533233',
    'addressCountry': 'IN'
  },
  'telephone': '+916281653998'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full transition-colors duration-300`}>
      <head>
        <meta name="p:domain_verify" content="6994d5bfbe5409fed21a03c84411" />
        <meta name="theme-color" content="#0B192C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="LD Interiors" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-neutral-800 dark:text-slate-100 antialiased font-sans pb-16 md:pb-0 transition-colors duration-300">
        <GoogleAnalytics />
        <ThemeProvider>
          <LanguageProvider>
            <Navbar />
            <main className="flex-grow wood-plank-bg dark:wood-plank-bg-dark pt-[104px] md:pt-24 transition-colors duration-300">
              {children}
            </main>
            <Footer />
            <ClientWrapper />
            <WhatsAppWidget />
            <MobileBottomNav />
            <InstallAppBanner />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
