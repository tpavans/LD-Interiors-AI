"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ShieldCheck, 
  FileText, 
  Lock, 
  RefreshCw, 
  Truck, 
  Hammer, 
  PhoneCall, 
  ChevronRight, 
  CheckCircle2, 
  Building2, 
  Scale, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function TermsPage() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';
  const [activeSection, setActiveSection] = useState('all');

  const sections = [
    { id: 'sec-1', title: isTelugu ? '1. ఒప్పంద పరిధి & సంస్థ వివరాలు' : '1. Scope of Agreement & Business Identity' },
    { id: 'sec-2', title: isTelugu ? '2. కస్టమ్ టేకువుడ్ ఆర్డర్లు & ప్రామాణికాలు' : '2. Custom Teakwood Orders & Craft Standards' },
    { id: 'sec-3', title: isTelugu ? '3. ధరలు & పేమెంట్ నిబంధనలు' : '3. Pricing, Deposits & Payment Terms' },
    { id: 'sec-4', title: isTelugu ? '4. రవాణా, డెలివరీ & ఇన్‌స్టాలేషన్' : '4. Transit, Delivery & Installation' },
    { id: 'sec-5', title: isTelugu ? '5. వారంటీ & నాణ్యత హామీ' : '5. Wood Warranty & Termite Guarantee' },
    { id: 'sec-6', title: isTelugu ? '6. కాపీరైట్స్ & మేధో సంపత్తి' : '6. Intellectual Property & Designs' },
    { id: 'sec-7', title: isTelugu ? '7. బాధ్యత పరిమితి & వివాద పరిష్కారం' : '7. Liability Limitation & Jurisdiction' },
  ];

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
            <span className="text-[#EBDCC5] font-bold">Terms of Service & Sales Agreement</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBDCC5]/20 text-[#EBDCC5] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#EBDCC5]/30">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Official Enterprise Agreement
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <FileText className="h-9 w-9 text-[#EBDCC5] shrink-0" />
                {isTelugu ? "నిబంధనలు & సర్వీస్ ఒప్పందం" : "Terms of Service & Conditions"}
              </h1>
              <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light leading-relaxed">
                {isTelugu 
                  ? "ఎల్ డి ఇంటీరియర్స్ & ఫర్నిచర్స్ ఈ-కామర్స్ పోర్టల్ మరియు కస్టమ్ టేకువుడ్ ఫర్నిచర్ ఆర్డర్ల అధికారిక నిబంధనలు."
                  : "Governing Agreement for custom teakwood furniture sales, architectural woodwork, structural warranties, order milestones, and client rights."}
              </p>
            </div>
            <div className="bg-[#2A2117]/80 p-4 rounded-2xl border border-[#EBDCC5]/20 shrink-0 text-left md:text-right">
              <div className="text-xs text-[#EBDCC5]/70">Effective Date: <strong className="text-white font-mono">August 2026</strong></div>
              <div className="text-xs text-[#EBDCC5]/70 mt-1">Entity: <strong className="text-white">LD Interiors & Furnitures</strong></div>
              <div className="text-[11px] text-[#EBDCC5]/60 font-mono mt-1">Reg: Mulasthanam, AP - 533233</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 flex-1 w-full">
        
        {/* Top Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs text-wood-dark">100% Burma Teak</h4>
              <p className="text-[10px] text-wood-light">Genuine Grade-A Hardwood</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Lock className="h-7 w-7 text-sky-600 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs text-wood-dark">Secure Advance</h4>
              <p className="text-[10px] text-wood-light">Milestone Payment Safety</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Truck className="h-7 w-7 text-amber-600 shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs text-wood-dark">Safe All-India Freight</h4>
              <p className="text-[10px] text-wood-light">Insured Transit Options</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-wood-border/40 shadow-xs flex items-center gap-3">
            <Hammer className="h-7 w-7 text-wood-accent shrink-0" />
            <div className="text-left">
              <h4 className="font-bold text-xs text-wood-dark">Handcrafted Quality</h4>
              <p className="text-[10px] text-wood-light">Master Artisan Carving</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-12 shadow-xl border border-wood-border/30 text-left space-y-10">
          
          {/* Quick Notice */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs flex items-start gap-3.5 leading-relaxed">
            <ShieldCheck className="h-6 w-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm block mb-1 text-amber-900">Legal Notice & Sales Agreement</span>
              Welcome to <strong>LD Interiors & Furnitures</strong>. By accessing our platform (ldinteriors.in), requesting quotations, or confirming custom woodwork orders with our master artisans, you enter into a binding agreement subject to the terms detailed below.
            </div>
          </div>

          {/* Section 1 */}
          <section id="sec-1" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">1</span>
              {isTelugu ? "సంస్థ పరిధి & వివరాలు" : "Scope of Agreement & Business Identity"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>LD Interiors & Furnitures</strong> (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;) operates as a registered custom furniture manufacture and interior design firm with registered workshop premises located at:
            </p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1 font-mono">
              <p>📍 <strong>Workshop Address:</strong> Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh - 533233, India</p>
              <p>📞 <strong>Chief Carpenter & Manager (Nagaraju):</strong> +91 62816 53998</p>
              <p>💻 <strong>Technical Lead (Pavan Sai):</strong> +91 93463 25291</p>
              <p>🌐 <strong>Official Website:</strong> <a href="https://www.ldinteriors.in" className="text-wood-accent underline">https://www.ldinteriors.in</a></p>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              These terms govern all transactions, site visits, catalog requests, custom joinery, delivery, and warranty services performed by our team.
            </p>
          </section>

          {/* Section 2 */}
          <section id="sec-2" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">2</span>
              {isTelugu ? "కస్టమ్ టేకువుడ్ ఆర్డర్లు & సహజ లక్షణాలు" : "Custom Teakwood Orders & Natural Material Standards"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All furniture, architectural entrance doors (Gummalu), puja mandirams, and luxury items are manufactured using <strong>100% genuine Grade-A Burma or Seasoned Teakwood</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200">
                <h3 className="font-bold text-xs text-sky-950 flex items-center gap-2 mb-1.5">
                  <Hammer className="h-4 w-4 text-sky-600" /> Natural Grains & Color Variations
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Real teakwood displays unique golden-brown grain patterns, natural oil veins, and subtle color shade shifts. These variations verify 100% natural solid wood and are not flaws.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <h3 className="font-bold text-xs text-emerald-950 flex items-center gap-2 mb-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Custom Dimensions & Tolerances
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  For custom door frames and built-in wardrobes, final site measurements are verified. Hand-planed joinery maintains standard industry tolerances of +/- 2mm.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="sec-3" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">3</span>
              {isTelugu ? "ధరలు & పేమెంట్ నిబంధనలు" : "Pricing, Order Advance & Payment Terms"}
            </h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p>• <strong>Transparent Quotes:</strong> Prices quoted reflect timber volume, wood grade, carving detail, and polish selection.</p>
              <p>• <strong>Advance Deposit:</strong> A minimum advance deposit (30% to 50%) is required to initiate timber selection and hand-carving.</p>
              <p>• <strong>Progress Logs:</strong> Clients receive video and photo updates via WhatsApp during wood cutting, joinery, and polish stages.</p>
              <p>• <strong>Final Settlement:</strong> Remaining balance must be cleared prior to dispatch or final installation at site.</p>
              <p>• <strong>Tax Invoices:</strong> Official GST invoices are generated for residential & commercial interior contracts upon request.</p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="sec-4" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">4</span>
              {isTelugu ? "రవాణా, డెలివరీ & ఇన్‌స్టాలేషన్" : "Shipping, Freight & On-Site Installation"}
            </h2>
            <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200 text-xs sm:text-sm text-slate-700 space-y-2">
              <p className="font-bold text-amber-900 flex items-center gap-2">
                <Truck className="h-4 w-4 text-amber-600" /> Pan-India Transport & Safety Packaging
              </p>
              <p>• Heavy solid wood furniture is packed with multi-layer foam, corrugated guards, and stretch wrap.</p>
              <p>• Transit insurance coverage is available for long-distance interstate shipments.</p>
              <p>• On-site installation and fitting services are available across Andhra Pradesh and Telangana.</p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="sec-5" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">5</span>
              {isTelugu ? "వారంటీ & నాణ్యత హామీ" : "Teakwood Warranty & Termite Guarantee"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Grade-A Burma Teak contains natural silica and essential oils making it immune to wood borer and termite attacks under indoor usage.
            </p>
            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-wood-border/40 text-xs text-wood-dark space-y-1.5">
              <p><strong>✓ Lifetime Structural Guarantee:</strong> Guaranteed against wood decay or termite infestation under normal residential indoor use.</p>
              <p><strong>❌ Exclusions:</strong> Does not cover physical impact, intentional damage, direct immersion in standing water, or chemical spills.</p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="sec-6" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">6</span>
              {isTelugu ? "కాపీరైట్స్ & మేధో సంపత్తి" : "Intellectual Property & Design Copyrights"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All 3D interior renders, carving stencils, photography, video reels, and software logic published on <strong>ldinteriors.in</strong> remain exclusive intellectual property of LD Interiors & Furnitures.
            </p>
          </section>

          {/* Section 7 */}
          <section id="sec-7" className="space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-wood-dark border-b border-wood-border/20 pb-2.5 flex items-center gap-3">
              <span className="bg-[#3B2F21] text-white text-xs px-3 py-1 rounded-full font-mono">7</span>
              {isTelugu ? "బాధ్యత పరిమితి & వివాద పరిష్కారం" : "Limitation of Liability & Legal Jurisdiction"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Any legal disputes or claims arising under this agreement shall be governed under the exclusive jurisdiction of the competent courts of <strong>Konaseema District, Andhra Pradesh, India</strong>.
            </p>
          </section>

          {/* Contact Support Officer Box */}
          <section className="bg-gradient-to-br from-[#3B2F21] to-[#52412E] text-white p-6 sm:p-8 rounded-3xl space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              Customer Support & Order Inquiries
            </h3>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              For any questions regarding custom orders, terms, or timber inspection visits:
            </p>
            <div className="pt-2 text-xs text-white space-y-1.5 font-mono">
              <p>📍 <strong>Workshop:</strong> LD Interiors, Mulasthanam, Alamuru Mandal, Konaseema Dist, AP - 533233</p>
              <p>📞 <strong>Chief Carpenter (Nagaraju):</strong> +91 62816 53998</p>
              <p>💻 <strong>Technical Lead (Pavan Sai):</strong> +91 93463 25291</p>
              <p>💬 <strong>WhatsApp Chat:</strong> <a href="https://wa.me/916281653998" className="text-[#EBDCC5] underline">Click here to chat on WhatsApp (+91 62816 53998)</a></p>
            </div>
          </section>

          {/* Footer Nav Links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-wood-border/20 text-xs text-wood-light">
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-wood-accent underline font-semibold">Privacy Policy</Link>
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
    </div>
  );
}
