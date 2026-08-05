"use client";
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, FileText, Lock, RefreshCw, Truck, Hammer, PhoneCall, ChevronRight } from 'lucide-react';

export default function TermsPage() {
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
            <span className="text-[#EBDCC5]">Terms & Conditions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#EBDCC5]" />
            {isTelugu ? "నిబంధనలు & షరతులు (Terms & Conditions)" : "Terms & Conditions"}
          </h1>
          <p className="mt-2 text-sm text-[#EBDCC5]/90 max-w-2xl font-light">
            {isTelugu 
              ? "ఎల్ డి ఇంటీరియర్స్ & ఫర్నిచర్స్ సేవలు, కస్టమ్ ఆర్డర్లు, నాణ్యత హామీ మరియు కొనుగోలు నిబంధనలు."
              : "Official Agreement governing the use of LD Interiors website, custom woodwork orders, warranty, and craftsmanship terms."}
          </p>
          <p className="mt-1 text-[11px] text-[#EBDCC5]/60 font-mono">
            Last Updated: August 2026 | Effective for LD Interiors & Furnitures (ldinteriors.in)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 sm:px-12 py-10 flex-1">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-wood-border/30 space-y-8">
          
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Welcome to LD Interiors & Furnitures!</span> By browsing our website, booking workshop tours, or placing custom furniture orders with our master craftsmen (Nagaraju & Team), you agree to these Terms and Conditions.
            </div>
          </div>

          {/* Section 1: Business Identification */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">1</span>
              {isTelugu ? "1. సంస్థ వివరాలు (Company Information)" : "1. About LD Interiors & Business Scope"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              <strong>LD Interiors & Furnitures</strong> (&quot;Company&quot;, &quot;We&quot;, &quot;Us&quot;, &quot;Our&quot;) is a premier handcrafted woodwork enterprise headquartered in <strong>Mulasthanam, Alamuru Mandal, Konaseema District, Andhra Pradesh (PIN: 533233)</strong>. We specialize in 100% Grade-A Burma Teakwood furniture, custom doors, puja mandirams, dining sets, living room cabinets, and full home interior carpentry services.
            </p>
            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 pl-2">
              <li><strong>Official Website:</strong> <a href="https://www.ldinteriors.in" className="text-wood-accent underline">https://www.ldinteriors.in</a></li>
              <li><strong>Founder & Master Craftsman:</strong> Mr. Nagaraju (+91 63012 90966)</li>
              <li><strong>Technical & Orders Lead:</strong> Pavan Sai (+91 93463 25291)</li>
            </ul>
          </section>

          {/* Section 2: Custom Teakwood Orders & Craftsmanship */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">2</span>
              {isTelugu ? "2. కస్టమ్ ఆర్డర్లు & టేకువుడ్ నాణ్యత (Custom Orders & Natural Teak Characteristics)" : "2. Custom Woodwork & Material Specifications"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All furniture and architectural wood products listed on LD Interiors are handcrafted using <strong>100% genuine Grade-A Burma / Seasoned Teakwood</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200">
                <h3 className="font-bold text-xs text-sky-900 flex items-center gap-1.5 mb-1">
                  <Hammer className="h-4 w-4 text-sky-600" /> Natural Wood Grains & Colors
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Natural teakwood features unique grain patterns, natural knots, and subtle color variations. These are inherent characteristics of real wood and confirm authentic craftsmanship.
                </p>
              </div>
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <h3 className="font-bold text-xs text-emerald-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Precision & Custom Measurements
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  For custom doors (Gummalu), beds, and puja mandirs, final dimensions are confirmed prior to carving. Slight millimeter tolerances (+/- 2mm) exist in hand-planed joinery.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Pricing, Deposit & Payment Terms */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">3</span>
              {isTelugu ? "3. ధరలు, అడ్వాన్స్ డిపాజిట్ & పేమెంట్ నిబంధనలు" : "3. Pricing, Order Advance & Payment Milestones"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              We maintain transparent pricing for all custom wood creations. Prices may vary depending on wood grade, carving complexity, custom dimensions, and polish finishes.
            </p>
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p><strong>• Advance Deposit:</strong> Custom furniture orders require an initial advance deposit (typically 30% - 50%) to initiate timber selection and hand-carving.</p>
              <p><strong>• Milestone Updates:</strong> Progress photos and workshop video logs are shared with customers via WhatsApp during wood cutting, carving, and polish phases.</p>
              <p><strong>• Final Balance:</strong> Remaining balance payment is due prior to final dispatch or installation at the customer site.</p>
              <p><strong>• GST Invoices:</strong> Official GST tax invoices can be generated upon request for business and residential projects.</p>
            </div>
          </section>

          {/* Section 4: Shipping, Delivery & Installation */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">4</span>
              {isTelugu ? "4. డెలివరీ, షిప్పింగ్ & ఇన్‌స్టాలేషన్" : "4. Shipping, Delivery & On-Site Installation"}
            </h2>
            <div className="flex items-start gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-200">
              <Truck className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 space-y-1">
                <p><strong>• Safe Delivery Across India:</strong> Heavy wood items are packed using protective foam corner guards and bubble wraps. Transport is handled via trusted logistics partners.</p>
                <p><strong>• Transit Insurance:</strong> Major freight items can be insured for safe transit.</p>
                <p><strong>• On-Site Fitting:</strong> On-site carpentry installation (Doors, Mandirs, Modular Interiors) is available across Andhra Pradesh & Telangana upon agreement.</p>
              </div>
            </div>
          </section>

          {/* Section 5: Lifetime Warranty & Care Guide */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">5</span>
              {isTelugu ? "5. వారంటీ & సంరక్షణ మార్గదర్శకాలు" : "5. Teakwood Warranty & Quality Guarantee"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              LD Interiors guarantees 100% solid teakwood against termite infestation and structural wood defects under normal indoor usage conditions.
            </p>
            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-wood-border/40 text-xs text-wood-dark space-y-1.5">
              <p><strong>✓ Termite & Borer Resistance:</strong> Grade-A Burma Teak contains natural silica and essential oils that resist termites for decades.</p>
              <p><strong>❌ Exclusions:</strong> Warranty does not cover damages caused by direct water immersion, harsh chemicals, fire accidents, or physical abuse after delivery.</p>
            </div>
          </section>

          {/* Section 6: Intellectual Property & Media */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-wood-dark border-b border-wood-border/20 pb-2 flex items-center gap-2">
              <span className="bg-[#423525] text-white text-xs px-2.5 py-0.5 rounded-full font-mono">6</span>
              {isTelugu ? "6. కాపీరైట్ & డిజైన్స్ హక్కులు" : "6. Intellectual Property Rights"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              All photography, 3D design mockups, carving templates, workshop reels, and website content on <strong>ldinteriors.in</strong> are exclusive property of LD Interiors & Furnitures. Unauthorized reproduction or commercial misuse of our original carving designs is strictly prohibited.
            </p>
          </section>

          {/* Section 7: Contact for Legal & Terms Queries */}
          <section className="space-y-3 bg-[#423525] text-white p-6 rounded-2xl">
            <h2 className="font-serif text-lg font-bold text-[#EBDCC5] flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-[#EBDCC5]" />
              {isTelugu ? "సంప్రదించండి (Contact & Legal Help)" : "7. Questions & Customer Support"}
            </h2>
            <p className="text-xs text-[#EBDCC5]/90 leading-relaxed">
              If you have any questions regarding these Terms & Conditions or wish to discuss a custom order agreement, please reach out directly:
            </p>
            <div className="pt-2 text-xs text-white space-y-1.5 font-mono">
              <p>📍 <strong>Workshop Address:</strong> LD Interiors, Mulasthanam, Alamuru Mandal, Konaseema District, AP - 533233</p>
              <p>📞 <strong>Chief Carpenter (Nagaraju):</strong> +91 63012 90966</p>
              <p>💻 <strong>Technical Lead (Pavan Sai):</strong> +91 93463 25291</p>
              <p>💬 <strong>WhatsApp Inquiry:</strong> <a href="https://wa.me/916301290966" className="text-[#EBDCC5] underline">Click to chat on WhatsApp</a></p>
            </div>
          </section>

          {/* Footer Nav Links */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-wood-border/20 text-xs text-wood-light">
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-wood-accent underline font-semibold">Privacy Policy</Link>
              <span>•</span>
              <Link href="/refund-policy" className="hover:text-wood-accent underline font-semibold">Refund & Cancellation Policy</Link>
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
