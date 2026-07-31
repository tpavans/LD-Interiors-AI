"use client";
import { useState, useId } from 'react';
import { Sliders, Sparkles, Check, Send, Calculator, ShieldCheck, Ruler, ArrowRight } from 'lucide-react';

const WOOD_TYPES = [
  { id: 'burma_teak', name: 'Burma Teak (Grade A)', ratePerCft: 4200, badge: 'Premium Royal', desc: '100% genuine aged Burma teak with natural golden oils & lifetime termite immunity.' },
  { id: 'first_class_teak', name: 'First Class CP Teak', ratePerCft: 3200, badge: 'Popular Choice', desc: 'High-density Central Province teak wood with rich grain patterns.' },
  { id: 'rosewood', name: 'South Indian Rosewood', ratePerCft: 4800, badge: 'Ultra Luxury', desc: 'Dense dark wood with exotic grain, perfect for luxury heirlooms.' },
  { id: 'sheesham', name: 'Seasoned Sheesham', ratePerCft: 2400, badge: 'Budget Friendly', desc: 'Kiln-dried seasoned wood with durable structural strength.' }
];

const CARVING_STYLES = [
  { id: 'gaja_lakshmi', name: 'Traditional Gaja Lakshmi', multiplier: 1.25, desc: 'Intricate hand-carved Gaja Lakshmi with elephants & traditional Kalasam.' },
  { id: 'floral_mandala', name: 'Royal Floral Mandala', multiplier: 1.15, desc: 'Classic South Indian floral carvings & decorative borders.' },
  { id: 'modern_minimal', name: 'Modern Minimalist Slat', multiplier: 1.0, desc: 'Clean geometric lines & sleek contemporary aesthetics.' },
  { id: '3d_embossed', name: 'Deep 3D Embossed Carving', multiplier: 1.35, desc: 'Extra deep 2-inch relief carvings for dramatic entrance presence.' }
];

const POLISH_FINISHES = [
  { id: 'natural_pu_gloss', name: 'Natural Teak PU High Gloss', addPrice: 2500 },
  { id: 'matte_pu', name: 'Matte Architectural PU Finish', addPrice: 2000 },
  { id: 'dark_walnut', name: 'Dark Walnut Italian Stain', addPrice: 3000 },
  { id: 'royal_rosewood', name: 'Royal Rosewood Heritage Polish', addPrice: 3200 }
];

