"use client";
import React from 'react';
import Link from 'next/link';
import { Hammer, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-wood-plank-bg">
      {/* Hero Header Section with Furniture Background overlay */}
      <div 
        className="relative h-[45vh] min-h-[350px] w-full bg-cover bg-center flex items-center justify-center px-6"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      >
        <div className="absolute inset-0 bg-wood-dark/65 backdrop-blur-[2px]"></div>
        
        <div className="relative z-10 max-w-3xl text-center animate-fadeIn">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent bg-wood-cream/15 px-3.5 py-1 rounded-full uppercase border border-white/10">
            Crafting Heritage Woodwork
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 gold-text-glow">
            Our Story & Craftsmanship
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-wood-cream/80 font-light leading-relaxed max-w-xl mx-auto">
            Discover the legacy of master carpentry, pure teak wood selections, and custom premium interior design contracts straight from our Alamuru workshop.
          </p>
        </div>
      </div>

      {/* Main Content Content Grid */}
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
        
        {/* Core Description block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
              About LD Interiors
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-wood-dark">
              Where Traditional Carvings Meet Modern Living
            </h2>
            <p className="text-sm text-wood-light font-light leading-relaxed">
              Founded by master artisan <strong>Mr. Nagaraju</strong>, LD Interiors & Furnitures has been the hallmark of premium quality woodwork in the Konaseema region with over 25+ years of experience. We specialize in converting raw teak wood and high-grade plywood into functional, lifetime-lasting masterpieces.
            </p>
            <p className="text-sm text-wood-light font-light leading-relaxed">
              Every puja mandiram, double cot bed (Mancham), sofa frame, and kitchen cabinet is built by hand at our workshop in **Mulasthanam, AP**, utilizing strict quality inspections, traditional interlocking carpentry joins, and premium polished finishes.
            </p>
          </div>
          
          <div className="lg:col-span-5 bg-wood-cream border border-wood-border/60 rounded-3xl p-8 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-wood-beige/40 -z-10"></div>
            <h3 className="font-serif text-lg font-bold text-wood-dark mb-4 border-b border-wood-border/30 pb-2">
              Our Core Philosophy
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <ShieldCheck className="h-5 w-5 text-wood-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-wood-dark">100% Genuine Teak Wood</h4>
                  <p className="text-[11px] text-wood-light font-light mt-0.5">We source certified forest reserves teak wood to resist weathering, cracking, or pest damage.</p>
                </div>
              </li>
              <li className="flex gap-3 items-start">
                <Hammer className="h-5 w-5 text-wood-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-wood-dark">Artisan-First Craftsmanship</h4>
                  <p className="text-[11px] text-wood-light font-light mt-0.5">Handcrafted designs featuring traditional Indian motifs, temple arches, and smooth routing panels.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Card 1: Mandiras */}
          <div className="bg-wood-cream/50 border border-wood-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-wood-beige text-wood-accent w-fit mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-wood-dark mb-2">Devotional Puja Mandirams</h3>
            <p className="text-xs text-wood-light font-light leading-relaxed">
              Highly detailed temple designs featuring gopuram carvings, storage drawers, brass inclusions, and dedicated LED spotlight fittings, created in category-standard "Puja Mandiralu".
            </p>
          </div>

          {/* Card 2: Loose Furniture */}
          <div className="bg-wood-cream/50 border border-wood-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-wood-beige text-wood-accent w-fit mb-4">
              <Hammer className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-wood-dark mb-2">Luxury Manchams & Sofas</h3>
            <p className="text-xs text-wood-light font-light leading-relaxed">
              Heavy Rosewood and Teak wood cots, premium modular sectional sofas, office tables, and storage TV cabinets built to customize according to your exact room size layouts.
            </p>
          </div>

          {/* Card 3: Interior Design */}
          <div className="bg-wood-cream/50 border border-wood-border/40 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-2.5 rounded-xl bg-wood-beige text-wood-accent w-fit mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-wood-dark mb-2">Complete Home Interiors</h3>
            <p className="text-xs text-wood-light font-light leading-relaxed">
              End-to-end design, modular kitchen fittings, loose carpentry, false ceiling panel coordination, and modern wardrobe sets executed seamlessly at your site.
            </p>
          </div>
        </div>

        {/* CTA section */}
        <div className="rounded-3xl bg-wood-dark text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url('/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold gold-text-glow">
              Interested in Custom Carpentry?
            </h2>
            <p className="text-xs text-wood-cream/80 font-light leading-relaxed">
              Browse our portfolio designs or place a custom order inquiry. Our head designer, Nagaraju, will contact you directly to guide you through material selections and pricing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <Link 
                href="/products" 
                className="rounded-xl bg-wood-accent text-wood-dark hover:bg-wood-accent/90 px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors"
              >
                Explore Gallery
              </Link>
              <Link 
                href="/contact" 
                className="rounded-xl border border-white/30 hover:border-white hover:bg-white/10 px-6 py-3 text-xs font-bold tracking-widest uppercase text-white transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
