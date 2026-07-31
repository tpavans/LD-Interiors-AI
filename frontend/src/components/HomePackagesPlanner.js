"use client";
import { useState } from 'react';
import { Home, Sparkles, CheckCircle2, Send, Tag, ShieldCheck, ArrowRight } from 'lucide-react';

const PACKAGES = [
  {
    id: 'royal_3bhk',
    title: 'Royal 3BHK Burma Teak Heritage Package',
    tagline: 'Complete solid Burma teakwood setup for 3BHK villas & luxury homes.',
    discountBadge: 'Save ₹65,000 Package Discount',
    originalPrice: 385000,
    packagePrice: 320000,
    advance: 160000,
    items: [
      '🚪 1x Grade-A Hand-Carved Burma Teak Main Entrance Door (7ft x 3.5ft)',
      '🛕 1x Royal Temple Puja Mandiram with Brass Bell Towers (6ft x 4ft)',
      '🛏️ 1x King-Size Burma Teak Canopy Bed with Storage',
      '🛋️ 1x 5-Seater Chesterfield Teakwood Sofa Set',
      '🪑 1x 6-Seater Solid Teakwood Dining Table & Ergonomic Chairs'
    ]
  },
  {
    id: 'master_bedroom_suite',
    title: 'Master Bedroom Teak Luxury Suite',
    tagline: 'Premium teakwood suite crafted for opulent bedroom comfort.',
    discountBadge: 'Save ₹32,000 Bundle Savings',
    originalPrice: 180000,
    packagePrice: 148000,
    advance: 74000,
    items: [
      '🛏️ 1x Teakwood King-Size Bed with Carved Headboard',
      '🪞 1x Full-Length Teakwood Dressing Table with Mirror & Drawer',
      '🚪 2x Teakwood Nightstands with Antique Brass Handles',
      '📦 1x Teakwood Money Storage Box (Hundi Style)'
    ]
  },
  {
    id: 'entrance_puja_suite',
    title: 'Grand Entrance & Sacred Puja Mandiram Bundle',
    tagline: 'Traditional South Indian entrance door & handcrafted puja mandiram.',
    discountBadge: 'Save ₹24,000 Combo Discount',
    originalPrice: 115000,
    packagePrice: 91000,
    advance: 45500,
    items: [
      '🚪 1x Traditional Gaja Lakshmi Burma Teak Door with Brass Frame',
      '🛕 1x Hand-Carved Teakwood Puja Temple with Drawers & Brass Fittings',
      '🔔 Lifetime Termite & Wood Quality Assurance Certificate'
    ]
  }
];

export default function HomePackagesPlanner({ onClose }) {
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);

  const handleInquirePackage = (pkg) => {
    const waMessage = `📦 *FULL-HOME TEAKWOOD PACKAGE INQUIRY* / LD Interiors

Hello Nagaraju garu,

I am interested in your furniture bundle package:

🏆 *Package:* ${pkg.title}
💰 *Package Offer Price:* ₹${pkg.packagePrice.toLocaleString('en-IN')} (Original: ₹${pkg.originalPrice.toLocaleString('en-IN')})
🏷️ *Savings:* ${pkg.discountBadge}
💵 *50% Booking Advance:* ₹${pkg.advance.toLocaleString('en-IN')}

Includes:
${pkg.items.map(item => `• ${item}`).join('\n')}

Can you please contact me regarding wood availability & installation timelines?

Thank you!`;

    window.open(`https://wa.me/919346325291?text=${encodeURIComponent(waMessage)}`, '_blank');
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-left animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#008DDA] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Curated Bundles
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Home className="h-6 w-6 text-[#008DDA]" />
            Whole-Home Teakwood Package Planner
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Save up to ₹65,000 by ordering curated Burma teakwood packages for your new house or renovation.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-3xl p-6 border transition-all flex flex-col justify-between select-none relative overflow-hidden ${
              selectedPkg.id === pkg.id
                ? 'border-[#008DDA] bg-gradient-to-b from-sky-50/70 to-white shadow-xl ring-2 ring-[#008DDA]/30'
                : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                  {pkg.discountBadge}
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-slate-900 leading-snug">{pkg.title}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">{pkg.tagline}</p>

              <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-slate-900">₹{pkg.packagePrice.toLocaleString('en-IN')}</span>
                  <span className="font-mono text-xs text-slate-400 line-through">₹{pkg.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">50% Advance Booking: ₹{pkg.advance.toLocaleString('en-IN')}</p>
              </div>

              <div className="space-y-2 mb-6 text-xs text-slate-700 font-medium">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Package Components:</span>
                {pkg.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#008DDA] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleInquirePackage(pkg)}
              className="w-full py-3 bg-[#008DDA] hover:bg-[#0077B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Inquire Package Quote</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
