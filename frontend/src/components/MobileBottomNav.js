"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, LayoutGrid, Film, ShoppingBag, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language] || translations['EN'];
  const isTelugu = language === 'TE';

  const [likedCount, setLikedCount] = useState(0);

  // Sync liked count from localStorage
  useEffect(() => {
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
      window.removeEventListener('liked-updated', updateLiked);
      window.removeEventListener('storage', updateLiked);
    };
  }, []);

  const navItems = [
    {
      id: 'home',
      label: t.home || 'Home',
      labelTe: 'హోమ్',
      href: '/',
      icon: Home
    },
    {
      id: 'gallery',
      label: t.designs || 'Gallery',
      labelTe: 'గ్యాలరీ',
      href: '/products',
      icon: LayoutGrid
    },
    {
      id: 'reels',
      label: t.reels || 'Reels',
      labelTe: 'రీల్స్',
      href: '/reels',
      icon: Film,
      badge: 'HOT'
    },
    {
      id: 'orders',
      label: t.orders || 'Orders',
      labelTe: 'ఆర్డర్లు',
      href: '/orders',
      icon: ShoppingBag
    },
    {
      id: 'liked',
      label: isTelugu ? 'డ్రీమ్స్' : 'Dreams',
      labelTe: 'డ్రీమ్స్',
      href: '/products?openLiked=true',
      icon: Heart,
      badgeCount: likedCount,
      isAction: true
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#160b05]/98 border-t-2 border-amber-500/40 backdrop-blur-xl px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] select-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.id !== 'liked';

          if (item.isAction) {
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (pathname === '/products') {
                    window.dispatchEvent(new Event('open-liked-drawer'));
                  } else {
                    router.push('/products?openLiked=true');
                  }
                }}
                className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-300 cursor-pointer text-red-400 hover:text-red-300"
              >
                <div className="relative">
                  <Icon className="h-5 w-5 fill-red-500 text-red-500" />
                  {item.badgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-black text-white ring-1 ring-black">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold tracking-wider mt-0.5 uppercase">
                  {isTelugu ? item.labelTe : item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'text-amber-300 font-extrabold bg-amber-500/20 border border-amber-400/40 shadow-inner scale-105'
                  : 'text-amber-100/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'text-amber-300 animate-pulse' : 'text-amber-200/80'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 text-[7px] font-black bg-gradient-to-r from-red-600 to-amber-500 text-white rounded-full uppercase tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] tracking-wider mt-0.5 uppercase ${isActive ? 'font-black text-amber-300' : 'font-semibold'}`}>
                {isTelugu ? item.labelTe : item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
