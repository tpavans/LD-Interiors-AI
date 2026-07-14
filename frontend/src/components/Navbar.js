"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('admin-login', checkLogin);
    window.addEventListener('admin-logout', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('admin-login', checkLogin);
      window.removeEventListener('admin-logout', checkLogin);
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
        <Link href="/" className="group flex items-center gap-2 select-none shrink-0">
          <span className="font-serif text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-100 via-amber-250 to-yellow-300 bg-clip-text text-transparent hover:brightness-110 transition-all sm:text-lg md:text-xl hidden xs:inline uppercase">
            LD INTERIORS & FURNITURES
          </span>
          <span className="font-serif text-sm font-extrabold tracking-wider bg-gradient-to-r from-amber-100 via-amber-250 to-yellow-300 bg-clip-text text-transparent hover:brightness-110 transition-all xs:hidden uppercase">
            LD INTERIORS
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
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
            href="/wood-guide"
            className={`relative pb-1 transition-colors duration-300 ${
              pathname === '/wood-guide' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            } after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-wood-accent after:transition-all after:duration-300 ${
              pathname === '/wood-guide' ? 'after:w-full' : 'after:w-0 hover:after:w-full'
            }`}
          >
            {t.woodGuide}
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

          {/* Desktop Only Links */}
          <div className="hidden md:flex items-center gap-6 md:gap-8">
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
          </div>

          {/* Global Language Toggle Switcher (EN / TE) */}
          <button
            onClick={() => toggleLanguage()}
            className="flex items-center justify-center rounded-full border border-wood-accent/40 bg-wood-cream/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-extrabold text-wood-accent hover:bg-wood-accent hover:text-white transition-all duration-300 cursor-pointer ml-1 select-none whitespace-nowrap"
            title="Switch Language / భాషను మార్చండి"
          >
            <span>{language === 'EN' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-wood-cream/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Open Menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-wood-accent/30 bg-[#2c1a0f]/95 backdrop-blur-lg px-6 py-4 animate-fadeIn flex flex-col gap-4 text-xs font-bold uppercase tracking-wider text-left border-b-2 border-wood-accent/50">
          <Link
            href="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-1.5 block transition-colors ${
              pathname === '/orders' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            }`}
          >
            {t.orders}
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-1.5 block transition-colors ${
              pathname === '/contact' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            }`}
          >
            {t.contact}
          </Link>
          {isLoggedIn && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`py-1.5 block transition-colors ${
                pathname.startsWith('/admin') ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
              }`}
            >
              {t.dashboard} ({adminName})
            </Link>
          )}
          {isLoggedIn && (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-start gap-1.5 py-2.5 text-left border-t border-wood-accent/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
