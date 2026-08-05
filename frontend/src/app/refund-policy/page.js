"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { RefreshCw, RotateCcw, AlertCircle, ShieldCheck, PhoneCall, ChevronRight, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function RefundPolicyPage() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-wood-dark font-sans flex flex-col">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#3B2F21] via-[#52412E] to-[#6A543D] text-white py-14 px-6 sm:px-12 relative overflow-hidden border-b border-wood-border/30">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-xs text-[#EBDCC5]/80 mb-3 font-medium">
            <Link href="/" className="hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span>Legal Portal</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#EBDCC5] font-bold">Refund, Return & Cancellation Policy</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2 border border-amber-400/30">
                <RotateCcw className="h-3.5 w-3.5 text-amber-300" /> Fair & Transparent Terms
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <RotateCcw className="h-9 w-9 text-[#EBDCC5] shrink-0" />
                {isTelugu ? "రీఫండ్, రిటర్న్ & క్యాన్సిలేషన్ నిబంధనలు" : "Refund, Return & Cancellation Policy"}
              </h1>
              <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light leading-relaxed">
                {isTelugu 
                  ? "కస్టమ్ టేకువుడ్ ఆర్డర్ల క్యాన్సిలేషన్, ట్రాన్సిట్ డ్యామేజ్ ప్రొటెక్షన్ మరియు రీఫండ్ ప్రాసెసింగ్ నిబంధనలు."
                  : "Transparent guidelines governing custom woodwork cancellations, pre-production modifications, transit damage coverage, and replacement services."}
              </p>
            </div>
            <div className="bg-[#2A2117]/80 p-4 rounded-2xl border border-[#EBDCC5]/20 shrink-0 text-left md:text-right">
              <div className="text-xs text-[#EBDCC5]/70">Effective Date: <strong className="text-white font-mono">August 2026</strong></div>
              <div className="text-xs text-[#EBDCC5]/70 mt-1">Satisfaction Guarantee: <strong className="text-amber-400">100% Commitment</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        
        {/* Top Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Clock className="h-7 w-7 text-amber-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">48-Hour Free Modification</h4>
              <p className="text-[10px] text-wood-light">Before timber cutting begins</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Truck className="h-7 w-7 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">Transit Damage Cover</h4>
              <p className="text-[10px] text-wood-light">Free Touch-up / Exchange</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <RefreshCw className="h-7 w-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">5-7 Days Refund Execution</h4>
              <p className="text-[10px] text-wood-light">Direct Bank / UPI Transfer</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-wood-border/30 text-left space-y-10">
          
          {/* Commitment Notice */}
          <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs flex items-start gap-3.5 leading-relaxed">
            <ShieldCheck className="h-6 w-6 text-sky-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-1 text-sky-900">Craftsmanship Quality Assurance</span>
              At <strong>LD Interiors & Furnitures</strong>, master artisan Nagaraju and our team inspect every teak log and carving prior to dispatch. We ensure complete transparency regarding order modifications, cancellations, and damage claims.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">1</span>
              {isTelugu ? "ఆర్డర్ క్యాన్సిలేషన్ & సైజ్ మార్పుల నిబంధనలు" : "Order Cancellation & Modification Terms"}
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <h3 className="font-bold text-xs text-emerald-950 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Pre-Production Cancellation (Within 48 Hours)
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Orders may be cancelled or modified with full refund within 48 hours of placing the advance deposit, provided raw teakwood log cutting and carving has not yet commenced.
                </p>
              </div>
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200">
                <h3 className="font-bold text-xs text-amber-950 mb-1 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" /> Post-Carving Cancellation Policy
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Because custom items (door frames, mandirams, beds) are custom-cut to specific millimeter measurements, advance deposits become non-refundable once custom timber cutting and hand-carving has been initiated.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">2</span>
              {isTelugu ? "రవాణాలో నష్టం జరిగినప్పుడు సేవలు" : "Transit Damage Protection & Free Exchange Guarantee"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              We package heavy furniture with multi-layer foam guards to prevent transport damage. However, if your shipment arrives with transit scratches or structural defects:
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2 font-mono">
              <p className="font-bold text-slate-900 font-sans">Required Steps for Damage Claim:</p>
              <p>1. Notify us within <strong>48 hours of delivery</strong> via WhatsApp (+91 62816 53998).</p>
              <p>2. Share unboxing photos/videos showing the damaged transport packaging and wood section.</p>
              <p>3. Our workshop will immediately send a touch-up carpenter, dispatch replacement parts, or process a full replacement free of charge.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">3</span>
              {isTelugu ? "రీఫండ్ ప్రాసెసింగ్ సమయం" : "Refund Processing Execution & Timeline"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              When an eligible refund is approved (e.g. pre-production cancellation or verified return), refunds will be processed directly to your original bank account or UPI within <strong>5 to 7 business days</strong>.
            </p>
          </section>

          {/* Section 4 Support Box */}
          <section className="bg-gradient-to-br from-[#3B2F21] to-[#52412E] text-white p-6 sm:p-8 rounded-3xl space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              Refund & Order Modification Support
            </h3>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              To request an order modification or report delivery damage, reach out directly:
            </p>
            <div className="pt-2 text-xs text-white space-y-1.5 font-mono">
              <p>📍 <strong>Workshop:</strong> LD Interiors, Mulasthanam, Alamuru Mandal, Konaseema Dist, AP - 533233</p>
              <p>📞 <strong>Chief Carpenter & Manager (Nagaraju):</strong> +91 62816 53998</p>
              <p>💻 <strong>Technical Lead (Pavan Sai):</strong> +91 93463 25291</p>
              <p>💬 <strong>WhatsApp Direct:</strong> <a href="https://wa.me/916281653998" className="text-[#EBDCC5] underline">Chat on WhatsApp (+91 62816 53998)</a></p>
            </div>
          </section>

          {/* Footer Nav Links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-wood-border/20 text-xs text-wood-light">
            <div className="flex items-center gap-4">
              <Link href="/terms" className="hover:text-wood-accent underline font-semibold">Terms & Conditions</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-wood-accent underline font-semibold">Privacy Policy</Link>
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
