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
    <header className="sticky top-0 z-50 w-full bg-[#0B192C] border-b border-sky-500/30 shadow-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 select-none shrink-0">
          <img 
            src="/logo.png" 
            alt="LD Interiors Logo" 
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-sky-400/40 shadow-md shrink-0 group-hover:scale-105 transition-all" 
          />
          <div className="flex flex-col">
            <span className="font-serif text-sm font-extrabold tracking-wider text-white hover:text-sky-300 transition-all sm:text-base md:text-lg hidden xs:inline uppercase leading-tight">
              LD INTERIORS & FURNITURES
            </span>
            <span className="font-serif text-sm font-extrabold tracking-wider text-white hover:text-sky-300 transition-all xs:hidden uppercase leading-tight">
              LD INTERIORS
            </span>
            <span className="text-[8.5px] tracking-widest text-sky-300/80 uppercase font-semibold hidden sm:inline">
              Designing Spaces. Defining Lifestyles.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold uppercase tracking-widest">
          <Link
            href="/"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/' ? 'text-sky-300' : 'text-slate-200 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
              pathname === '/' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/products"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/products' ? 'text-sky-300' : 'text-slate-200 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
              pathname === '/products' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.designs}
          </Link>

          <Link
            href="/reels"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/reels' ? 'text-sky-300' : 'text-slate-200 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
              pathname === '/reels' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.reels}
          </Link>
          <Link
            href="/orders"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/orders' ? 'text-sky-300' : 'text-slate-200 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
              pathname === '/orders' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.orders}
          </Link>
          <Link
            href="/contact"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/contact' ? 'text-sky-300' : 'text-slate-200 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
              pathname === '/contact' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.contact}
          </Link>
          {isLoggedIn && (
            <Link
              href="/admin"
              className={`relative pb-1 flex items-center gap-1 transition-colors duration-300 ${
                pathname.startsWith('/admin') ? 'text-sky-300' : 'text-slate-200 hover:text-white'
              } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-sky-400 after:transition-all after:duration-300 ${
                pathname.startsWith('/admin') ? 'after:w-full' : 'after:w-0 hover:after:w-full'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>{t.dashboard}</span>
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-red-350 hover:bg-red-950/40 hover:text-red-400 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              <span>{t.logout}</span>
            </button>
          )}

          {/* Desktop Language Toggle */}
          <button
            onClick={() => toggleLanguage()}
            className="flex items-center justify-center rounded-full border border-sky-400/40 bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-sky-300 hover:bg-sky-400 hover:text-slate-900 transition-all duration-300 cursor-pointer ml-1 select-none whitespace-nowrap"
            title="Switch Language / భాషను మార్చండి"
          >
            <span>{language === 'EN' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Dedicated Wishlist Love Icon Button */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center p-1.5 rounded-full border border-pink-400/40 bg-white/10 text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer ml-1.5 group"
            title="My Dream Designs Wishlist"
          >
            <Heart className="h-4 w-4 fill-pink-500 text-pink-400 group-hover:fill-white group-hover:text-white" />
            {likedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-slate-900">
                {likedCount}
              </span>
            )}
          </Link>

          {/* User Profile Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative flex items-center justify-center p-1.5 rounded-full border border-sky-400/40 bg-white/10 text-sky-300 hover:bg-sky-400 hover:text-slate-900 transition-all duration-300 cursor-pointer ml-1.5"
            title="User Profile Account"
          >
            <User className="h-4 w-4" />
            {isUserLoggedIn && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Mobile controls bar (Clean layout for mobile screens) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">

          {/* Mobile Wishlist Love Icon Link */}
          <Link
            href="/wishlist"
            className="relative flex items-center justify-center p-2 rounded-full border border-pink-400/40 bg-white/10 text-pink-400 hover:bg-pink-500 hover:text-white transition-all duration-300 cursor-pointer"
            title="My Dream Designs Wishlist"
          >
            <Heart className="h-4 w-4 fill-pink-500 text-pink-400" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-slate-900">
                {likedCount}
              </span>
            )}
          </Link>

          {/* Mobile User Profile Account Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-full border border-sky-400/40 bg-white/10 text-sky-300 hover:bg-sky-400 hover:text-slate-900 transition-all duration-300 cursor-pointer"
            title="User Profile Account"
          >
            <User className="h-4 w-4" />
            {isUserLoggedIn && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-slate-900 animate-pulse" />
            )}
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="Open Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-sky-300" /> : <Menu className="h-6 w-6 text-sky-300" />}
          </button>
        </div>
      </div>

      {/* Pure White Background Sub-Navbar Search Bar */}
      <div className="w-full bg-white border-t border-b border-slate-200 py-3 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl relative flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Main Pure White Search Input Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-2xl flex items-center">
            <div className="relative w-full flex items-center">
              <Search className="absolute left-4 h-4.5 w-4.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder={isTelugu ? "500+ డిజైన్ల కోసం వెతకండి (గుమ్మాలు, పూజ మందిరాలు, బెడ్స్, డైనింగ్...)" : "Search 500+ designs (Teak doors, Puja mandirams, Beds, Kitchens...)"}
                className="w-full rounded-full border-2 border-sky-300 bg-white pl-11 pr-26 py-2.5 text-xs sm:text-sm text-slate-900 font-medium placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/20 transition-all shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setSearchSuggestions([]); }}
                  className="absolute right-22 text-slate-400 hover:text-slate-700 text-xs p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-[#008DDA] hover:bg-[#0077B6] text-white font-extrabold text-[10px] sm:text-xs uppercase tracking-wider rounded-full transition-all shadow-md flex items-center gap-1 cursor-pointer select-none"
              >
                <span>{isTelugu ? "వెతుకు" : "Search"}</span>
              </button>
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2 divide-y divide-slate-100">
                  {searchSuggestions.map((item) => (
                    <Link
                      key={item._id}
                      href={`/products/${item._id}`}
                      onClick={() => setIsSearchFocused(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <img src={item.image} alt={item.title} className="h-9 w-9 rounded-lg object-cover border border-slate-200" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-[9px] text-[#008DDA] uppercase font-semibold">{item.category}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* Neatly Aligned Quick Trending Tags Bar */}
          <div className="w-full md:w-auto flex items-center justify-start md:justify-end gap-2 overflow-x-auto scrollbar-none py-0.5 text-xs font-bold text-slate-900 whitespace-nowrap">
            <span className="text-slate-600 text-[10px] uppercase tracking-widest shrink-0 flex items-center gap-1 font-extrabold">
              <Sparkles className="h-3.5 w-3.5 text-sky-500" />
              {isTelugu ? "ట్రెండింగ్:" : "Trending:"}
            </span>
            <button
              type="button"
              onClick={() => router.push('/products?category=Gummalu')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer text-[11px]"
            >
              🚪 {isTelugu ? "గుమ్మాలు" : "Gummalu"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/products?category=Puja%20Mandiralu')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer text-[11px]"
            >
              🪵 {isTelugu ? "పూజ మందిరాలు" : "Puja Mandirams"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/products?category=Wooden%20Beds')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer text-[11px]"
            >
              🛏️ {isTelugu ? "బెడ్స్" : "Teak Beds"}
            </button>
            <button
              type="button"
              onClick={() => router.push('/products?category=Kitchen')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all cursor-pointer text-[11px]"
            >
              🍳 {isTelugu ? "కిచెన్స్" : "Kitchens"}
            </button>
          </div>
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
