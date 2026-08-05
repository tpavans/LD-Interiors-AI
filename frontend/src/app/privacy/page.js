"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Lock, Eye, Database, PhoneCall, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-wood-dark font-sans flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#423525] via-[#5A4732] to-[#6D553B] text-white py-12 px-6 sm:px-12 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#EBDCC5]/80 mb-3 font-medium">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Legal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EBDCC5]">Privacy Policy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <Lock className="h-8 w-8 text-[#EBDCC5]" />
            {isTelugu ? "గోప్యతా విధానం (Privacy Policy)" : "Privacy Policy"}
          </h1>
          <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light">
            {isTelugu 
              ? "మీ వ్యక్తిగత డేటా భద్రత, ఆర్డర్ల గోప్యత మరియు LD ఇంటీరియర్స్ గోప్యతా నియమాలు."
              : "How LD Interiors protects your personal information, custom project dimensions, contact details, and payment privacy."}
          </p>
          <p className="mt-1 text-[11px] text-[#EBDCC5]/60 font-mono">
            Last Updated: August 2026 | LD Interiors & Furnitures (ldinteriors.in)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-12 py-10 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-wood-border/30 space-y-8 text-left">
          
          {/* Privacy Guarantee Box */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-0.5">100% Privacy & Data Security Guarantee</span>
              At LD Interiors & Furnitures, we respect your privacy. We <strong>never sell, rent, or share</strong> your personal contact information, home addresses, or architectural floor plans with third-party advertisers.
            </div>
          </div>

          {/* Section 1: Information We Collect */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">1</span>
              {isTelugu ? "1. మేము సేకరించే సమాచారం (Information We Collect)" : "1. Information We Collect"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              When you browse our catalog, submit custom order quotes, schedule workshop tours, or place orders, we collect relevant information necessary to deliver exceptional woodwork services:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-wood-accent" /> Contact Details
                </h3>
                <p className="text-slate-600 leading-relaxed">Name, phone number, WhatsApp number, email address, and delivery site address.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-wood-accent" /> Custom Project Specifications
                </h3>
                <p className="text-slate-600 leading-relaxed">Room measurements, door frame dimensions (Gummalu), wood polish preferences, and reference photos.</p>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Data */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">2</span>
              {isTelugu ? "2. సమాచారాన్ని ఎలా ఉపయోగిస్తాం" : "2. How We Use Your Information"}
            </h2>
            <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1.5 pl-2 leading-relaxed">
              <li><strong>Order Processing & Customization:</strong> To craft your furniture according to exact dimensions and wood specifications.</li>
              <li><strong>Workshop Progress Updates:</strong> To send real-time WhatsApp photos & video logs of wood carving and polish progress.</li>
              <li><strong>Delivery & On-Site Assembly:</strong> To coordinate safe freight transport and carpenter installation at your home.</li>
              <li><strong>Invoice & Warranty Records:</strong> To maintain official purchase records for GST tax compliance and lifetime wood warranty.</li>
            </ul>
          </section>

          {/* Section 3: Data Protection & Cookies */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">3</span>
              {isTelugu ? "3. డేటా భద్రత & కుకీలు (Data Security & Cookies)" : "3. Website Security & Cookies"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Our website uses SSL encryption (HTTPS) to safeguard data transmission. Local browser storage is used solely to save your wishlist items, active cart, and language preferences (Telugu/English) for a smooth browsing experience.
            </p>
          </section>

          {/* Section 4: Contact Officer */}
          <section className="space-y-3 bg-[#423525] text-white p-6 rounded-2xl">
            <h2 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              {isTelugu ? "గోప్యతా సహాయం (Privacy Contact)" : "4. Contact Privacy Officer"}
            </h2>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              For any privacy concerns, data deletion requests, or questions regarding your personal details, contact:
            </p>
            <div className="pt-2 text-xs text-white space-y-1 font-mono">
              <p>📍 <strong>LD Interiors:</strong> Mulasthanam, Alamuru Mandal, Konaseema District, AP - 533233</p>
              <p>📞 <strong>Phone / WhatsApp:</strong> +91 63012 90966 / +91 93463 25291</p>
              <p>🌐 <strong>Website:</strong> <a href="https://www.ldinteriors.in" className="text-[#EBDCC5] underline">ldinteriors.in</a></p>
            </div>
          </section>

          {/* Footer Nav Links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-wood-border/20 text-xs text-wood-light">
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-wood-accent underline font-semibold">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:text-wood-accent underline font-semibold">Refund & Cancellation Policy</Link>
              <span>•</span>
              <Link href="/contact" className="hover:text-wood-accent underline font-semibold">Contact Us</Link>
            </div>
            <Link href="/" className="text-wood-accent font-bold hover:underline">
              ← Return to Main Store
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
