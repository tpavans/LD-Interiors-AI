"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, Menu, X, Heart } from 'lucide-react';

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

  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

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

  return (
    <header className="sticky top-0 z-50 w-full glass-panel-dark border-b border-wood-accent/30 shadow-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 select-none shrink-0">
          <img 
            src="/logo.png" 
            alt="LD Interiors Logo" 
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-amber-400/40 shadow-md shrink-0 group-hover:scale-105 transition-all" 
          />
          <div className="flex flex-col">
            <span className="font-serif text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-100 via-amber-250 to-yellow-300 bg-clip-text text-transparent hover:brightness-110 transition-all sm:text-base md:text-lg hidden xs:inline uppercase leading-tight">
              LD INTERIORS & FURNITURES
            </span>
            <span className="font-serif text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-100 via-amber-250 to-yellow-300 bg-clip-text text-transparent hover:brightness-110 transition-all xs:hidden uppercase leading-tight">
              LD INTERIORS
            </span>
            <span className="text-[8.5px] tracking-widest text-wood-accent/80 uppercase font-semibold hidden sm:inline">
              Designing Spaces. Defining Lifestyles.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold uppercase tracking-widest">
          <Link
            href="/"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.home}
          </Link>
          <Link
            href="/products"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/products' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/products' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.designs}
          </Link>

          <Link
            href="/reels"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/reels' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/reels' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.reels}
          </Link>
          <Link
            href="/orders"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/orders' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/orders' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.orders}
          </Link>
          <Link
            href="/contact"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/contact' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/contact' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.contact}
          </Link>
          {isLoggedIn && (
            <Link
              href="/admin"
              className={`relative pb-1 flex items-center gap-1 transition-colors duration-300 ${
                pathname.startsWith('/admin') ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
              } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
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
            className="flex items-center justify-center rounded-full border border-wood-accent/40 bg-wood-cream/10 px-2.5 py-1 text-[10px] font-extrabold text-wood-accent hover:bg-wood-accent hover:text-white transition-all duration-300 cursor-pointer ml-1 select-none whitespace-nowrap"
            title="Switch Language / భాషను మార్చండి"
          >
            <span>{language === 'EN' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Permanent Dream Designs Heart Button */}
          <button
            onClick={() => {
              if (pathname === '/products') {
                window.dispatchEvent(new Event('open-liked-drawer'));
              } else {
                router.push('/products?openLiked=true');
              }
            }}
            className="relative flex items-center gap-1.5 rounded-full border border-red-400/50 bg-red-950/20 px-3 py-1 text-[10px] font-extrabold text-red-300 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer ml-1 select-none shadow-sm"
            title="Dream Designs Board / నచ్చిన డిజైన్‌లు"
          >
            <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 animate-pulse" />
            <span>{language === 'EN' ? 'Dream Designs' : 'నచ్చిన డిజైన్‌లు'}</span>
            {likedCount > 0 && (
              <span className="ml-0.5 rounded-full bg-red-600 px-1.5 py-0.2 text-[8px] font-extrabold text-white">
                {likedCount}
              </span>
            )}
          </button>

          {/* User Profile Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative flex items-center justify-center p-1.5 rounded-full border border-wood-accent/40 bg-wood-cream/10 text-wood-accent hover:bg-wood-accent hover:text-[#1d0f07] transition-all duration-300 cursor-pointer ml-1.5"
            title="User Profile Account"
          >
            <User className="h-4 w-4" />
            {isUserLoggedIn && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-amber-950 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Mobile controls bar (Clean 3-item layout for mobile screens) */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          {/* Mobile Dream Designs Heart Button */}
          <button
            onClick={() => {
              if (pathname === '/products') {
                window.dispatchEvent(new Event('open-liked-drawer'));
              } else {
                router.push('/products?openLiked=true');
              }
            }}
            className="relative flex items-center justify-center p-2 rounded-full border border-red-400/50 bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 cursor-pointer select-none"
            title="Dream Designs Board / నచ్చిన డిజైన్‌లు"
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            {likedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-extrabold text-white ring-1 ring-amber-950">
                {likedCount}
              </span>
            )}
          </button>

          {/* Mobile User Profile Account Button */}
          <button
            onClick={() => setIsProfileDrawerOpen(true)}
            className="relative flex items-center justify-center p-2 rounded-full border border-wood-accent/40 bg-wood-cream/10 text-wood-accent hover:bg-wood-accent hover:text-[#1d0f07] transition-all duration-300 cursor-pointer"
            title="User Profile Account"
          >
            <User className="h-4 w-4" />
            {isUserLoggedIn && (
              <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-amber-950 animate-pulse" />
            )}
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-wood-cream/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="Open Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6 text-amber-300" /> : <Menu className="h-6 w-6 text-amber-300" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-wood-accent/30 bg-[#2c1a0f]/98 backdrop-blur-xl px-6 py-6 animate-fadeIn flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-left border-b-2 border-wood-accent/50 shadow-2xl">
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
