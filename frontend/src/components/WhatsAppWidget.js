"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquare, X, ShieldCheck, Phone } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();

  const isTelugu = language === 'TE';

  const contacts = [
    {
      name: isTelugu ? "శ్రీ నాగరాజు గారు" : "Mr. Nagaraju",
      role: isTelugu ? "చీఫ్ కార్పెంటర్ & ఆర్డర్స్" : "Chief Carpenter & Orders",
      desc: isTelugu ? "టేకు చెక్కడాల నిపుణుడు" : "Teak Carvings Specialist",
      phone: "916301290966",
      avatar: "N"
    },
    {
      name: isTelugu ? "పవన్ సాయి" : "Pavan Sai",
      role: isTelugu ? "టెక్నికల్ & సపోర్ట్" : "Technical & Support",
      desc: isTelugu ? "ఆర్డర్ల ట్రాకింగ్ సహాయం" : "Technical Consultations",
      phone: "919346325291",
      avatar: "P"
    }
  ];

  const handleChatRedirect = (phone, name) => {
    const greeting = isTelugu 
      ? `నమస్తే ${name}! నేను LD ఇంటీరియర్స్ వెబ్‌సైట్ ద్వారా సంప్రదిస్తున్నాను. నాకు ఒక ఆర్డర్/ఎంక్వైరీ కి సంబంధించిన వివరాలు కావాలి.`
      : `Hello ${name}! I am visiting your LD Interiors website and would like to inquire about a custom woodwork design.`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  return (
    <div className="fixed bottom-[96px] right-6 landscape:bottom-4 landscape:right-[76px] z-50 font-sans">
      {/* Expanded Widget Popup Card */}
      {isOpen && (
        <div className="mb-4 w-76 sm:w-80 max-h-[72vh] landscape:max-h-[220px] overflow-y-auto rounded-3xl bg-white/90 backdrop-blur-xl border border-wood-border/60 p-5 shadow-2xl animate-fadeIn transition-all duration-350">
          <div className="flex items-center justify-between border-b border-wood-border/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
              <div>
                <h4 className="text-xs font-bold text-wood-dark font-serif">
                  {isTelugu ? "వాట్సాప్ లైవ్ చాట్" : "WhatsApp Live Support"}
                </h4>
                <p className="text-[9px] text-wood-light font-light">
                  {isTelugu ? "సాధారణంగా నిమిషాల్లో సమాధానమిస్తాము" : "Typically replies in minutes"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-wood-dark transition-colors cursor-pointer"
              title="Close Support Window"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {contacts.map((c, i) => (
              <div 
                key={i}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-wood-cream/40 border border-wood-border/30 transition-all duration-300 hover:bg-wood-cream/65"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wood-dark text-wood-accent font-extrabold text-xs select-none shadow-sm">
                  {c.avatar}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-bold text-wood-dark truncate leading-none">{c.name}</p>
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Online"></span>
                  </div>
                  <p className="text-[9px] font-semibold text-wood-accent mt-1 leading-none">{c.role}</p>
                  <p className="text-[8px] text-wood-light font-light mt-0.5 truncate">{c.desc}</p>
                </div>
                
                {/* Actions: Call & WhatsApp */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:+${c.phone}`}
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-wood-dark hover:bg-wood-medium text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    title={isTelugu ? "కాల్ చేయండి" : "Call support phone"}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleChatRedirect(c.phone, c.name)}
                    className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                    title={isTelugu ? "వాట్సాప్ చాట్" : "WhatsApp Chat"}
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-wood-border/30 text-center flex items-center justify-center gap-1 text-[8px] text-wood-light font-light uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3 text-wood-accent" />
            <span>Official LD Interiors Channels</span>
          </div>
        </div>
      )}

      {/* Floating Action Circle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-14 w-14 landscape:h-11 landscape:w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 duration-300 cursor-pointer group"
        title="WhatsApp Support Chat"
      >
        {/* Pulsing Backlight Effect */}
        <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse duration-1000 -z-10 group-hover:scale-110 transition-transform"></span>
        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping -z-10"></span>
        
        {isOpen ? (
          <X className="h-6 w-6 landscape:h-4.5 landscape:w-4.5 animate-spin-once" />
        ) : (
          <MessageSquare className="h-6 w-6 landscape:h-4.5 landscape:w-4.5 fill-current" />
        )}
      </button>
    </div>
  );
}
