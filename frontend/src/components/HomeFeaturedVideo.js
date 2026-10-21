'use client';
import React from 'react';
import Link from 'next/link';
import { Play, Sparkles, Film, ExternalLink, MessageCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeFeaturedVideo() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  const videoId = 'LBOvC5uczKY';
  const youtubeUrl = 'https://youtu.be/LBOvC5uczKY';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 my-12">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-900/30 bg-gradient-to-br from-[#1F140E] via-[#2A1B13] to-[#140D09] text-white p-6 sm:p-10 lg:p-12">
        {/* Ambient Warm Teakwood Glow */}
        <div 
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" 
        />
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" 
        />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-amber-900/40 pb-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600/20 text-red-400 border border-red-500/30 shadow-xs mb-3">
              {/* Official YouTube Play Icon SVG */}
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>{isTelugu ? 'ప్రత్యక్ష వర్క్‌షాప్ వీడియో • YOUTUBE' : 'WORKSHOP SPOTLIGHT • YOUTUBE'}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {isTelugu ? 'చేతివృత్తి నైపుణ్యం & లైవ్ వర్క్‌షాప్ మేకింగ్' : 'Artisan Teakwood Crafting in Action'}
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 font-light mt-2 leading-relaxed">
              {isTelugu 
                ? 'మా ఆలమూరు వర్క్‌షాప్‌లో స్వయంగా చెక్కబడిన అసలైన బర్మా టేకు ప్రొడక్ట్స్, ఎగ్ రాక్స్ మరియు కస్టమ్ ఫర్నిచర్ తయారీని వీడియోలో చూడండి.' 
                : 'Watch our master artisans turn seasoned Burma Teak into functional wooden art — live from our Alamuru workshop.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/reels"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-serif text-xs font-bold uppercase tracking-wider transition-all border border-white/15 cursor-pointer shadow-sm"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>{isTelugu ? 'అన్ని వీడియో రీల్స్ చూడండి' : 'Explore All Reels'}</span>
            </Link>
          </div>
        </div>

        {/* Video Cinema Container & Details Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Main YouTube Embedded Video Player (16:9 Aspect Ratio) */}
          <div className="lg:col-span-8 w-full">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-600/30 bg-black/90 group">
              <iframe
                src={embedUrl}
                title="LD Interiors - Wooden Egg Rack & Craftsmanship Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Video Highlights & Quick Actions Sidebar */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-5 bg-black/40 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-amber-900/50 shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Featured Creation
                </span>
                <span className="text-[9px] font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-700/50">
                  @ldinteriors
                </span>
              </div>

              <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
                Wooden Egg Rack & Custom Teak Novelties
              </h3>
              <p className="text-xs text-amber-100/70 font-light mt-2 leading-relaxed">
                Handcrafted using 100% natural seasoned Burma teak wood with smooth finish, eco-friendly sealant, and durable joints.
              </p>

              {/* Feature Bullet Points */}
              <div className="mt-4 space-y-2 text-[11px] text-amber-200/90">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>100% Solid Seasoned Teak Wood</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Direct Alamuru Workshop Rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Custom Sizing & Nationwide Delivery</span>
                </div>
              </div>
            </div>

            {/* Quick Action CTA Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>{isTelugu ? 'యూట్యూబ్‌లో చూడండి' : 'Watch on YouTube'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/916281653998?text=Hello%20LD%20Interiors!%20I%20watched%20your%20Wooden%20Egg%20Rack%20workshop%20video%20on%20YouTube%20and%20would%20like%20to%20order/inquire."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isTelugu ? 'వాట్సాప్‌లో ఆర్డర్ చేయండి' : 'Order / Inquire on WhatsApp'}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
