"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, Menu, X, Heart, Search, Sparkles, ChevronRight } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import ProfileDrawer from './ProfileDrawer';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Customer Login Drawer States
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [likedCount, setLikedCount] = useState(0);

  // E-Commerce Sub-Navbar Search Bar States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

  // Sync login status from localstorage
  const checkLogin = () => {
    const token = localStorage.getItem('ld_token');
    const admin = localStorage.getItem('ld_admin');
    if (token && admin) {
      setIsLoggedIn(true);
      try {
        setAdminName(JSON.parse(admin).name || 'Admin');
      } catch (e) {
        setAdminName('Admin');
      }
    } else {
      setIsLoggedIn(false);
      setAdminName('');
    }

    // Check user login
    const userToken = localStorage.getItem('ld_user_token');
    const userPhone = localStorage.getItem('ld_user_phone');
    if (userToken && userPhone) {
      setIsUserLoggedIn(true);
    } else {
      setIsUserLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('admin-login', checkLogin);
    window.addEventListener('admin-logout', checkLogin);

    const openDrawer = () => setIsProfileDrawerOpen(true);
    window.addEventListener('open-profile-drawer', openDrawer);

    // Sync liked count
    const updateLiked = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
        setLikedCount(liked.length);
      } catch (e) {
        setLikedCount(0);
      }
    };
    updateLiked();
    window.addEventListener('liked-updated', updateLiked);
    window.addEventListener('storage', updateLiked);

    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('admin-login', checkLogin);
      window.removeEventListener('admin-logout', checkLogin);
      window.removeEventListener('open-profile-drawer', openDrawer);
      window.removeEventListener('liked-updated', updateLiked);
      window.removeEventListener('storage', updateLiked);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ld_token');
    localStorage.removeItem('ld_admin');
    setIsLoggedIn(false);
    setAdminName('');
    window.dispatchEvent(new Event('admin-logout'));
    router.push('/');
  };

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Filter live suggestions when typing
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const cachedProdStr = sessionStorage.getItem('ld_cached_products');
      if (cachedProdStr) {
        const prods = JSON.parse(cachedProdStr);
        const filtered = prods.filter(p => 
          p.title?.toLowerCase().includes(query.toLowerCase()) || 
          p.category?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
        setSearchSuggestions(filtered);
      }
    } catch (err) {
      setSearchSuggestions([]);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] w-full bg-[#0B192C] border-b border-sky-500/30 shadow-2xl transition-all duration-300">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4">
        {/* Brand Logo & Title (Amazon Left Section) */}
        <Link href="/" className="group flex items-center gap-2 select-none shrink-0">
          <img 
            src="/logo.png" 
            alt="LD Interiors Logo" 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover border border-sky-400/40 shadow-md shrink-0 group-hover:scale-105 transition-all" 
          />
          <div className="flex flex-col">
            <span className="font-serif text-xs sm:text-sm md:text-base font-extrabold tracking-wider text-white hover:text-sky-300 transition-all uppercase leading-tight">
              LD INTERIORS
            </span>
            <span className="text-[8px] tracking-widest text-sky-300/80 uppercase font-semibold hidden lg:inline">
              Designing Spaces. Defining Lifestyles.
            </span>
          </div>
        </Link>

        {/* Center: Amazon-Style Main Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl mx-1 sm:mx-3">
          <div className="relative w-full flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder={isTelugu ? "500+ టేకువుడ్ డిజైన్ల కోసం వెతకండి (గుమ్మాలు, మంచాలు, పూజ మందిరాలు...)" : "Search 500+ teakwood designs (Doors, Mandir, Beds)..."}
              className="w-full rounded-l-lg border-y border-l border-sky-300/40 bg-white pl-3.5 pr-8 py-2 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-md"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }}
                className="absolute right-12 text-slate-400 hover:text-slate-700 text-xs p-1"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-3.5 sm:px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-r-lg transition-all shadow-md flex items-center justify-center shrink-0 cursor-pointer border-y border-r border-amber-500"
              title="Search"
            >
              <Search className="h-4 w-4 text-slate-950 stroke-[3]" />
            </button>
          </div>

          {/* Live Amazon/Flipkart Style Autocomplete Dropdown */}
          {isSearchFocused && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between px-3.5 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-sky-500" />
                  {isTelugu ? "లభించిన ఉత్పత్తులు" : "Matching Products"} ({searchSuggestions.length})
                </span>
                <span className="text-[9px] text-slate-500 font-medium">{isTelugu ? "డిజైన్ కోసం క్లిక్ చేయండి" : "Click to view design"}</span>
              </div>

              {searchSuggestions.length > 0 ? (
                <div className="p-1.5 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {searchSuggestions.map((item) => (
                    <div
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsSearchFocused(false);
                        router.push(`/products/${item._id}`);
                      }}
                      className="flex items-center gap-3 p-2.5 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer group text-left"
                    >
                      <img src={item.image} alt={item.title} className="h-11 w-11 rounded-lg object-cover border border-slate-200 shrink-0 group-hover:scale-105 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 truncate group-hover:text-[#008DDA] transition-colors">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-bold text-[#008DDA] uppercase tracking-wider bg-sky-100/70 px-2 py-0.5 rounded-md">{item.category}</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{item.price && item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for price'}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#008DDA] transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center">
                  <p className="text-xs text-slate-600 font-medium">{isTelugu ? `"${searchQuery}" కి ఉత్పత్తులు లభించలేదు` : `No matching designs found for "${searchQuery}"`}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{isTelugu ? "గుమ్మాలు, బెడ్స్, పూజ మందిరాలు అని వెతకండి" : "Try searching for Doors, Beds, Puja Mandirams..."}</p>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Right Side Desktop Amazon Navigation Links & Controls */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-xs font-bold uppercase tracking-wider shrink-0">
          <Link
            href="/products"
            className={`transition-colors py-1 ${
              pathname === '/products' ? 'text-amber-400 font-extrabold border-b-2 border-amber-400' : 'text-slate-200 hover:text-amber-300'
            }`}
          >
            {t.designs}
          </Link>

          <Link
            href="/orders"
            className={`transition-colors py-1 ${
              pathname === '/orders' ? 'text-amber-400 font-extrabold border-b-2 border-amber-400' : 'text-slate-200 hover:text-amber-300'
            }`}
          >
            {t.orders}
          </Link>

          {isLoggedIn && (
            <Link
              href="/admin"
              className={`flex items-center gap-1 transition-colors py-1 ${
                pathname.startsWith('/admin') ? 'text-amber-400 font-extrabold border-b-2 border-amber-400' : 'text-slate-200 hover:text-amber-300'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{t.dashboard}</span>
            </Link>
          )}

          {/* Desktop Language Toggle */}
          <button
            onClick={() => toggleLanguage()}
            className="flex items-center justify-center rounded-md border border-sky-400/40 bg-white/10 px-2 py-1 text-[10px] font-extrabold text-sky-300 hover:bg-sky-400 hover:text-slate-900 transition-all cursor-pointer select-none"
            title="Switch Language / భాషను మార్చండి"
          >
            <span>{language === 'EN' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Dedicated Wishlist Love Icon Button */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center p-2 rounded-md border border-pink-400/40 bg-white/10 text-pink-400 hover:bg-pink-500 hover:text-white transition-all cursor-pointer group"
            title="My Dream Designs Wishlist"
          >
            <Heart className="h-4 w-4 fill-pink-500 text-pink-400 group-hover:fill-white group-hover:text-white" />
            {likedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-slate-900">
                {likedCount}
              </span>
            )}
          </Link>

          {/* User Profile Account Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-sky-400/40 bg-white/10 text-sky-300 hover:bg-sky-400 hover:text-slate-900 transition-all cursor-pointer"
            title="User Profile Account"
          >
            <User className="h-4 w-4" />
            <span className="text-[10px] font-extrabold">{isUserLoggedIn ? 'Account' : 'Account'}</span>
            {isUserLoggedIn && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Mobile Right Controls */}
        <div className="flex md:hidden items-center gap-1 shrink-0">
          <Link
            href="/wishlist"
            className="relative p-1.5 text-pink-400 cursor-pointer"
            title="Wishlist"
          >
            <Heart className="h-4 w-4 fill-pink-500 text-pink-400" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">
                {likedCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="p-1.5 text-sky-300 cursor-pointer"
            title="Account"
          >
            <User className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-sky-300 cursor-pointer"
            title="Open Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-sky-500/30 bg-[#0B192C]/98 backdrop-blur-xl px-6 py-6 animate-fadeIn flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-left border-b-2 border-sky-500/50 shadow-2xl">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 block transition-colors border-b border-wood-accent/10 ${
              pathname === '/' ? 'text-wood-accent font-extrabold' : 'text-wood-cream/80 hover:text-white'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/products"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 block transition-colors border-b border-wood-accent/10 ${
              pathname === '/products' ? 'text-wood-accent font-extrabold' : 'text-wood-cream/80 hover:text-white'
            }`}
          >
            {t.designs}
          </Link>

          <Link
            href="/reels"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 block transition-colors border-b border-wood-accent/10 ${
              pathname === '/reels' ? 'text-wood-accent font-extrabold' : 'text-wood-cream/80 hover:text-white'
            }`}
          >
            {t.reels}
          </Link>
          <Link
            href="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 block transition-colors border-b border-wood-accent/10 ${
              pathname === '/orders' ? 'text-wood-accent font-extrabold' : 'text-wood-cream/80 hover:text-white'
            }`}
          >
            {t.orders}
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-2 block transition-colors border-b border-wood-accent/10 ${
              pathname === '/contact' ? 'text-wood-accent font-extrabold' : 'text-wood-cream/80 hover:text-white'
            }`}
          >
            {t.contact}
          </Link>

          {/* Language Toggle in Mobile Drawer */}
          <button
            onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl border border-wood-accent/30 bg-white/5 text-wood-accent hover:bg-wood-accent hover:text-white transition-all cursor-pointer mt-1"
          >
            <span>{isTelugu ? "🌐 భాష: తెలుగు" : "🌐 Language: English"}</span>
            <span className="text-[10px] underline font-bold">{isTelugu ? "Switch to EN" : "తెలుగులోకి మార్చు"}</span>
          </button>

          {isLoggedIn && (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-start gap-1.5 py-2.5 px-3.5 rounded-xl text-left border border-red-500/30 bg-red-950/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer mt-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </button>
          )}
        </div>
      )}

      {/* Slide Profile Drawer Overlay */}
      <ProfileDrawer 
        isOpen={isProfileDrawerOpen} 
        onClose={() => setIsProfileDrawerOpen(false)} 
      />
    </header>
  );
}
