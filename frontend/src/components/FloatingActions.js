"use client";
import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-26 right-6 z-[90] flex flex-col gap-3.5">
      {/* Call Button */}
      <a
        href="tel:+916281653998"
        title="Call Manager Nagaraju"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg hover:bg-amber-700 transition-all duration-300 hover:scale-110 active:scale-95 border border-amber-900/10 cursor-pointer"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/916301290966?text=Namaste%20Nagaraju%20Garu!%20I%20visited%20your%20LD%20Interiors%20website%20and%20would%20like%20to%20inquire%20about%20designs."
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all duration-300 hover:scale-110 active:scale-95 border border-emerald-700/10 cursor-pointer"
      >
        <MessageCircle className="h-5.5 w-5.5" />
      </a>
    </div>
  );
}
