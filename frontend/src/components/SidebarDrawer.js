"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, Grid, Film, Package, Heart, Phone, HelpCircle, ChevronRight, MessageCircle, Sparkles, BookOpen, Moon, Sun, Filter, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const CATEGORY_SHORTLINKS = [
  { name: 'Teakwood Doors', nameTe: 'టేకు గుమ్మాలు', href: '/products?category=Doors', subCount: '50+ Designs' },
  { name: 'Puja Mandiralu', nameTe: 'పూజ మందిరాలు', href: '/products?category=Puja%20Mandiralu', subCount: '40+ Designs' },
  { name: 'Wooden Beds', nameTe: 'టేకువుడ్ బెడ్స్', href: '/products?category=Wooden%20Beds', subCount: '60+ Designs' },
  { name: 'Living Room Sofas', nameTe: 'సోఫాలు', href: '/products?category=Sofas', subCount: '35+ Designs' },
  { name: 'Dining Tables', nameTe: 'డైనింగ్ టేబుల్స్', href: '/products?category=Dining%20Tables', subCount: '25+ Designs' },
  { name: 'Uyyala Swings', nameTe: 'ఉయ్యాలలు', href: '/products?category=Uyyala%20Swings', subCount: '20+ Designs' },
  { name: 'Teak Windows', nameTe: 'టేకువుడ్ కిటికీలు', href: '/products?category=Wooden%20Windows', subCount: '30+ Designs' },
  { name: 'Custom Interiors', nameTe: 'ఇంటీరియర్ పనులు', href: '/contact', subCount: 'Full Setup' },
];

