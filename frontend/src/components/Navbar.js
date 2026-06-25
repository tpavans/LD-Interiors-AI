"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full wood-header-3d border-b-2 border-wood-accent/50">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2 select-none shrink-0">
          <span className="font-serif text-sm font-extrabold tracking-wider gold-text-glow sm:text-lg md:text-xl hidden xs:inline">
            LD INTERIORS & FURNITURES
          </span>
          <span className="font-serif text-sm font-extrabold tracking-wider gold-text-glow xs:hidden">
            LD INTERIORS
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 text-xs font-bold uppercase tracking-wider">
          <Link
            href="/"
            className={`transition-colors ${
              pathname === '/' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
            }`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`transition-colors ${
              pathname === '/products' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
            }`}
          >
            Designs
          </Link>

          {/* Desktop Only Links */}
          <div className="hidden md:flex items-center gap-5 sm:gap-6 md:gap-8">
            <Link
              href="/orders"
              className={`transition-colors ${
                pathname === '/orders' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
              }`}
            >
              Orders
            </Link>
            <Link
              href="/contact"
              className={`transition-colors ${
                pathname === '/contact' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
              }`}
            >
              Contact
            </Link>
            <Link
              href="/admin"
              className={`transition-colors flex items-center gap-1 ${
                pathname.startsWith('/admin') ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
              }`}
            >
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="h-3.5 w-3.5 hidden sm:inline" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5 hidden sm:inline" />
                  <span>Admin</span>
                </>
              )}
            </Link>
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-full border border-wood-accent/40 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-wood-cream hover:bg-wood-accent hover:text-wood-dark hover:border-wood-accent transition-all duration-300 cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout</span>
              </button>
            )}
          </div>

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
            Orders
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-1.5 block transition-colors ${
              pathname === '/contact' ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            }`}
          >
            Contact
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`py-1.5 block transition-colors ${
              pathname.startsWith('/admin') ? 'text-wood-accent' : 'text-wood-cream/70 hover:text-white'
            }`}
          >
            {isLoggedIn ? `Dashboard (${adminName})` : 'Admin Login'}
          </Link>
          {isLoggedIn && (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full flex items-center justify-start gap-1.5 py-2.5 text-left border-t border-wood-accent/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
