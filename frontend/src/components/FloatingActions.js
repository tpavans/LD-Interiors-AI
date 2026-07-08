"use client";
import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingActions() {
  return (
    <div className="fixed bottom-8 right-6 z-[90] flex flex-col gap-3 p-2 bg-white/70 backdrop-blur-xl border border-wood-border/40 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Call Button */}
      <a
        href="tel:+916281653998"
        title="Call Manager Nagaraju"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-wood-dark hover:bg-wood-medium text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-wood-accent/25 cursor-pointer relative group"
      >
        <Phone className="h-4.5 w-4.5" />
        {/* Tooltip */}
        <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-wood-dark text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md border border-wood-border/20">
          Call Nagaraju
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/916301290966?text=Nameste%20Nagaraju%20Garu!%20I%20visited%20your%20LD%20Interiors%20website%20and%20would%20like%20to%20inquire%20about%20designs."
        target="_blank"
        rel="noopener noreferrer"
        title="Chat on WhatsApp"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-emerald-500/25 cursor-pointer relative group"
      >
        <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 fill-current text-white">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.588 1.45 5.416 1.451 5.372 0 9.742-4.368 9.745-9.743.001-2.602-1.01-5.05-2.846-6.886A9.68 9.68 0 0 0 12.008 1.24c-5.378 0-9.753 4.369-9.756 9.743-.001 1.924.501 3.8 1.456 5.41l-.999 3.648 3.738-.981zm11.387-5.464c-.307-.154-1.82-.9-2.102-1.002-.283-.103-.49-.154-.695.154-.206.308-.797 1.002-.977 1.207-.18.205-.36.23-.667.077-.307-.154-1.298-.478-2.472-1.527-.913-.815-1.53-1.822-1.71-2.129-.18-.308-.019-.475.135-.629.138-.138.307-.36.462-.539.154-.18.206-.308.308-.514.103-.205.051-.385-.026-.54-.077-.154-.695-1.677-.952-2.296-.25-.6-.525-.519-.72-.529-.187-.01-.402-.01-.617-.01-.215 0-.565.081-.861.4-.296.32-1.13 1.105-1.13 2.694 0 1.59 1.157 3.129 1.317 3.334.16.205 2.277 3.477 5.517 4.88.77.334 1.37.533 1.838.682.774.246 1.478.211 2.035.127.62-.093 1.82-.743 2.076-1.462.256-.718.256-1.334.18-1.462-.077-.128-.282-.205-.59-.359z" />
        </svg>
        {/* Tooltip */}
        <span className="absolute right-14 scale-0 group-hover:scale-100 transition-all duration-200 bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md border border-emerald-550/20">
          Chat WhatsApp
        </span>
      </a>
    </div>
  );
}