export default function SidebarDrawer({ isOpen, onClose }) {
  const pathname = usePathname();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isTelugu = language === 'TE';
  const [selectedWoodFilter, setSelectedWoodFilter] = useState('All');

  // Prevent background body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex font-sans">
      {/* Dark Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Slide-out Sidebar Drawer Card */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#0B192C] text-white h-full flex flex-col shadow-2xl border-r border-sky-500/30 z-[130] animate-slideRight overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-500/30 flex items-center justify-between bg-[#081220]">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="LD Interiors Logo" 
              className="h-9 w-9 rounded-full object-cover border border-amber-400/60 shadow-md shrink-0" 
            />
            <div>
              <h3 className="font-serif font-black text-sm text-white tracking-wider uppercase">
                LD INTERIORS
              </h3>
              <p className="text-[9px] text-amber-400 font-bold tracking-widest uppercase">
                {isTelugu ? "మాస్టర్ కార్పెంటర్ నగరాజు గారు" : "Handcrafted Teakwood"}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-red-600/80 transition-colors cursor-pointer"
            title="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin text-left">
          
          {/* Main Navigation Links */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-2 px-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>{isTelugu ? "నేవిగేషన్ మెనూ" : "Quick Navigation"}</span>
            </p>
            <div className="space-y-1">
              <Link 
                href="/" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Home className="h-4 w-4 shrink-0" />
                <span>{isTelugu ? "హోమ్ పేజీ" : "Home"}</span>
              </Link>
              <Link 
                href="/products" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/products' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Grid className="h-4 w-4 shrink-0" />
                <span>{isTelugu ? "500+ ఫర్నిచర్ డిజైన్లు" : "All Furniture Designs"}</span>
              </Link>
              <Link 
                href="/reels" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/reels' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Film className="h-4 w-4 shrink-0 text-red-400" />
                <span>{isTelugu ? "వర్క్‌షాప్ రీల్స్ & వీడియోస్" : "Workshop Reels & Shorts"}</span>
              </Link>
              <Link 
                href="/orders" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/orders' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Package className="h-4 w-4 shrink-0 text-sky-400" />
                <span>{isTelugu ? "నా ఆర్డర్లు & ట్రాకింగ్" : "My Orders & Tracking"}</span>
              </Link>
              <Link 
                href="/wishlist" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/wishlist' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <Heart className="h-4 w-4 shrink-0 text-pink-400" />
                <span>{isTelugu ? "నా విష్‌లిస్ట్ డిజైన్స్" : "My Wishlist Designs"}</span>
              </Link>
              <Link 
                href="/wood-guide" 
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${pathname === '/wood-guide' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-200 hover:bg-white/10 hover:text-white'}`}
              >
                <BookOpen className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{isTelugu ? "బర్మా టేకువుడ్ గైడ్" : "Burma Teakwood Guide"}</span>
              </Link>
            </div>
          </div>

          {/* Quick Design Filters */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-2 px-2 flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-amber-400" />
              <span>{isTelugu ? "డిజైన్ ఫిల్టర్స్" : "Quick Design Filters"}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {['All', 'Burma Teak', 'Rosewood', 'PU Polish', 'Carving'].map((filterName) => (
                <Link
                  key={filterName}
                  href={`/products?search=${encodeURIComponent(filterName === 'All' ? '' : filterName)}`}
                  onClick={onClose}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedWoodFilter === filterName ? 'bg-amber-400 text-slate-950 font-black' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                >
                  {filterName}
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Categories with Inside Sub-counts */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2 px-2">
              {isTelugu ? "పాపులర్ కేటగిరీలు & డిజైన్స్" : "Popular Categories & Designs"}
            </p>
            <div className="grid grid-cols-1 gap-1">
              {CATEGORY_SHORTLINKS.map((cat, idx) => (
                <Link
                  key={idx}
                  href={cat.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-amber-300 transition-colors group"
                >
                  <div>
                    <span className="font-semibold">{isTelugu ? cat.nameTe : cat.name}</span>
                    <span className="text-[9px] text-amber-400/80 block font-mono">{cat.subCount}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-amber-300 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Support & Contact Links */}
          <div className="pt-2 border-t border-sky-500/20 space-y-1">
            <Link 
              href="/contact" 
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isTelugu ? "వర్క్‌షాప్ కాంటాక్ట్" : "Contact Workshop"}</span>
            </Link>
            <Link 
              href="/support" 
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-sky-400 shrink-0" />
              <span>{isTelugu ? "సపోర్ట్ & సహాయం" : "Customer Support & FAQs"}</span>
            </Link>
          </div>

        </div>

        {/* Footer Actions: Dark / Light Mode Switch & WhatsApp */}
        <div className="p-4 border-t border-sky-500/30 bg-[#081220] space-y-2.5">
          {/* Dark / Light Mode Theme Toggle Switch */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full py-2.5 px-3 rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-400" />}
              <span>{theme === 'dark' ? (isTelugu ? "డార్క్ మోడ్ (Dark)" : "Dark Theme Active") : (isTelugu ? "లైట్ మోడ్ (Light)" : "Light Theme Active")}</span>
            </span>
            <span className="text-[10px] font-black uppercase underline">{theme === 'dark' ? 'Switch to Light ☀️' : 'Switch to Dark 🌙'}</span>
          </button>

          {/* Language Selector */}
          <button
            type="button"
            onClick={() => { toggleLanguage(); }}
            className="w-full py-2.5 px-3 rounded-xl border border-sky-400/40 bg-white/10 text-sky-300 hover:bg-sky-400 hover:text-slate-950 font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
          >
            <span>{isTelugu ? "🌐 భాష: తెలుగు" : "🌐 Language: English"}</span>
            <span className="text-[10px] font-black uppercase underline">{isTelugu ? "Switch to EN" : "తెలుగులోకి మార్చు"}</span>
          </button>

          {/* WhatsApp Direct Contact */}
          <a
            href="https://wa.me/916281653998?text=Hi%20Nagaraju%20garu,%20I%20visited%20LD%20Interiors%20website%20and%20want%20to%20inquire%20about%20furniture."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 fill-white text-emerald-600 shrink-0" />
            <span>{isTelugu ? "వాట్సాప్‌లో చాట్ చేయండి" : "WhatsApp Nagaraju Garu"}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
