"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '../utils/api';
import { Sparkles, ChevronRight, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ScrollingProductsMarquee() {
  const [products, setProducts] = useState([]);
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await api.get('/products');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setProducts(res.data.slice(0, 12));
        }
      } catch (err) {
        console.warn('Could not load marquee products:', err);
      }
    };
    fetchTopProducts();
  }, []);

  if (products.length === 0) return null;

  // Duplicate list for infinite smooth marquee loop
  const marqueeItems = [...products, ...products];

  return (
    <section className="py-12 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white overflow-hidden border-y border-amber-500/30 relative text-left">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 shadow-xs">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>{isTelugu ? "హోమ్‌పేజీ లైవ్ గ్యాలరీ" : "Live Showcase Marquee"}</span>
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white mt-1.5">
            {isTelugu ? "పాపులర్ టేకువుడ్ డిజైన్ల లైవ్ షోకేస్" : "Popular Handcrafted Teakwood Showcase"}
          </h2>
        </div>
        <Link 
          href="/products" 
          className="text-xs font-bold text-amber-300 hover:text-amber-200 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>{isTelugu ? "500+ డిజైన్లన్నీ చూడండి" : "Explore All 500+ Designs"}</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Infinite Horizontal Auto-Scroll Marquee Row */}
      <div className="flex w-full overflow-hidden select-none group">
        <div className="flex gap-4 animate-marquee hover:[animation-play-state:paused] shrink-0">
          {marqueeItems.map((prod, idx) => (
            <Link
              key={`${prod._id}-${idx}`}
              href={`/products/${prod._id}`}
              className="w-56 sm:w-64 bg-slate-900/90 border border-amber-500/20 hover:border-amber-400 rounded-2xl p-3 shadow-lg transition-all duration-300 hover:scale-105 group/item shrink-0 block"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-950 mb-2.5">
                <img 
                  src={prod.image} 
                  alt={prod.title} 
                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                  loading="lazy" 
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[8.5px] font-black uppercase text-amber-300 border border-amber-400/40">
                  {prod.category}
                </div>
              </div>
              <h3 className="text-xs font-bold text-white group-hover/item:text-amber-300 transition-colors line-clamp-1">
                {prod.title}
              </h3>
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="font-mono font-bold text-amber-400">
                  {prod.price && prod.price > 0 ? `₹${prod.price.toLocaleString('en-IN')}` : 'Check Price'}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-400">
                  Burma Teak
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
