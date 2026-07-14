"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Loader2, Compass, Sparkles, Image as ImageIcon, Award, ShieldCheck, Flame } from 'lucide-react';

const HOMEPAGE_CATEGORIES = ["All", "Gummalu", "Puja Mandiralu", "TV Units", "Sofas"];

const BRAND_LOGOS = [
  { name: "CenturyPly", logo: "CP", type: "Premium Plywood" },
  { name: "Greenply", logo: "GP", type: "Plywood Panels" },
  { name: "Fevicol Marine", logo: "FM", type: "Waterproof Glue" },
  { name: "Asian Paints", logo: "AP", type: "PU Wood Polish" },
  { name: "Hettich", logo: "H", type: "Drawer Channels" },
  { name: "Ebco", logo: "E", type: "Telescopic Runners" },
  { name: "Sheenlac", logo: "SL", type: "Wood Sealers" },
  { name: "Godrej", logo: "G", type: "Premium Hardware" }
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filteredShowcase, setFilteredShowcase] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        // Default to latest 6 items
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
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="-mt-20 relative overflow-hidden border-b border-wood-border/30 shadow-2xl px-6 pt-44 pb-28 sm:pt-52 sm:pb-36 lg:px-8" style={{ backgroundImage: "linear-gradient(to bottom, rgba(44, 26, 15, 0.4), rgba(26, 15, 8, 0.75)), url('/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wood-accent/20 px-4 py-1.5 text-[9px] sm:text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-6 border border-wood-accent/30 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-wood-accent animate-pulse" />
            Premium Design Studio
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-none uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-wood-beige to-amber-100 block">LD INTERIORS</span>
            <span className="bg-gradient-to-r from-wood-accent via-amber-400 to-amber-200 bg-clip-text text-transparent font-serif font-light italic block tracking-widest mt-2 capitalize text-3xl sm:text-5xl lg:text-6xl">& Furnitures</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed text-wood-beige/90 drop-shadow-sm">
            Brings you high-end, contemporary interior designs and premium woodwork. Explore our collection of premium residential and commercial spaces designed to inspire.
          </p>
          
          {/* Custom Elegant Bilingual Quote Card */}
          <div className="mx-auto mt-10 max-w-3xl glass-panel border border-wood-accent/30 rounded-3xl p-6 sm:p-8 shadow-inner mb-8 text-center relative overflow-hidden">
            {/* Soft decorative background glows */}
            <div className="absolute -left-16 -top-16 w-32 h-32 bg-wood-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <span className="font-serif text-6xl text-wood-accent/20 absolute left-4 top-1 leading-none select-none">“</span>
            
            <div className="space-y-4 relative z-10 px-4">
              {/* Telugu Quote */}
              <p className="font-serif text-base sm:text-lg text-wood-dark font-bold tracking-wide leading-relaxed">
                "మీ ఇల్లు మీ వ్యక్తిత్వాన్ని ప్రతిబింబించే అద్దం... మీ కలలను నిరంతర ఆనందాలుగా మార్చే అద్భుత శిల్పం. 25 సంవత్సరాలకు పైగా అనుభవంతో, మీ అభిరుచులకు అనుగుణంగా టేకు కలపతో అపురూపమైన డిజైన్లను రూపొందిస్తున్నాము."
              </p>
              
              {/* Divider */}
              <div className="w-16 h-0.5 bg-wood-accent/30 mx-auto my-3" />
              
              {/* English Quote */}
              <p className="font-sans text-xs sm:text-sm font-light text-wood-medium/95 tracking-wide leading-relaxed italic">
                "Your home should tell the story of who you are, and be a collection of what you love. We shape your dreams into premium teak wood and bespoke designs."
              </p>
            </div>
            
            <span className="font-serif text-6xl text-wood-accent/20 absolute right-4 bottom-1 leading-none select-none">”</span>
          </div>

          <div className="mt-8 flex items-center justify-center gap-x-6">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-full bg-wood-accent hover:bg-amber-500 px-7 py-4 text-xs font-bold uppercase tracking-widest text-wood-dark shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer btn-3d-accent"
            >
              Explore Showcase
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
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">25+ Years Legacy</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">Generations of trusted regional craftsmanship.</p>
            </div>
          </div>
          <div className="glass-panel border border-wood-border/40 rounded-2xl p-6 flex items-center gap-4 hover:border-wood-accent/45 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-wood-dark text-wood-accent flex items-center justify-center shrink-0 shadow-inner">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">Premium Teak Wood</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">Highest grade seasoned timber guarantee.</p>
            </div>
          </div>
          <div className="glass-panel border border-wood-border/40 rounded-2xl p-6 flex items-center gap-4 hover:border-wood-accent/45 transition-colors duration-300">
            <div className="h-12 w-12 rounded-xl bg-wood-dark text-wood-accent flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-wood-dark">Structural Warranty</h4>
              <p className="text-xs text-wood-light font-light mt-0.5">Termite-resistant, sturdy joint engineering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About & Wooden Furniture Themes Section */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Col: About Office */}
        <div className="lg:col-span-7">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Our Heritage
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-wood-dark mt-2 mb-6">
            About LD Interiors & Furnitures
          </h2>
          <p className="text-sm sm:text-base text-wood-medium font-light leading-relaxed mb-6">
            For over <strong className="font-bold text-wood-dark">25+ years</strong>, LD Interiors & Furnitures has been a trusted pioneer in transforming blueprints into breathtaking living realities. Led by our head constructor and pricing specialist, <strong className="font-bold text-wood-dark">Nagaraju</strong>, we craft design experiences combining traditional durability with modern luxury aesthetics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">Traditional Carving</h4>
                <p className="text-xs text-wood-light font-light mt-1">Custom door and mandir layout carvings in teak wood.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">Premium Lumber Selection</h4>
                <p className="text-xs text-wood-light font-light mt-1">High-quality Teak, Rosewood, and Cedar materials.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">End-to-End Handover</h4>
                <p className="text-xs text-wood-light font-light mt-1">Complete structural builds, partitionings, and installations.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">Konaseema Woodwork</h4>
                <p className="text-xs text-wood-light font-light mt-1">Generations of families served in Alamuru region.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Wooden Theme Highlights */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-wood-border/40 rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-wood-accent/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Signature Design Tones
          </span>
          <h3 className="font-serif text-xl font-bold text-wood-dark mt-1 mb-6">
            Bespoke Wooden Furniture
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-wood-beige/20 border border-wood-border/30 hover:border-wood-accent/35 transition-colors duration-300">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Teak Wood Main Doors</h4>
              <p className="text-xs text-wood-light font-light mt-1">Robust entryways featuring traditional temple carving and brass fittings.</p>
            </div>
            <div className="p-4 rounded-xl bg-wood-beige/20 border border-wood-border/30 hover:border-wood-accent/35 transition-colors duration-300">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Walnut & Beech Dining Sets</h4>
              <p className="text-xs text-wood-light font-light mt-1">Hand-finished joint alignments with scratch-resistant wood polish.</p>
            </div>
            <div className="p-4 rounded-xl bg-wood-beige/20 border border-wood-border/30 hover:border-wood-accent/35 transition-colors duration-300">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Rosewood Modular Cabinets</h4>
              <p className="text-xs text-wood-light font-light mt-1">Space-saving wardrobes and drawers built from seasoned rosewood.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Showcase Section */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-wood-border/30 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
              Fresh Daily
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-wood-dark mt-1">
              Design Gallery
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-wood-dark hover:text-wood-accent transition-colors"
          >
            View all designs
            <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Real-time Category Filtering Tabs */}
        {!loading && !error && products.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-10 pb-2 overflow-x-auto select-none no-scrollbar">
            {HOMEPAGE_CATEGORIES.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`px-4.5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-wood-dark text-white shadow-md'
                    : 'bg-white/60 text-wood-light border border-wood-border/40 hover:bg-wood-beige hover:text-wood-dark'
                }`}
              >
                {tab === "Gummalu" ? "Main Doors (Gummalu)" : tab === "Puja Mandiralu" ? "Puja Mandirs" : tab}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex h-60 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-wood-light" />
              <p className="text-sm text-wood-light font-light animate-pulse">Loading showcase...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-wood-border/60 bg-wood-cream/90 backdrop-blur-md p-12 text-center">
            <Compass className="mx-auto h-12 w-12 text-wood-light stroke-1 mb-4 animate-bounce" />
            <h3 className="text-lg font-serif font-bold text-wood-dark">Connection Offline</h3>
            <p className="mt-2 text-sm text-wood-light font-light max-w-md mx-auto">{error}</p>
          </div>
        ) : filteredShowcase.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-wood-border p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-wood-light mb-4" />
            <h3 className="text-lg font-serif font-bold text-wood-dark">No designs in this category</h3>
            <p className="mt-2 text-sm text-wood-light font-light max-w-md mx-auto">
              We are preparing to upload catalog items for "{activeTab}". Click "All" to browse other design collections.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShowcase.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Premium Material Brands Scroll Section */}
      <section className="py-16 border-t border-wood-border/30 bg-wood-cream/25 mt-16 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-8 text-center mb-8">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Quality Standards
          </span>
          <h3 className="font-serif text-2xl font-bold text-wood-dark mt-1">
            Our Trusted Material Brands
          </h3>
          <p className="text-xs text-wood-light font-light mt-2 max-w-md mx-auto">
            We use only the most premium, durable, and genuine brand materials for wood carving, bonding, and smooth cupboard hardware.
          </p>
        </div>

        {/* CSS-Animation Marquee Slider */}
        <div className="logo-marquee-container relative py-6 bg-white/45 backdrop-blur-sm border-t border-b border-wood-border/20">
          <div className="logo-marquee-content gap-16 items-center flex">
            {/* Set 1 */}
            {BRAND_LOGOS.map((brand, index) => (
              <div key={index} className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-wood-cream/80 border border-wood-border/40 shadow-sm shrink-0 select-none hover:border-wood-accent/50 transition-colors">
                <span className="text-wood-accent font-extrabold font-serif text-base tracking-tight">{brand.logo}</span>
                <div className="h-6 w-px bg-wood-border/60 mx-1"></div>
                <div className="text-left">
                  <p className="text-[9px] font-extrabold text-wood-dark uppercase leading-none tracking-wider">{brand.name}</p>
                  <p className="text-[7.5px] font-light text-wood-light leading-none mt-0.5">{brand.type}</p>
                </div>
              </div>
            ))}
            {/* Set 2 (Duplicate for infinite seamless scroll) */}
            {BRAND_LOGOS.map((brand, index) => (
              <div key={`dup-${index}`} className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-wood-cream/80 border border-wood-border/40 shadow-sm shrink-0 select-none hover:border-wood-accent/50 transition-colors">
                <span className="text-wood-accent font-extrabold font-serif text-base tracking-tight">{brand.logo}</span>
                <div className="h-6 w-px bg-wood-border/60 mx-1"></div>
                <div className="text-left">
                  <p className="text-[9px] font-extrabold text-wood-dark uppercase leading-none tracking-wider">{brand.name}</p>
                  <p className="text-[7.5px] font-light text-wood-light leading-none mt-0.5">{brand.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
