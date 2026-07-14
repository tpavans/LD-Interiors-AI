"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import { Flame, ShieldAlert, BadgePercent, Sparkles, Compass, ShieldCheck, HelpCircle } from 'lucide-react';

export default function WoodGuidePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

  const woodTypes = [
    {
      id: "teak",
      name: isTelugu ? "టేకు కలప (Certified Teak Wood)" : "Certified Teak Wood",
      scientificName: "Tectona grandis",
      tagline: isTelugu ? "కలపలలో రారాజు - జీవితకాల మన్నిక" : "The King of Wood - Lifetime Durability",
      stats: { durability: 100, carving: 95, pest: 100, price: 95 },
      desc: isTelugu 
        ? "టేకు కలప అత్యంత దృఢమైనది మరియు ఆకర్షణీయమైన సహజ గీతలతో ఉంటుంది. ఇందులో ఉండే సహజ నూనెలు చెదలు మరియు కీటకాలు పట్టకుండా రక్షిస్తాయి."
        : "Teak wood is highly stable, waterproof, and contains natural protective teak oils that prevent rotting, cracking, and termite damage.",
      appearance: isTelugu ? "బంగారు గోధుమ రంగు మరియు దట్టమైన స్ట్రెయిట్ గీతలు." : "Golden-brown color with rich, dark brown straight grain lines.",
      bestUses: isTelugu ? "ముఖ్య గుమ్మాలు (తలుపులు), పూజ మందిరాలు, విలాసవంతమైన మంచాలు మరియు సోఫాలు." : "Main entrance doors (Gummalu), luxury puja mandirams, heavy double beds, and sofa frames.",
      verifyingTip: isTelugu 
        ? "నిజమైన టేకు కలప బరువుగా ఉంటుంది, తాకినప్పుడు కొద్దిగా జిడ్డుగా (తేమగా) అనిపిస్తుంది. దాని నుంచి సహజమైన లేత సువాసన వస్తుంది."
        : "Genuine teak feels slightly oily to the touch and emits a pleasant, distinct leather-like wood aroma. Grain lines are tight and continuous."
    },
    {
      id: "rosewood",
      name: isTelugu ? "రోజ్ వుడ్ / జిత్రేగి (Premium Rosewood)" : "Premium Rosewood",
      scientificName: "Dalbergia latifolia",
      tagline: isTelugu ? "అత్యంత బలమైన మరియు క్లాసిక్ లుక్" : "Ultra-Dense Hardwood - Royal Look",
      stats: { durability: 95, carving: 80, pest: 90, price: 90 },
      desc: isTelugu 
        ? "జిత్రేగి కలప చాలా బలమైనది మరియు బరువైనది. దీని డార్క్ కలర్ ఫినిషింగ్ ఫర్నిచర్ కి ఒక రాయల్ మరియు వింటేజ్ లుక్ ఇస్తుంది."
        : "Rosewood is an extremely dense, heavy hardwood with a beautiful red-burgundy tint. It is highly resistant to splits and weathering.",
      appearance: isTelugu ? "ముదురు ఎరుపు-నేరేడు రంగుతో కూడిన సొగసైన ముడతలుగల గీతలు." : "Dark reddish-purple to dark brown with beautiful wavy black streaks.",
      bestUses: isTelugu ? "రాజకీయ డైనింగ్ టేబుళ్లు, భారీ చెక్క మంచాలు, బీరువాలు మరియు అలంకరణ పీఠాలు." : "Premium dining table tops, royal cots, dressers, and high-end carving panels.",
      verifyingTip: isTelugu 
        ? "రోజ్ వుడ్ పై మెటాలిక్ షైన్ ఉంటుంది, కలపను కొట్టినప్పుడు ఒక బరువైన గట్టి శబ్దం వినిపిస్తుంది."
        : "It has a distinct sweet, rose-like fragrance when freshly cut. It is noticeably heavier and harder than standard commercial timber."
    },
    {
      id: "gummadi",
      name: isTelugu ? "గుమ్మడి టేకు / వైట్ టేక్ (Gummadi Wood)" : "Gummadi Wood",
      scientificName: "Gmelina arborea",
      tagline: isTelugu ? "దేవాలయాల పూజ గదులకు పరమ పవిత్రం" : "Highly Auspicious Wood for Devotional Items",
      stats: { durability: 85, carving: 90, pest: 85, price: 65 },
      desc: isTelugu 
        ? "గుమ్మడి కలప తేలికగా ఉండి, అందమైన లేత తెలుపు-గోల్డ్ రంగులో ఉంటుంది. హిందూ సాంప్రదాయంలో దీనిని పూజా మందిరాలు చేయడానికి అత్యంత పవిత్రంగా భావిస్తారు."
        : "Gummadi wood (White Teak) is lightweight, easy to carve, and is spiritually considered highly auspicious for crafting temple frames and deities.",
      appearance: isTelugu ? "లేత పసుపు లేదా తెలుపు రంగుతో నునుపైన నిర్మాణం." : "Light yellowish-cream to pale white color with a smooth, fine texture.",
      bestUses: isTelugu ? "దేవుని మందిరాలు (Puja Mandirams), దేవుని విగ్రహాలు, వాకిలి గుమ్మాలు మరియు పూజ పీఠాలు." : "Puja mandiram cabinets, devotional arches, temple doors, and seating stools.",
      verifyingTip: isTelugu 
        ? "ఇది బరువులో టేకు కన్నా తేలికగా ఉండి, పాలిష్ వేసిన తర్వాత చాలా నునుపుగా మెరుస్తుంది."
        : "It is lighter in weight than teak, possesses a golden luster when polished, and has a clean, straight-grained feel."
    },
    {
      id: "neem",
      name: isTelugu ? "వేప కలప (Neem Hardwood)" : "Neem Hardwood",
      scientificName: "Azadirachta indica",
      tagline: isTelugu ? "చెదలు పట్టని ఔషధ గుణాలున్న కలప" : "Termite-Resistant & Eco-Friendly Wood",
      stats: { durability: 75, carving: 70, pest: 95, price: 45 },
      desc: isTelugu 
        ? "వేప చెట్టు కలప సహజంగానే బ్యాక్టీరియా మరియు చెదలను నిరోధిస్తుంది. ఇది తక్కువ బడ్జెట్‌లో ఎక్కువ కాలం మన్నే ఫర్నిచర్ కోసం ఉపయోగపడుతుంది."
        : "Neem wood is naturally insect-resistant and antimicrobial. It is highly budget-friendly and serves as a solid base for household structures.",
      appearance: isTelugu ? "ఎరుపు-గోధుమ రంగు మరియు దట్టమైన క్రాస్ గీతలు." : "Reddish-brown wood with interlocked grain patterns and rough texture.",
      bestUses: isTelugu ? "కిచెన్ క్యాబినెట్లు, మంచం లోపలి పలకలు, సాధారణ డైనింగ్ కుర్చీలు మరియు బడ్జెట్ ఫర్నిచర్." : "Modular kitchen framework, inner cot planks, dining chairs, and budget closets.",
      verifyingTip: isTelugu 
        ? "ఈ కలపను తాకినప్పుడు లేదా కోసినప్పుడు చేదు వేప సువాసన వస్తుంది మరియు దీని గీతలు కరుకుగా ఉంటాయి."
        : "It has a bitter, medicinal aroma when cut or planed. The grains are heavily textured and interlocked."
    }
  ];

  const [activeWood, setActiveWood] = useState(woodTypes[0]);

  return (
    <div className="min-h-screen py-16 bg-wood-plank-bg">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fadeIn">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase bg-wood-cream/20 px-3.5 py-1.5 rounded-full border border-wood-border/30">
            {isTelugu ? "కలపల నాణ్యత మార్గదర్శి" : "Timber Quality Manual"}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-wood-dark tracking-tight mt-5 gold-text-glow">
            {t.guideTitle}
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-wood-light font-light leading-relaxed">
            {t.guideDesc}
          </p>
        </div>

        {/* Dynamic Interactive Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Wood selectors buttons */}
          <div className="lg:col-span-4 space-y-4">
            {woodTypes.map((wood) => {
              const isActive = activeWood.id === wood.id;
              return (
                <button
                  key={wood.id}
                  onClick={() => setActiveWood(wood)}
                  className={`w-full rounded-2xl p-5 border text-left transition-all duration-350 cursor-pointer shadow-sm relative overflow-hidden ${
                    isActive 
                      ? 'bg-wood-dark text-white border-wood-accent shadow-md scale-[1.02]' 
                      : 'bg-white/80 border-wood-border/60 hover:border-wood-accent hover:bg-white text-wood-dark hover:shadow'
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-12 h-12 rounded-full bg-wood-accent/20"></div>
                  )}
                  <h3 className="font-serif font-bold text-sm sm:text-base leading-none">{wood.name}</h3>
                  <p className={`text-[10px] italic mt-1.5 leading-none ${isActive ? 'text-wood-accent font-semibold' : 'text-wood-light'}`}>
                    {wood.scientificName}
                  </p>
                  <p className={`text-[11px] font-light mt-3 leading-relaxed ${isActive ? 'text-wood-cream/80' : 'text-neutral-500'}`}>
                    {wood.tagline}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: Active wood metrics and details */}
          <div className="lg:col-span-8 bg-white/95 backdrop-blur-md border border-wood-border/70 rounded-3xl p-6 sm:p-8 shadow-xl animate-slideUp">
            <div className="border-b border-wood-border/30 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-wood-dark">{activeWood.name}</h2>
                  <p className="text-[11px] italic text-wood-accent font-bold mt-1">{activeWood.scientificName}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full w-fit">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                  <span>{isTelugu ? "అథెంటిక్ మెటీరియల్" : "100% Authentic Quality"}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-wood-light font-light leading-relaxed mb-8">
              {activeWood.desc}
            </p>

            {/* Comparison Metrics section */}
            <div className="mb-8 bg-wood-beige/25 p-5 rounded-2xl border border-wood-border/40">
              <h3 className="font-serif text-xs font-bold text-wood-dark uppercase tracking-widest mb-4">
                {isTelugu ? "నాణ్యత మరియు ధర పోలిక" : "Material Ratings & Comparison"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Durability */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-wood-light">
                    <span>{t.durability}</span>
                    <span className="text-wood-accent font-extrabold">{activeWood.stats.durability}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-wood-dark h-full rounded-full transition-all duration-700" 
                      style={{ width: `${activeWood.stats.durability}%` }}
                    ></div>
                  </div>
                </div>

                {/* Carving Ease */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-wood-light">
                    <span>{t.carvingEase}</span>
                    <span className="text-wood-accent font-extrabold">{activeWood.stats.carving}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-wood-accent h-full rounded-full transition-all duration-700" 
                      style={{ width: `${activeWood.stats.carving}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pest Resistance */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-wood-light">
                    <span>{t.pestResistance}</span>
                    <span className="text-wood-accent font-extrabold">{activeWood.stats.pest}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-800 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${activeWood.stats.pest}%` }}
                    ></div>
                  </div>
                </div>

                {/* Price Index */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-wood-light">
                    <span>{t.priceIndex}</span>
                    <span className="text-wood-accent font-extrabold">{activeWood.stats.price === 95 ? (isTelugu ? 'అత్యధికం' : 'Premium') : activeWood.stats.price === 90 ? (isTelugu ? 'ఎక్కువ' : 'High') : activeWood.stats.price === 65 ? (isTelugu ? 'మధ్యస్థం' : 'Medium') : (isTelugu ? 'తక్కువ/బడ్జెట్' : 'Economy')}</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-600 h-full rounded-full transition-all duration-700" 
                      style={{ width: `${activeWood.stats.price}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Details row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {/* Appearance */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-wood-accent">
                  {t.appearance}
                </span>
                <p className="text-xs text-wood-light leading-relaxed font-light">{activeWood.appearance}</p>
              </div>

              {/* Best Uses */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-wood-accent">
                  {t.bestUses}
                </span>
                <p className="text-xs text-wood-light leading-relaxed font-light">{activeWood.bestUses}</p>
              </div>
            </div>

            {/* Quality Verification Note */}
            <div className="mt-8 pt-6 border-t border-wood-border/30 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/50 text-left">
              <div className="flex items-start gap-2.5">
                <HelpCircle className="h-5 w-5 text-wood-accent shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-wood-accent block mb-1">
                    {t.howToIdentify}
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed font-light">
                    {activeWood.verifyingTip}
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
