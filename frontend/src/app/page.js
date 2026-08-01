"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Loader2, Compass, Sparkles, Image as ImageIcon, Award, ShieldCheck, Flame, Play, Truck, Package, Shield, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

const HOMEPAGE_CATEGORIES = ["All", "Gummalu", "Puja Mandiralu", "TV Units", "Sofas"];

// Official Logistics & Delivery Partners
const DELIVERY_PARTNERS = [
  { name: "Xpressbees", role: "Pan-India Door Delivery Partner", badge: "Express Air & Surface" },
  { name: "Delhivery", role: "Heavy Furniture Freight Courier", badge: "Live GPS Tracking" },
  { name: "DTDC Express", role: "Priority Cargo & Parcel Delivery", badge: "Insured Transit" },
  { name: "Safexpress", role: "Specialized Door & Mandir Logistics", badge: "Safe Crate Packing" },
  { name: "Blue Dart", role: "Express Document & Hardware Courier", badge: "Air Cargo" },
  { name: "V-Trans", role: "Heavy Teakwood Trunk Transport", badge: "Direct Workshop Hub" },
  { name: "VRL Logistics", role: "South India Regional Freight", badge: "Alamuru Dispatch" },
  { name: "GATI KWE", role: "Surface Express Parcel Cargo", badge: "Zero-Damage Guarantee" }
];

// Official Raw Materials & Hardware Brands
const MATERIAL_BRANDS = [
  { name: "Burma Teak", type: "Grade-A Aged Wood Logs", badge: "100% Genuine Teak" },
  { name: "Asian Paints PU", type: "Italian Polyurethane Polish", badge: "High-Gloss & Matte" },
  { name: "Fevicol Marine", type: "Pidilite Waterproof Adhesive", badge: "D3 Marine Grade" },
  { name: "CenturyPly", type: "Boiling Water Proof Plywood", badge: "710 Grade BWP" },
  { name: "Godrej Brass", type: "Antique Handles & Locks", badge: "10-Yr Warranty" },
  { name: "Hafele", type: "German Architectural Fittings", badge: "Soft-Close Hinges" },
  { name: "Ebco Hardware", type: "Telescopic Drawer Channels", badge: "Heavy Capacity" },
  { name: "Sheenlac", type: "Wood Sealers & Varnishes", badge: "UV Resistance" }
];

const renderDeliveryPartnerLogo = (name) => {
  switch (name) {
    case "Xpressbees":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="40" rx="6" fill="#E63946" />
          <text x="12" y="26" fill="#FFFFFF" fontFamily="sans-serif" fontSize="18" fontWeight="900" letterSpacing="0.5">XPRESSBEES</text>
        </svg>
      );
    case "Delhivery":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="40" rx="6" fill="#111827" />
          <text x="12" y="26" fill="#FFFFFF" fontFamily="sans-serif" fontSize="18" fontWeight="900" letterSpacing="1">DELHIVERY</text>
          <rect x="135" y="12" width="14" height="16" fill="#EF4444" rx="2" />
        </svg>
      );
    case "DTDC Express":
      return (
        <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="40" rx="6" fill="#003366" />
          <text x="14" y="26" fill="#FFCC00" fontFamily="sans-serif" fontSize="20" fontWeight="900" letterSpacing="1">DTDC</text>
        </svg>
      );
    case "Safexpress":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="40" rx="6" fill="#005A9C" />
          <text x="12" y="26" fill="#F4A261" fontFamily="sans-serif" fontSize="17" fontWeight="900" letterSpacing="0.5">SAFEXPRESS</text>
        </svg>
      );
    case "Blue Dart":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="40" rx="6" fill="#FFCC00" />
          <text x="12" y="26" fill="#D90429" fontFamily="sans-serif" fontSize="19" fontWeight="900" fontStyle="italic" letterSpacing="0.5">BLUE DART</text>
        </svg>
      );
    case "V-Trans":
      return (
        <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="40" rx="6" fill="#1D3557" />
          <text x="14" y="26" fill="#4EA8DE" fontFamily="sans-serif" fontSize="18" fontWeight="900">V-TRANS</text>
        </svg>
      );
    case "VRL Logistics":
      return (
        <svg viewBox="0 0 150 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="150" height="40" rx="6" fill="#008000" />
          <text x="14" y="26" fill="#FFFFFF" fontFamily="sans-serif" fontSize="20" fontWeight="900">VRL LOGISTICS</text>
        </svg>
      );
    case "GATI KWE":
      return (
        <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="140" height="40" rx="6" fill="#D62828" />
          <text x="16" y="26" fill="#F8961E" fontFamily="sans-serif" fontSize="20" fontWeight="900">GATI</text>
          <text x="75" y="26" fill="#FFFFFF" fontFamily="sans-serif" fontSize="14" fontWeight="bold">KWE</text>
        </svg>
      );
    default:
      return null;
  }
};

