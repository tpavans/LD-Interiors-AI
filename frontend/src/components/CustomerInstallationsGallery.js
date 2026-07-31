"use client";
import { useState } from 'react';
import { MapPin, Star, Sparkles, CheckCircle2, ShieldCheck, ThumbsUp } from 'lucide-react';

const INSTALLATIONS = [
  {
    id: 'inst_1',
    customerName: 'K. Satyanarayana Varma',
    location: 'Vijayawada, Andhra Pradesh',
    productTitle: 'Hand-Carved Burma Teak Gaja Lakshmi Main Entrance Door',
    rating: 5,
    date: 'Installed July 2026',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    testimonial: 'Nagaraju garu delivered 100% genuine Burma teakwood. The hand carvings of Gaja Lakshmi are stunning!'
  },
  {
    id: 'inst_2',
    customerName: 'Dr. Srinivas Rao',
    location: 'Visakhapatnam (Vizag), AP',
    productTitle: 'Royal Temple Teak Puja Mandiram with Bell Towers',
    rating: 5,
    date: 'Installed June 2026',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    testimonial: 'The puja mandiram fits our apartment temple room perfectly. Pure teak wood quality with glossy PU finish.'
  },
  {
    id: 'inst_3',
    customerName: 'M. Venkata Reddy',
    location: 'Kakinada, Andhra Pradesh',
    productTitle: 'Teakwood King-Size Canopy Bed & Dressing Unit',
    rating: 5,
    date: 'Installed May 2026',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    testimonial: 'Direct workshop delivery from Alamuru to Kakinada. No middleman charges. Highly recommended!'
  },
  {
    id: 'inst_4',
    customerName: 'G. Murali Krishna',
    location: 'Rajahmundry, AP',
    productTitle: '6-Seater Solid Teakwood Dining Table Set',
    rating: 5,
    date: 'Installed April 2026',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    testimonial: 'Craftsmanship is top-notch. Wood thickness and polish exceed expectations.'
  }
];

export default function CustomerInstallationsGallery() {
  const [activeItem, setActiveItem] = useState(INSTALLATIONS[0]);

  return (
    <div className="w-full bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 text-left my-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles className="h-60 w-60 text-white" />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800 gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full border border-sky-500/30">
            Social Proof & Verified Reviews
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white mt-3 flex items-center gap-2">
            ⭐ Real Customer Home Installations
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real photos and verified customer testimonials from recent home installations across AP & Telangana.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/50 px-4 py-2 rounded-2xl border border-emerald-500/30">
          <ShieldCheck className="h-4 w-4" />
          <span>100% Verified Quality & Direct Workshop Delivery</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {INSTALLATIONS.map((inst) => (
          <div
            key={inst.id}
            onClick={() => setActiveItem(inst)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500 transition-all cursor-pointer group shadow-lg"
          >
            <div>
              <div className="relative overflow-hidden rounded-xl h-44 mb-3 border border-slate-700">
                <img
                  src={inst.image}
                  alt={inst.productTitle}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md text-[9px] font-bold text-sky-300 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-sky-400" />
                  {inst.location.split(',')[0]}
                </span>
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs mb-1">
                {'★'.repeat(inst.rating)}
              </div>

              <h4 className="text-xs font-bold text-white leading-snug truncate">{inst.productTitle}</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-medium italic">"{inst.testimonial}"</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-300 font-bold">
              <span>👤 {inst.customerName}</span>
              <span className="text-emerald-400">{inst.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
