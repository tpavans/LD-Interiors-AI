"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState('');

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
    // Listening to custom triggers to sync login states across client page switches
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
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-serif text-lg font-bold tracking-widest gold-text-glow sm:text-xl">
            LD INTERIORS & FURNITURES
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-5 sm:gap-6 md:gap-8">
          <Link
            href="/"
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === '/' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
            }`}
          >
            Home
          </Link>
          <Link
            href="/products"
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === '/products' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
            }`}
          >
            Designs
          </Link>
          <Link
            href="/contact"
            className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname === '/contact' ? 'text-wood-accent border-b-2 border-wood-accent pb-1' : 'text-wood-cream/70 hover:text-white pb-1'
            }`}
          >
            Contact
          </Link>
          <Link
            href="/admin"
            className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
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
              <span className="hidden md:inline">Logout ({adminName})</span>
              <span className="md:hidden">Logout</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
