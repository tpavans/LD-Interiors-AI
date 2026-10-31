"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { playWoodenChime } from '@/utils/audioChime';

export default function WoodSplashIntro() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if intro is disabled in settings
    const isIntroEnabled = localStorage.getItem('ld_wood_intro_enabled') !== 'false';
    if (!isIntroEnabled) return;

    // Only run on the very first visit in the current session (once per app open)
    const hasSeenIntro = sessionStorage.getItem('ld_wood_intro_seen');
    if (hasSeenIntro) return;

    sessionStorage.setItem('ld_wood_intro_seen', 'true');
    setIsVisible(true);

    // Play teakwood acoustic sound after a tiny 120ms tick
    const soundTimer = setTimeout(() => {
      playWoodenChime();
    }, 120);

    // Fade out after 1.1s for lightning fast app opening
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1100);

    // Fully remove from DOM after 1.4s
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1450);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => setIsVisible(false), 250);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center cursor-pointer select-none transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(ellipse at center, #1f140a 0%, #0d0804 70%, #000000 100%)',
      }}
    >
      {/* Subtle Teak Wood Grain & Ring Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `repeating-radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08) 0px, transparent 2px, transparent 8px, rgba(139,69,19,0.12) 12px)`
        }}
      />

      {/* Floating Golden Sparks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] animate-ping" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-amber-300 blur-[0.5px] animate-pulse" />
      </div>

      {/* Center Wood Craft Emblem Container */}
      <div className="relative flex flex-col items-center text-center p-6 z-10 animate-fadeIn">
        {/* Glowing Golden Ring Behind Logo */}
        <div className="relative mb-4">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-500/40 via-yellow-500/60 to-amber-600/40 blur-md animate-pulse" />
          
          {/* Logo with Pure Black Backdrop and Golden Border */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.5)] bg-black flex items-center justify-center p-1">
            <img
              src="/icons/icon-192x192.png"
              alt="LD Interiors"
              className="h-full w-full object-cover rounded-full"
            />
          </div>
        </div>

        {/* Brand Name with Golden Shimmer */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              BURMA TEAKWOOD
            </span>
            <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-amber-400" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-black text-white tracking-wider drop-shadow-lg">
            LD INTERIORS
          </h1>
          <p className="text-[11px] text-amber-200/90 font-medium tracking-wide">
            Handcrafted Furniture & Custom Woodwork • Alamuru
          </p>
        </div>

        {/* Chisel Stroke Animated Loading Bar */}
        <div className="w-36 h-1 bg-white/10 rounded-full mt-6 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full animate-[woodShimmer_1s_ease-out_forwards]"
            style={{ width: '100%' }}
          />
        </div>

        <span className="text-[9px] text-neutral-400 mt-3 font-mono">
          Tap anywhere to skip • v2.4.1
        </span>
      </div>
    </div>
  );
}
