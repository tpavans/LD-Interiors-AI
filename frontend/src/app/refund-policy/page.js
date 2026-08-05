"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { RefreshCw, RotateCcw, AlertCircle, ShieldCheck, PhoneCall, ChevronRight } from 'lucide-react';

export default function RefundPolicyPage() {
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
            <span className="text-[#EBDCC5]">Refund & Cancellation Policy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <RotateCcw className="h-8 w-8 text-[#EBDCC5]" />
            {isTelugu ? "రీఫండ్ & క్యాన్సిలేషన్ నిబంధనలు" : "Refund, Return & Cancellation Policy"}
          </h1>
          <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light">
            {isTelugu 
              ? "కస్టమ్ ఫర్నిచర్ ఆర్డర్ల క్యాన్సిలేషన్, రీఫండ్ మరియు రీ-వర్క్ నిబంధనల పూర్తి వివరాలు."
              : "Clear, customer-friendly terms regarding custom teakwood order cancellations, transit damages, and replacement guarantees."}
          </p>
          <p className="mt-1 text-[11px] text-[#EBDCC5]/60 font-mono">
            Last Updated: August 2026 | LD Interiors & Furnitures (ldinteriors.in)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-12 py-10 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-wood-border/30 space-y-8 text-left">
          
          {/* Transparent Notice */}
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-0.5">Commitment to 100% Satisfaction</span>
              At LD Interiors & Furnitures, every product is handcrafted with care by master craftsmen. We ensure complete transparency regarding order modifications, cancellations, and quality inspections.
            </div>
          </div>

          {/* Section 1: Order Cancellations */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">1</span>
              {isTelugu ? "1. ఆర్డర్ క్యాన్సిలేషన్ విధానం (Order Cancellation)" : "1. Order Cancellation Terms"}
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                • <strong>Before Timber Cutting (Within 48 Hours):</strong> Orders can be cancelled or modified free of charge within 48 hours of placing the advance deposit, provided raw teak timber cutting has not begun.
              </p>
              <p>
                • <strong>After Wood Cutting & Hand-Carving Begins:</strong> Because custom items are tailored to specific sizes (doors, beds, mandirs), advance deposits are non-refundable once custom timber cutting and hand-carving has commenced.
              </p>
            </div>
          </section>

          {/* Section 2: Transit Damage & Quality Replacements */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">2</span>
              {isTelugu ? "2. రవాణాలో నష్టం జరిగినప్పుడు (Transit Damage Protection)" : "2. Transit Damage & Replacement Guarantee"}
            </h2>
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <p className="font-bold text-sm text-emerald-900">✓ Free Replacement / Touch-up Service</p>
              <p>
                If your item arrives with transit damage or polish scratches:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-2">
                <li>Notify us within <strong>48 hours of delivery</strong> via WhatsApp (+91 63012 90966) with unboxing photos/videos.</li>
                <li>Our carpenter team will provide immediate touch-up service, component replacement, or full exchange free of charge.</li>
              </ol>
            </div>
          </section>

          {/* Section 3: Refund Process */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">3</span>
              {isTelugu ? "3. రీఫండ్ ప్రాసెసింగ్ (Refund Processing Timeline)" : "3. Refund Execution & Timeline"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              In cases where an eligible refund is approved (e.g. pre-production cancellation or store credit), refunds will be processed to the original bank account or UPI within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          {/* Section 4: Customer Help Support */}
          <section className="space-y-3 bg-[#423525] text-white p-6 rounded-2xl">
            <h2 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              {isTelugu ? "సహాయక విభాగం (Refund Support)" : "4. Support & Helpdesk"}
            </h2>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              Have questions about your active order status, timber selection, or returns? Contact our workshop team directly:
            </p>
            <div className="pt-2 text-xs text-white space-y-1 font-mono">
              <p>📍 <strong>Workshop:</strong> LD Interiors, Mulasthanam, Alamuru Mandal, Konaseema District, AP - 533233</p>
              <p>📞 <strong>Direct Call / WhatsApp:</strong> +91 63012 90966 / +91 93463 25291</p>
            </div>
          </section>

          {/* Footer Nav Links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-wood-border/20 text-xs text-wood-light">
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-wood-accent underline font-semibold">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-wood-accent underline font-semibold">Privacy Policy</Link>
              <span>•</span>
              <Link href="/about" className="hover:text-wood-accent underline font-semibold">About Us</Link>
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