const renderMaterialBrandLogo = (name) => {
  switch (name) {
    case "Burma Teak":
      return (
        <svg viewBox="0 0 170 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="170" height="40" rx="6" fill="#3D2314" />
          <text x="12" y="25" fill="#D4A373" fontFamily="serif" fontSize="16" fontWeight="bold">BURMA TEAK</text>
        </svg>
      );
    case "Asian Paints PU":
      return (
        <svg viewBox="0 0 170 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="26" fill="#d2232a" fontFamily="sans-serif" fontSize="19" fontWeight="bold">asianpaints</text>
          <path d="M130 25 C140 10, 155 10, 165 25" stroke="#fdb813" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      );
    case "Fevicol Marine":
      return (
        <svg viewBox="0 0 170 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="45" y="26" fill="#0f2c59" fontFamily="sans-serif" fontSize="17" fontWeight="900" letterSpacing="1">FEVICOL</text>
          <circle cx="18" cy="20" r="10" fill="#005ea6" />
          <rect x="18" y="18" width="135" height="4" fill="#f8a51b" />
        </svg>
      );
    case "CenturyPly":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="160" height="40" rx="6" fill="#0c4da2" />
          <rect width="10" height="40" fill="#e31e24" />
          <text x="25" y="26" fill="#ffffff" fontFamily="sans-serif" fontSize="17" fontWeight="bold">CenturyPLY</text>
        </svg>
      );
    case "Godrej Brass":
      return (
        <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="28" fill="#8b0000" fontFamily="'Georgia', serif" fontSize="24" fontWeight="bold" fontStyle="italic">Godrej</text>
        </svg>
      );
    case "Hafele":
      return (
        <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="28" fill="#e31b23" fontFamily="sans-serif" fontSize="24" fontWeight="bold">HÄFELE</text>
        </svg>
      );
    case "Ebco Hardware":
      return (
        <svg viewBox="0 0 120 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="40" rx="6" fill="#e31b23" />
          <text x="25" y="27" fill="#ffffff" fontFamily="sans-serif" fontSize="24" fontWeight="bold">ebco</text>
        </svg>
      );
    case "Sheenlac":
      return (
        <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="26" fill="#0f75bc" fontFamily="sans-serif" fontSize="22" fontWeight="bold">SHEENLAC</text>
          <circle cx="140" cy="20" r="7" fill="#d2232a" />
        </svg>
      );
    default:
      return null;
  }
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredShowcase, setFilteredShowcase] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setFilteredShowcase(response.data.slice(0, 6));
      } catch (err) {
        console.error('Error fetching products for homepage:', err);
        setError('Could not connect to the backend server. Please verify the API endpoint is available.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  const handleTabChange = (category) => {
    setActiveTab(category);
    if (category === "All") {
      setFilteredShowcase(products.slice(0, 6));
    } else {
      const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
      setFilteredShowcase(filtered.slice(0, 6));
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="-mt-20 relative overflow-hidden border-b border-wood-border/30 shadow-2xl px-6 pt-44 pb-28 sm:pt-52 sm:pb-36 lg:px-8" style={{ backgroundImage: "linear-gradient(to bottom, rgba(44, 26, 15, 0.4), rgba(26, 15, 8, 0.75)), url('/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-serif text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-none uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-amber-100 block">LD INTERIORS</span>
            <span className="bg-gradient-to-r from-sky-400 via-amber-300 to-amber-100 bg-clip-text text-transparent font-serif font-light italic block tracking-widest mt-2 capitalize text-3xl sm:text-5xl lg:text-6xl">{isTelugu ? "& ఫర్నిచర్స్" : "& Furnitures"}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed text-slate-100 drop-shadow-sm">
            {t.heroDesc}
          </p>

          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-full bg-wood-accent hover:bg-amber-500 px-7 py-4 text-xs font-bold uppercase tracking-widest text-wood-dark shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer btn-3d-accent"
            >
              {t.exploreBtn}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Metric Highlights Section */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 -mt-16 sm:-mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel border border-wood-border/40 rounded-2xl p-6 flex items-center gap-4 hover:border-wood-accent/45 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-wood-dark text-wood-accent flex items-center justify-center shrink-0 shadow-inner">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">{isTelugu ? "25+ సంవత్సరాల అనుభవం" : "25+ Years Legacy"}</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">{isTelugu ? "కోనసీమ ప్రాంతంలో నమ్మకమైన సేవలు." : "Generations of trusted regional craftsmanship."}</p>
            </div>
          </div>
          <div className="glass-panel border border-wood-border/40 rounded-2xl p-6 flex items-center gap-4 hover:border-wood-accent/45 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-wood-dark text-wood-accent flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">{isTelugu ? "100% అసలైన బర్మా టేకు" : "100% Genuine Burma Teak"}</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">{isTelugu ? "ఉత్తమ క్వాలిటీ కలప మాత్రమే ఉపయోగిస్తాము." : "Pure seasoned teak for generations."}</p>
            </div>
          </div>
          <div className="glass-panel border border-wood-border/40 rounded-2xl p-6 flex items-center gap-4 hover:border-wood-accent/45 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-wood-dark text-wood-accent flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">{isTelugu ? "నేరుగా ఆలమూరు వర్క్‌షాప్ ధరలు" : "Direct Alamuru Workshop Rates"}</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">{isTelugu ? "మధ్యవర్తులు లేకుండా ప్రత్యక్ష క్రాఫ్ట్‌స్మెన్ ధరలు." : "Factory direct prices with no middleman margins."}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 1. OFFICIAL LOGISTICS & DELIVERY PARTNERS MARQUEE TICKER (NEW) */}
      <section className="py-10 bg-slate-900 border-y border-slate-800 text-white overflow-hidden shadow-2xl">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 text-center mb-6">
          <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase bg-sky-950 px-3 py-1 rounded-full border border-sky-800">
            Pan-India Safe Express Freight
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-white mt-2 flex items-center justify-center gap-2">
            <Truck className="h-6 w-6 text-[#008DDA]" />
            Official Delivery & Logistics Partners
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Doorstep crate delivery & live GPS tracking for your heavy Burma teak furniture via India's top courier networks.
          </p>
        </div>

        {/* Infinite Horizontal Rolling Marquee Ticker for Logistics */}
        <div className="logo-marquee-container relative py-4 bg-slate-950/80 backdrop-blur-md border-y border-slate-800/80">
          <div className="logo-marquee-content gap-8 items-center flex">
            {/* Set 1 */}
            {DELIVERY_PARTNERS.map((partner, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shrink-0 select-none hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-center shrink-0">
                  {renderDeliveryPartnerLogo(partner.name)}
                </div>
                <div className="h-7 w-px bg-slate-700 mx-1"></div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase leading-none tracking-wider">{partner.name}</p>
                  <p className="text-[8px] font-bold text-sky-400 leading-none mt-1">{partner.role}</p>
                  <span className="inline-block mt-1 text-[7.5px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
              </div>
            ))}
            {/* Set 2 (Duplicate for smooth infinite scroll) */}
            {DELIVERY_PARTNERS.map((partner, index) => (
              <div key={`deliv-dup-${index}`} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md shrink-0 select-none hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-center shrink-0">
                  {renderDeliveryPartnerLogo(partner.name)}
                </div>
                <div className="h-7 w-px bg-slate-700 mx-1"></div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase leading-none tracking-wider">{partner.name}</p>
                  <p className="text-[8px] font-bold text-sky-400 leading-none mt-1">{partner.role}</p>
                  <span className="inline-block mt-1 text-[7.5px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL RAW MATERIALS & HARDWARE MARQUEE TICKER (UPGRADED) */}
      <section className="py-10 border-b border-wood-border/30 bg-wood-cream/25 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 text-center mb-6">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Certified Quality Guarantee
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-extrabold text-wood-dark mt-1 flex items-center justify-center gap-2">
            <Package className="h-6 w-6 text-amber-600" />
            Original Material & Hardware Brands
          </h3>
          <p className="text-xs text-wood-light font-light mt-1 max-w-md mx-auto">
            We use only 100% genuine Grade-A Burma Teak, Italian PU polishes, and marine adhesives.
          </p>
        </div>

        {/* Infinite Horizontal Rolling Marquee Ticker for Materials */}
        <div className="logo-marquee-container relative py-4 bg-white/60 backdrop-blur-sm border-y border-wood-border/30">
          <div className="logo-marquee-content gap-8 items-center flex">
            {/* Set 1 */}
            {MATERIAL_BRANDS.map((brand, index) => (
              <div key={index} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-wood-cream/90 border border-wood-border/50 shadow-sm shrink-0 select-none hover:border-wood-accent transition-colors">
                <div className="flex items-center justify-center shrink-0">
                  {renderMaterialBrandLogo(brand.name)}
                </div>
                <div className="h-7 w-px bg-wood-border/60 mx-1"></div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-wood-dark uppercase leading-none tracking-wider">{brand.name}</p>
                  <p className="text-[8px] font-semibold text-wood-medium leading-none mt-1">{brand.type}</p>
                  <span className="inline-block mt-1 text-[7.5px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {brand.badge}
                  </span>
                </div>
              </div>
            ))}
            {/* Set 2 (Duplicate for smooth infinite scroll) */}
            {MATERIAL_BRANDS.map((brand, index) => (
              <div key={`mat-dup-${index}`} className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-wood-cream/90 border border-wood-border/50 shadow-sm shrink-0 select-none hover:border-wood-accent transition-colors">
                <div className="flex items-center justify-center shrink-0">
                  {renderMaterialBrandLogo(brand.name)}
                </div>
                <div className="h-7 w-px bg-wood-border/60 mx-1"></div>
                <div className="text-left">
                  <p className="text-[10px] font-extrabold text-wood-dark uppercase leading-none tracking-wider">{brand.name}</p>
                  <p className="text-[8px] font-semibold text-wood-medium leading-none mt-1">{brand.type}</p>
                  <span className="inline-block mt-1 text-[7.5px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {brand.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
