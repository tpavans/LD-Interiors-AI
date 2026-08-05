"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Lock, Eye, Database, PhoneCall, ChevronRight, CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <span className="text-[#EBDCC5] font-bold">Privacy & Data Security Policy</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-400/30">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> 100% Data Protection Guarantee
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <Lock className="h-9 w-9 text-[#EBDCC5] shrink-0" />
                {isTelugu ? "గోప్యతా విధానం (Privacy Policy)" : "Privacy & Data Security Policy"}
              </h1>
              <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light leading-relaxed">
                {isTelugu 
                  ? "మీ వ్యక్తిగత వివరాల రక్షణ, వాట్సాప్ కమ్యూనికేషన్ గోప్యత మరియు LD ఇంటీరియర్స్ డేటా భద్రతా నియమాలు."
                  : "How LD Interiors protects your personal contact details, architectural dimensions, site addresses, and payment privacy."}
              </p>
            </div>
            <div className="bg-[#2A2117]/80 p-4 rounded-2xl border border-[#EBDCC5]/20 shrink-0 text-left md:text-right">
              <div className="text-xs text-[#EBDCC5]/70">Effective Date: <strong className="text-white font-mono">August 2026</strong></div>
              <div className="text-xs text-[#EBDCC5]/70 mt-1">Protection Level: <strong className="text-emerald-400">Strict Enterprise Grade</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        
        {/* Top Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Lock className="h-7 w-7 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">No Third-Party Sharing</h4>
              <p className="text-[10px] text-wood-light">Your data is never sold or rented</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Database className="h-7 w-7 text-sky-600 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">Encrypted Transactions</h4>
              <p className="text-[10px] text-wood-light">SSL Protected Connections</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <UserCheck className="h-7 w-7 text-wood-accent shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-wood-dark">Direct Owner Privacy</h4>
              <p className="text-[10px] text-wood-light">Managed by Nagaraju & Pavan Sai</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-wood-border/30 text-left space-y-10">
          
          {/* Privacy Guarantee Box */}
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-3.5 leading-relaxed">
            <ShieldCheck className="h-6 w-6 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-1 text-emerald-900">Zero Commercial Data Abuse Policy</span>
              At <strong>LD Interiors & Furnitures</strong>, we respect your privacy. We <strong>never sell, rent, or trade</strong> customer telephone numbers, site addresses, architectural blueprints, or order logs with marketing agencies.
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">1</span>
              {isTelugu ? "మేము సేకరించే సమాచారం" : "Information We Collect & Store"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              To deliver custom wood products and coordinate site carpentry, we collect only necessary project information:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-xs text-slate-900 mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wood-accent" /> Client Contact & Delivery Data
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">Name, phone number, WhatsApp contact, delivery address, and GST billing details.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="font-bold text-xs text-slate-900 mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-wood-accent" /> Custom Project Specifications
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">Door frame measurements (Gummalu), room layout blueprints, reference carving photos, and polish finish choices.</p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">2</span>
              {isTelugu ? "సమాచారాన్ని ఎలా ఉపయోగిస్తాం" : "Purpose & Utilization of Data"}
            </h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p>• <strong>Custom Manufacturing:</strong> To precision-craft furniture according to confirmed size specifications.</p>
              <p>• <strong>WhatsApp Workshop Updates:</strong> To send real-time video logs of timber cutting, carving, and polish progress directly to you.</p>
              <p>• <strong>Freight & On-Site Assembly:</strong> To coordinate logistics transport and local carpenter fitting at your residence.</p>
              <p>• <strong>GST Invoices & Warranty Verification:</strong> To store purchase records for official tax invoicing and lifetime wood guarantee.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">3</span>
              {isTelugu ? "డేటా భద్రత & కుకీల విధానం" : "Data Security, Cookies & Browser Storage"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Our web application utilizes SSL encryption (HTTPS) for all API transmissions. Local browser storage is strictly used to store your active wishlist items, cart selections, and language toggle state (Telugu/English).
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-gradient-to-br from-[#3B2F21] to-[#52412E] text-white p-6 sm:p-8 rounded-3xl space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              Privacy Officer & Contact Details
            </h3>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              For data privacy inquiries, deletion requests, or contract verification:
            </p>
            <div className="pt-2 text-xs text-white space-y-1.5 font-mono">
              <p>📍 <strong>Workshop:</strong> LD Interiors, Mulasthanam, Alamuru Mandal, Konaseema Dist, AP - 533233</p>
              <p>📞 <strong>Chief Carpenter & Manager (Nagaraju):</strong> +91 62816 53998</p>
              <p>💻 <strong>Technical Lead (Pavan Sai):</strong> +91 93463 25291</p>
              <p>💬 <strong>WhatsApp Direct:</strong> <a href="https://wa.me/916281653998" className="text-[#EBDCC5] underline">Chat with Nagaraju (+91 62816 53998)</a></p>
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
