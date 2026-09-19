'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Sparkles, Compass, Award, ShieldCheck, Flame } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LuxuryLookbookGrid({ products = [] }) {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  // Extract products for specific category highlights
  const validProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const bedProduct = validProducts.find(p => p.category?.toLowerCase()?.includes('bed') || p.category?.toLowerCase()?.includes('bedroom')) || validProducts[0] || null;
  const diningProduct = validProducts.find(p => p.category?.toLowerCase()?.includes('dining') || p.category?.toLowerCase()?.includes('table')) || validProducts[1] || null;
  const sofaProduct = validProducts.find(p => p.category?.toLowerCase()?.includes('sofa') || p.category?.toLowerCase()?.includes('living')) || validProducts[2] || null;
  const doorProduct = validProducts.find(p => p.category?.toLowerCase()?.includes('gummalu') || p.category?.toLowerCase()?.includes('door')) || validProducts[3] || null;
  const mandirProduct = validProducts.find(p => p.category?.toLowerCase()?.includes('puja') || p.category?.toLowerCase()?.includes('mandir')) || validProducts[4] || null;

  // Image helpers with fallback high-res aesthetic interior images
  const getImage = (prod, defaultUrl) => {
    if (prod && prod.image) {
      return prod.image.startsWith('http') ? prod.image : `${prod.image}`;
    }
    if (prod && prod.imageUrl) {
      return prod.imageUrl.startsWith('http') ? prod.imageUrl : `${prod.imageUrl}`;
    }
    return defaultUrl;
  };

  const bedImg = getImage(bedProduct, 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop');
  const diningImg = getImage(diningProduct, 'https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1000&auto=format&fit=crop');
  const sofaImg = getImage(sofaProduct, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop');
  const doorImg = getImage(doorProduct, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop');
  const mandirImg = getImage(mandirProduct, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop');

  return (
    <div className="space-y-16 my-12">

      {/* =========================================================================
          LOOKBOOK SECTION 1: TERRACOTTA & SUNLIT SUNSET LOOKBOOK (Inspired by Image 1)
          ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-900/20 bg-[#D4A38E] text-[#3D2314]">
        {/* Soft Sunlit Wall Shadows Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-25 mix-blend-multiply bg-cover bg-center"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,235,215,0.6) 0%, transparent 60%), linear-gradient(135deg, rgba(93,58,36,0.3) 0%, transparent 100%)`
          }}
        />

        <div className="relative z-10 p-6 sm:p-10 lg:p-12">
          
          {/* Section Editorial Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#6E422B] bg-[#F3E3DA] px-4 py-1.5 rounded-full shadow-xs inline-block mb-3">
              {isTelugu ? 'ఆలమూరు కొత్త కలెక్షన్ 2026' : 'ALAMURU CRAFTSMEN LOOKBOOK 2026'}
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight text-[#3D2314] leading-tight">
              Dåwn
            </h2>
            <p className="font-serif italic text-base sm:text-xl tracking-widest text-[#6E422B] uppercase mt-1">
              THE NEW TEAK COLLECTION
            </p>
          </div>

          {/* Asymmetric Editorial Grid (Matching Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Big Hero Feature Block (Spans 6 cols on desktop) */}
            <div className="md:col-span-6 relative group rounded-2xl overflow-hidden shadow-xl bg-[#E8C5B5] min-h-[420px] sm:min-h-[520px] flex flex-col justify-between p-6 sm:p-8 transition-transform duration-500 hover:shadow-2xl">
              
              {/* Arch Backdrop Window Effect */}
              <div className="absolute top-6 left-6 w-28 h-28 rounded-full border-4 border-white/30 pointer-events-none" />
              
              {/* Background Image */}
              <img
                src={bedImg}
                alt="Teakwood Bed Collection"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2A160C]/80 via-transparent to-[#2A160C]/20" />

              {/* Top Tag */}
              <div className="relative z-10">
                <span className="bg-white/90 backdrop-blur-md text-[#3D2314] font-serif font-bold text-xs uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  ★ LUXURY TEAK BEDROOM
                </span>
              </div>

              {/* Bottom CTA Overlay */}
              <div className="relative z-10 flex items-end justify-between">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
                    {bedProduct?.title || 'Burma Teak Royal Master Bed'}
                  </h3>
                  <p className="text-xs text-amber-200 font-light mt-1">
                    {bedProduct?.price ? `₹${bedProduct.price.toLocaleString('en-IN')}` : 'Direct Factory Rates'}
                  </p>
                </div>
                <Link
                  href={bedProduct?._id ? `/products/${bedProduct._id}` : '/products'}
                  className="bg-white/90 hover:bg-white text-[#3D2314] px-5 py-3 rounded-full font-serif text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all transform hover:scale-105"
                >
                  <span>EXPLORE ALL</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Side 4-Card Grid (Spans 6 cols on desktop) */}
            <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Top Left Card: Bedroom Bed Detail */}
              <div className="relative group rounded-2xl overflow-hidden shadow-lg bg-[#E2BEB0] min-h-[240px] flex flex-col justify-end p-5">
                <img
                  src={bedImg}
                  alt="Teakwood Bedroom Set"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="relative z-10">
                  <p className="font-serif text-xs font-bold text-white uppercase tracking-widest">
                    BEDROOM SUITE →
                  </p>
                  <p className="text-[10px] text-amber-200 mt-0.5 font-light">
                    Hand-turned Posts & PU Finish
                  </p>
                </div>
                <Link href="/products?category=Wooden Beds" className="absolute inset-0 z-20" />
              </div>

              {/* Top Right Card: Living Sofa Set */}
              <div className="relative group rounded-2xl overflow-hidden shadow-lg bg-[#DDB3A2] min-h-[240px] flex flex-col justify-end p-5">
                <img
                  src={sofaImg}
                  alt="Living Room Sofa Set"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="relative z-10">
                  <p className="font-serif text-xs font-bold text-white uppercase tracking-widest">
                    LIVING ROOM →
                  </p>
                  <p className="text-[10px] text-amber-200 mt-0.5 font-light">
                    Royal Teak Loungers & Sofas
                  </p>
                </div>
                <Link href="/products?category=Sofas" className="absolute inset-0 z-20" />
              </div>

              {/* Bottom Left Card: Dining Room */}
              <div className="relative group rounded-2xl overflow-hidden shadow-lg bg-[#D3A390] min-h-[240px] flex flex-col justify-end p-5">
                <img
                  src={diningImg}
                  alt="Dining Room Set"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="relative z-10">
                  <p className="font-serif text-xs font-bold text-white uppercase tracking-widest">
                    DINING ROOM →
                  </p>
                  <p className="text-[10px] text-amber-200 mt-0.5 font-light">
                    Solid Teak 6-Seater Tables
                  </p>
                </div>
                <Link href="/products?category=Dining Tables" className="absolute inset-0 z-20" />
              </div>

              {/* Bottom Right Accent Block: Rich Warm Teak Wood Card */}
              <div className="relative group rounded-2xl overflow-hidden shadow-lg bg-[#5D3A24] text-amber-100 min-h-[240px] flex flex-col justify-between p-6 border border-amber-800/40 transform hover:-translate-y-1 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xl">✨</span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-md border border-amber-800/60">
                    ALAMURU QUALITY
                  </span>
                </div>
                <div>
                  <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                    BURMA TEAK GUARANTEE
                  </h4>
                  <p className="text-xs text-amber-200 font-light mt-1 leading-relaxed">
                    Aged Seasoned Teak Wood crafted by master carpenters.
                  </p>
                </div>
                <Link
                  href="/wood-guide"
                  className="inline-flex items-center gap-2 font-serif text-xs font-bold uppercase tracking-widest text-amber-300 hover:text-white transition-colors"
                >
                  <span>KNOW MORE</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          LOOKBOOK SECTION 2: TEAL & EMERALD CATALOG GRID (Inspired by Image 2)
          ========================================================================= */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-teal-800/40 bg-[#1A5350] text-white p-6 sm:p-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-teal-700/60 pb-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-900/80 px-3 py-1 rounded-full border border-teal-700">
              FEATURED FURNITURE CATEGORIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
              Explore LD Teak Collections
            </h2>
            <p className="text-xs text-teal-200 font-light mt-1">
              Direct Alamuru Workshop Pricing • Custom Size Options Available
            </p>
          </div>
          <Link
            href="/products"
            className="px-6 py-3 rounded-full bg-white text-[#1A5350] font-serif font-bold text-xs uppercase tracking-widest hover:bg-teal-50 transition-all shadow-md shrink-0"
          >
            VIEW ALL 1000+ OPTIONS
          </Link>
        </div>

        {/* Teal Collection Grid (Matching Image 2 Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Left Featured Card: Hydraulic Storage Beds */}
          <div className="md:col-span-6 relative group rounded-2xl overflow-hidden bg-[#246A66] border border-teal-600/50 shadow-xl min-h-[380px] sm:min-h-[460px] flex flex-col justify-end p-6">
            <img
              src={bedImg}
              alt="Hydraulic Storage Beds"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E3533]/90 via-[#0E3533]/40 to-transparent" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                  Hydraulic Storage Beds | 140+ Options
                </h3>
                <p className="text-xs text-teal-200 font-medium mt-1">
                  Starting from ₹24,999 • Heavy Burma Teak Frame
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#1A5350] flex items-center justify-center shadow-lg shrink-0 group-hover:bg-amber-300 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <Link href="/products?category=Wooden Beds" className="absolute inset-0 z-20" />
          </div>

          {/* Right Top & Bottom Cards */}
          <div className="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Dining Sets Card */}
            <div className="relative group rounded-2xl overflow-hidden bg-[#246A66] border border-teal-600/50 shadow-md min-h-[220px] flex flex-col justify-end p-5">
              <img
                src={diningImg}
                alt="Dining Sets"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E3533]/90 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">
                    Dining Sets | 750+ Options
                  </h4>
                  <p className="text-[11px] text-teal-200 mt-0.5">
                    from ₹19,429
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A5350] flex items-center justify-center shrink-0 shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <Link href="/products?category=Dining Tables" className="absolute inset-0 z-20" />
            </div>

            {/* Teak Doors & Gummalu Card */}
            <div className="relative group rounded-2xl overflow-hidden bg-[#246A66] border border-teal-600/50 shadow-md min-h-[220px] flex flex-col justify-end p-5">
              <img
                src={doorImg}
                alt="Teakwood Doors & Gummalu"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E3533]/90 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">
                    Teak Doors & Gummalu | 500+ Options
                  </h4>
                  <p className="text-[11px] text-teal-200 mt-0.5">
                    from ₹14,999
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A5350] flex items-center justify-center shrink-0 shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <Link href="/products?category=Gummalu" className="absolute inset-0 z-20" />
            </div>

            {/* Puja Mandiralu Card */}
            <div className="relative group rounded-2xl overflow-hidden bg-[#246A66] border border-teal-600/50 shadow-md min-h-[220px] flex flex-col justify-end p-5">
              <img
                src={mandirImg}
                alt="Puja Mandiralu"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E3533]/90 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">
                    Puja Mandiralu | 350+ Options
                  </h4>
                  <p className="text-[11px] text-teal-200 mt-0.5">
                    from ₹8,500
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A5350] flex items-center justify-center shrink-0 shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <Link href="/products?category=Puja Mandiralu" className="absolute inset-0 z-20" />
            </div>

            {/* Sofas & Coffee Tables Card */}
            <div className="relative group rounded-2xl overflow-hidden bg-[#246A66] border border-teal-600/50 shadow-md min-h-[220px] flex flex-col justify-end p-5">
              <img
                src={sofaImg}
                alt="Teak Sofas & Coffee Tables"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E3533]/90 via-transparent to-transparent" />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-white">
                    Coffee Tables & Sofas | 550+ Options
                  </h4>
                  <p className="text-[11px] text-teal-200 mt-0.5">
                    from ₹2,099
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/90 text-[#1A5350] flex items-center justify-center shrink-0 shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <Link href="/products?category=Sofas" className="absolute inset-0 z-20" />
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