export default function CustomBuildStudio({ onClose }) {
  const [selectedWood, setSelectedWood] = useState(WOOD_TYPES[0]);
  const [selectedCarving, setSelectedCarving] = useState(CARVING_STYLES[0]);
  const [selectedFinish, setSelectedFinish] = useState(POLISH_FINISHES[0]);
  const [heightInches, setHeightInches] = useState(84); // 7 ft
  const [widthInches, setWidthInches] = useState(42);   // 3.5 ft
  const [thicknessInches, setThicknessInches] = useState(1.5);

  const woodSelectId = useId();
  const heightInputId = useId();
  const widthInputId = useId();
  const thicknessInputId = useId();

  // Calculation Math:
  // Volume in Cubic Feet (Cft) = (Height_in * Width_in * Thickness_in) / 1728
  const cft = ((heightInches * widthInches * thicknessInches) / 1728).toFixed(2);
  const baseWoodCost = Math.round(cft * selectedWood.ratePerCft * selectedCarving.multiplier);
  const totalEstimatedPrice = baseWoodCost + selectedFinish.addPrice;
  const bookingAdvance50 = Math.round(totalEstimatedPrice / 2);

  const handleWhatsAppInquiry = () => {
    const waMessage = `🛠️ *CUSTOM TEAKWOOD BUILD CONFIGURATION* / LD Interiors

Hello Nagaraju garu,

I created a custom teakwood furniture design specification on your website:

🪵 *Wood Type:* ${selectedWood.name}
📐 *Dimensions:* ${heightInches}" H x ${widthInches}" W x ${thicknessInches}" Thickness (${cft} Cft)
🌸 *Carving Style:* ${selectedCarving.name}
✨ *Polish Finish:* ${selectedFinish.name}

💰 *Estimated Price:* ₹${totalEstimatedPrice.toLocaleString('en-IN')} (50% Booking Advance: ₹${bookingAdvance50.toLocaleString('en-IN')})

Can we discuss wood availability and sizing for this custom order?

Thank you!`;

    window.open(`https://wa.me/919346325291?text=${encodeURIComponent(waMessage)}`, '_blank');
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl text-left animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#008DDA] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Interactive Studio
          </span>
          <h2 className="font-serif text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Sliders className="h-6 w-6 text-[#008DDA]" />
            Custom Teak Build & Cost Estimator
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Customize wood grade, dimensions, carvings, and polish to see live material cubic feet (Cft) & pricing.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Wood Selection */}
          <div>
            <label htmlFor={woodSelectId} className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <span>1. Select Wood Grade</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WOOD_TYPES.map((wood) => (
                <div
                  key={wood.id}
                  onClick={() => setSelectedWood(wood)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    selectedWood.id === wood.id
                      ? 'border-[#008DDA] bg-sky-50/70 ring-2 ring-[#008DDA]/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{wood.name}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-100 text-[#008DDA] px-2 py-0.5 rounded-md">
                      {wood.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{wood.desc}</p>
                  <p className="text-xs font-mono font-bold text-slate-700 mt-2">₹{wood.ratePerCft.toLocaleString('en-IN')} / Cft</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Custom Dimensions */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-[#008DDA]" />
              <span>2. Dimensions & Wood Volume (Cft)</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor={heightInputId} className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Height (Inches)</label>
                <input
                  id={heightInputId}
                  type="number"
                  value={heightInches}
                  onChange={(e) => setHeightInches(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white focus:border-[#008DDA] focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">({(heightInches / 12).toFixed(1)} Feet)</span>
              </div>

              <div>
                <label htmlFor={widthInputId} className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Width (Inches)</label>
                <input
                  id={widthInputId}
                  type="number"
                  value={widthInches}
                  onChange={(e) => setWidthInches(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white focus:border-[#008DDA] focus:outline-none"
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">({(widthInches / 12).toFixed(1)} Feet)</span>
              </div>

              <div>
                <label htmlFor={thicknessInputId} className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Thickness (Inches)</label>
                <select
                  id={thicknessInputId}
                  value={thicknessInches}
                  onChange={(e) => setThicknessInches(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 bg-white focus:border-[#008DDA] focus:outline-none"
                >
                  <option value={1.25}>1.25 Inches</option>
                  <option value={1.5}>1.5 Inches (Standard Main Door)</option>
                  <option value={2.0}>2.0 Inches (Heavy Royal Door)</option>
                  <option value={3.0}>3.0 Inches (Temple Mandir Pillar)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 uppercase tracking-wider">Calculated Teak Volume:</span>
              <span className="font-mono font-black text-[#008DDA] text-sm">{cft} Cubic Feet (Cft)</span>
            </div>
          </div>

          {/* 3. Carving Style & Polish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                3. Wood Carving Pattern
              </label>
              <div className="space-y-2">
                {CARVING_STYLES.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedCarving(style)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      selectedCarving.id === style.id
                        ? 'border-[#008DDA] bg-sky-50 font-extrabold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{style.name}</span>
                      {selectedCarving.id === style.id && <Check className="h-4 w-4 text-[#008DDA]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                4. PU Polish & Finish
              </label>
              <div className="space-y-2">
                {POLISH_FINISHES.map((finish) => (
                  <div
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs ${
                      selectedFinish.id === finish.id
                        ? 'border-[#008DDA] bg-sky-50 font-extrabold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{finish.name}</span>
                      {selectedFinish.id === finish.id && <Check className="h-4 w-4 text-[#008DDA]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Estimate Summary Box */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0B192C] to-[#1E3E62] rounded-3xl p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calculator className="h-40 w-40 text-white" />
          </div>

          <div>
            <span className="text-[9px] font-black uppercase tracking-widest bg-sky-400/20 text-sky-300 px-3 py-1 rounded-full border border-sky-400/30">
              Live Custom Quote Summary
            </span>
            <h3 className="text-lg font-serif font-extrabold mt-3 text-white">Estimated Cost Breakdown</h3>
          </div>

          <div className="space-y-3 divide-y divide-white/10 text-xs font-medium">
            <div className="flex justify-between pt-2">
              <span className="text-slate-300">Selected Wood:</span>
              <span className="font-bold text-white">{selectedWood.name}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-300">Total Volume:</span>
              <span className="font-mono font-bold text-sky-300">{cft} Cft</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-300">Carving Pattern:</span>
              <span className="font-bold text-white">{selectedCarving.name}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-300">Polish Finish:</span>
              <span className="font-bold text-white">{selectedFinish.name}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest block">Total Estimated Price</span>
            <p className="font-mono text-3xl font-black text-amber-300">₹{totalEstimatedPrice.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-emerald-300 font-semibold pt-1">
              50% Booking Advance: ₹{bookingAdvance50.toLocaleString('en-IN')}
            </p>
          </div>

          <button
            onClick={handleWhatsAppInquiry}
            className="w-full py-4 bg-[#008DDA] hover:bg-[#0077B6] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Send className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            <span>Send Custom Spec to Master Craftsman</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Guaranteed Grade-A Burma Teak certification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
