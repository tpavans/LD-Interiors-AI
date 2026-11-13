"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  X, Home, Armchair, Film, ShoppingBag, Heart, BookOpen, 
  Download, Share2, Settings, Filter, ChevronRight, ChevronDown, 
  Sun, Moon, Globe, MessageCircle, Phone, HelpCircle, 
  Compass, LayoutGrid, BedDouble, Utensils, AppWindow, Sparkles
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

// Custom Authentic Indian Temple Icon (Puja Mandir)
function MandirIcon({ className = "h-5 w-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 2v2.5" />
      <circle cx="12" cy="4.5" r="0.8" fill="currentColor" />
      <path d="M8 8.5c1.2-2 2.5-3.5 4-4 1.5.5 2.8 2 4 4" />
      <path d="M6 9h12" />
      <path d="M7 9v11" />
      <path d="M17 9v11" />
      <path d="M10 13a2 2 0 0 1 4 0v7h-4v-7z" />
      <path d="M4 20h16" />
      <path d="M3 22h18" />
    </svg>
  );
}

// Custom Teakwood Entrance Door Icon
function DoorIcon({ className = "h-5 w-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <path d="M7 7h2v3H7z" fill="currentColor" fillOpacity="0.2" />
      <path d="M15 7h2v3h-2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M7 14h2v4H7z" fill="currentColor" fillOpacity="0.2" />
      <path d="M15 14h2v4h-2z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

// Custom Traditional Teak Swing / Jhula Icon
function SwingIcon({ className = "h-5 w-5" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="3" y1="3" x2="21" y2="3" strokeWidth="2.5" />
      <line x1="7" y1="3" x2="7" y2="15" />
      <line x1="17" y1="3" x2="17" y2="15" />
      <rect x="5" y="15" width="14" height="4" rx="1" fill="currentColor" fillOpacity="0.2" />
      <line x1="5" y1="19" x2="5" y2="21" />
      <line x1="19" y1="19" x2="19" y2="21" />
    </svg>
  );
}

// Comprehensive Category & Subcategory Catalog
const FURNITURE_CATEGORIES = [
  {
    id: 'doors',
    name: 'Teakwood Doors',
    nameTe: 'టేకు గుమ్మాలు',
    subCount: '50+ Designs',
    icon: DoorIcon,
    categoryParam: 'Gummalu',
    href: '/products?category=Gummalu',
    subcategories: [
      {
        name: 'Main Entrance Doors',
        nameTe: 'ప్రధాన సింహద్వారం',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Gummalu&search=Main%20Door',
        search: 'Main Door'
      },
      {
        name: 'Double Doors (Simhadwaram)',
        nameTe: 'డబుల్ డోర్స్ సింహద్వారం',
        image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Gummalu&search=Double%20Doors',
        search: 'Double Doors'
      },
      {
        name: 'Pooja Room Doors',
        nameTe: 'పూజా గది గుమ్మాలు',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Gummalu&search=Pooja%20Door',
        search: 'Pooja Door'
      },
      {
        name: 'CNC Carved Teak Doors',
        nameTe: 'చెక్కడాల టేకు డోర్లు',
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Gummalu&search=Carved%20Door',
        search: 'Carved Door'
      }
    ]
  },
  {
    id: 'puja-mandir',
    name: 'Puja Mandir',
    nameTe: 'పూజ మందిరం',
    subCount: '40+ Designs',
    icon: MandirIcon,
    categoryParam: 'Puja Mandiralu',
    href: '/products?category=Puja%20Mandiralu',
    subcategories: [
      {
        name: 'Wooden Mandir',
        nameTe: 'వుడెన్ టెంపుల్ మందిరం',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Puja%20Mandiralu&search=Wooden%20Mandir',
        search: 'Wooden Mandir'
      },
      {
        name: 'Carved Mandir',
        nameTe: 'సాంప్రదాయ కార్వింగ్ మందిరం',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Puja%20Mandiralu&search=Carved%20Mandir',
        search: 'Carved Mandir'
      },
      {
        name: 'Modern Mandir',
        nameTe: 'మోడరన్ లైటింగ్ మందిరం',
        image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Puja%20Mandiralu&search=Modern%20Mandir',
        search: 'Modern Mandir'
      },
      {
        name: 'Wall Mounted Mandir',
        nameTe: 'వాల్ మౌంటెడ్ మందిరం',
        image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Puja%20Mandiralu&search=Wall%20Mounted%20Mandir',
        search: 'Wall Mounted Mandir'
      }
    ]
  },
  {
    id: 'beds',
    name: 'Wooden Beds',
    nameTe: 'టేకువుడ్ బెడ్స్',
    subCount: '60+ Designs',
    icon: BedDouble,
    categoryParam: 'Wooden Beds',
    href: '/products?category=Wooden%20Beds',
    subcategories: [
      {
        name: 'King Size Teak Beds',
        nameTe: 'కింగ్ సైజ్ టేకు మంచాలు',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Beds&search=King%20Size',
        search: 'King Size'
      },
      {
        name: 'Queen Size Beds',
        nameTe: 'క్వీన్ సైజ్ బెడ్స్',
        image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Beds&search=Queen%20Size',
        search: 'Queen Size'
      },
      {
        name: 'Hydraulic Storage Beds',
        nameTe: 'హైడ్రాలిక్ స్టోరేజ్ బెడ్స్',
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Beds&search=Storage%20Bed',
        search: 'Storage Bed'
      },
      {
        name: 'Royal Canopy & Poster Beds',
        nameTe: 'రాయల్ కానోపీ మంచాలు',
        image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Beds&search=Canopy',
        search: 'Canopy'
      }
    ]
  },
  {
    id: 'sofas',
    name: 'Living Room Sofas',
    nameTe: 'లివింగ్ రూమ్ సోఫాలు',
    subCount: '35+ Designs',
    icon: Armchair,
    categoryParam: 'Sofas',
    href: '/products?category=Sofas',
    subcategories: [
      {
        name: 'Wooden Carved Sofas',
        nameTe: 'కార్వింగ్ టేకు సోఫా సెట్',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Sofas&search=Carved%20Sofa',
        search: 'Carved Sofa'
      },
      {
        name: 'L-Shape Sectional Sofas',
        nameTe: 'ఎల్-షేప్ సెక్షనల్ సోఫా',
        image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Sofas&search=L%20Shape',
        search: 'L Shape'
      },
      {
        name: 'Chesterfield Teak Sets',
        nameTe: 'చెస్టర్‌ఫీల్డ్ టేకు సెట్స్',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Sofas&search=Chesterfield',
        search: 'Chesterfield'
      },
      {
        name: 'Teakwood Diwans & Daybeds',
        nameTe: 'దివాన్ & డేబెడ్స్',
        image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Sofas&search=Diwan',
        search: 'Diwan'
      }
    ]
  },
  {
    id: 'dining',
    name: 'Dining Tables',
    nameTe: 'డైనింగ్ టేబుల్స్',
    subCount: '25+ Designs',
    icon: Utensils,
    categoryParam: 'Dining Tables',
    href: '/products?category=Dining%20Tables',
    subcategories: [
      {
        name: '6-Seater Teak Dining',
        nameTe: '6-సీటర్ టేకు డైనింగ్',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Dining%20Tables&search=6%20Seater',
        search: '6 Seater'
      },
      {
        name: '8-Seater Royal Dining',
        nameTe: '8-సీటర్ రాయల్ డైనింగ్',
        image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Dining%20Tables&search=8%20Seater',
        search: '8 Seater'
      },
      {
        name: 'Marble Top Teak Dining',
        nameTe: 'మార్బుల్ టాప్ డైనింగ్ టేబుల్',
        image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Dining%20Tables&search=Marble',
        search: 'Marble'
      },
      {
        name: 'Teak Dining Chairs & Benches',
        nameTe: 'డైనింగ్ చైర్స్ & బెంచీలు',
        image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Dining%20Tables&search=Chairs',
        search: 'Chairs'
      }
    ]
  },
  {
    id: 'swings',
    name: 'Uyyala Swings',
    nameTe: 'ఉయ్యాలలు',
    subCount: '20+ Designs',
    icon: SwingIcon,
    categoryParam: 'Uyyala Swings',
    href: '/products?category=Uyyala%20Swings',
    subcategories: [
      {
        name: 'Ceiling Hanging Swings',
        nameTe: 'సీలింగ్ హ్యాంగింగ్ ఉయ్యాల',
        image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Uyyala%20Swings&search=Ceiling',
        search: 'Ceiling'
      },
      {
        name: 'Stand & Frame Teak Swings',
        nameTe: 'స్టాండ్ & ఫ్రేమ్ ఉయ్యాల',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Uyyala%20Swings&search=Stand',
        search: 'Stand'
      },
      {
        name: 'Brass Chain Teak Swings',
        nameTe: 'ఇత్తడి గొలుసు ఉయ్యాల',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Uyyala%20Swings&search=Brass%20Chain',
        search: 'Brass Chain'
      },
      {
        name: 'Traditional Carved Jhula',
        nameTe: 'రాయల్ కార్వింగ్ జూలా',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Uyyala%20Swings&search=Traditional',
        search: 'Traditional'
      }
    ]
  },
  {
    id: 'windows',
    name: 'Teak Windows',
    nameTe: 'టేకువుడ్ కిటికీలు',
    subCount: '30+ Designs',
    icon: AppWindow,
    categoryParam: 'Wooden Windows',
    href: '/products?category=Wooden%20Windows',
    subcategories: [
      {
        name: 'Glass Teak Windows',
        nameTe: 'గ్లాస్ టేకువుడ్ కిటికీలు',
        image: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Windows&search=Glass',
        search: 'Glass'
      },
      {
        name: 'Stainless Mesh Windows',
        nameTe: 'స్టెయిన్‌లెస్ మెష్ కిటికీలు',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Mesh%20Doors&search=Mesh',
        search: 'Mesh'
      },
      {
        name: 'Traditional Teak Ventilators',
        nameTe: 'సాంప్రదాయ వెంటిలేటర్స్',
        image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Windows&search=Ventilator',
        search: 'Ventilator'
      },
      {
        name: 'Sliding Teakwood Windows',
        nameTe: 'స్లైడింగ్ టేకువుడ్ కిటికీలు',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Wooden%20Windows&search=Sliding',
        search: 'Sliding'
      }
    ]
  },
  {
    id: 'custom-interiors',
    name: 'Custom Interiors',
    nameTe: 'ఇంటీరియర్ పనులు',
    subCount: 'Full Setup',
    icon: Settings,
    categoryParam: 'All',
    href: '/contact',
    subcategories: [
      {
        name: 'Teakwood TV Units',
        nameTe: 'టేకువుడ్ టీవీ యూనిట్స్',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=TV%20Units',
        search: 'TV Unit'
      },
      {
        name: 'Modular Teak Kitchens',
        nameTe: 'మాడ్యులర్ టేకు కిచెన్',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Kitchen',
        search: 'Kitchen'
      },
      {
        name: 'Teak Wardrobes & Dressing',
        nameTe: 'వార్డ్‌రోబ్స్ & డ్రెస్సింగ్',
        image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=160&q=80',
        href: '/products?category=Dressing%20Tables',
        search: 'Wardrobe'
      },
      {
        name: 'Complete House Woodwork',
        nameTe: 'ఇంటి మొత్తం వుడ్‌వర్క్',
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=160&q=80',
        href: '/contact',
        search: ''
      }
    ]
  }
];

export default function SidebarDrawer({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isTelugu = language === 'TE';

  // State management
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' (Image 2) or 'nav' (Image 1)
  const [expandedCategory, setExpandedCategory] = useState('puja-mandir'); // Puja Mandir expanded by default as requested
  const [selectedWoodFilter, setSelectedWoodFilter] = useState('All');

  // Prevent background body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle accordion expansion
  const toggleAccordion = (categoryId) => {
    setExpandedCategory(prev => prev === categoryId ? null : categoryId);
  };

  // Handle Subcategory Click
  const handleSubcategoryClick = (sub) => {
    onClose();
    if (typeof window !== 'undefined' && sub.search) {
      window.dispatchEvent(new CustomEvent('app-search', { detail: sub.search }));
    }
    router.push(sub.href);
  };

  // Handle Quick Filter Chip Click
  const handleFilterClick = (filterName) => {
    setSelectedWoodFilter(filterName);
    onClose();
    const query = filterName === 'All' ? '' : filterName;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-search', { detail: query }));
    }
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-[120] flex font-sans">
      {/* Dark Overlay Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity duration-300 animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Slide-out Sidebar Drawer Card */}
      <div className="relative w-full max-w-[340px] sm:max-w-sm bg-[#071A33] text-white h-full flex flex-col shadow-2xl border-r border-[#D6A04B]/30 z-[130] animate-slideRight overflow-hidden">
        
        {/* Subtle Decorative Botanical Leaf Ornament on Upper-Right */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none opacity-15 overflow-hidden z-0 select-none">
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-[#D6A04B]">
            <path d="M180 10C140 30 110 80 120 130C130 170 170 190 190 200" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M140 50C110 40 90 20 85 5C105 20 125 35 140 50Z" fill="currentColor"/>
            <path d="M125 80C95 75 75 60 70 45C90 60 110 70 125 80Z" fill="currentColor"/>
            <path d="M120 115C90 115 70 105 60 90C80 105 100 112 120 115Z" fill="currentColor"/>
            <path d="M130 145C105 155 85 150 75 140C95 145 115 145 130 145Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Top Pinned Header */}
        <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-4.5 border-b border-[#D6A04B]/30 flex items-center justify-between bg-[#051326] shrink-0">
          <div className="flex items-center gap-3">
            {/* Gold Monogram Badge */}
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F5E6C8] to-[#D6A04B] p-0.5 shadow-md shrink-0 flex items-center justify-center">
              <div className="h-full w-full rounded-full bg-[#071A33] flex flex-col items-center justify-center border border-[#D6A04B]/40">
                <span className="font-serif font-black text-xs text-[#F5E6C8] leading-none">LD</span>
                <span className="text-[5.5px] font-bold text-[#D6A04B] uppercase tracking-tighter">Interiors</span>
              </div>
            </div>
            <div>
              <h3 className="font-serif font-black text-sm text-[#F5E6C8] tracking-wider uppercase leading-tight">
                LD INTERIORS
              </h3>
              <p className="text-[8.5px] text-[#D6A04B] font-bold tracking-widest uppercase">
                {isTelugu ? "హ్యాండ్‌క్రాఫ్టెడ్ టేకువుడ్" : "HANDCRAFTED TEAKWOOD"}
              </p>
            </div>
          </div>

          {/* Close 'X' Button in Rounded Box */}
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#0B1E3B] border border-[#D6A04B]/30 text-[#F5E6C8] hover:text-white hover:bg-red-600/80 hover:border-red-500 transition-all cursor-pointer shadow-sm"
            title="Close Menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Mode Navigation Switcher Tabs (Quick Nav vs Categories & Mandir) */}
        <div className="relative z-10 px-3 pt-2.5 pb-1 bg-[#051326]/60 shrink-0">
          <div className="flex p-1 bg-[#0B1E3B] rounded-xl border border-[#D6A04B]/30 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-gradient-to-r from-[#F5E6C8] to-[#E8D1A7] text-[#071A33] shadow-md font-black'
                  : 'text-[#D6A04B]/90 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{isTelugu ? "కేటగిరీలు & మందిరం" : "Categories & Mandir"}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nav')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'nav'
                  ? 'bg-gradient-to-r from-[#F5E6C8] to-[#E8D1A7] text-[#071A33] shadow-md font-black'
                  : 'text-[#D6A04B]/90 hover:text-white'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{isTelugu ? "మెయిన్ నేవిగేషన్" : "Quick Nav"}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Middle Content Body */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4 scrollbar-thin text-left overscroll-contain">

          {/* Quick Design Filters Pill Bar (Always visible across both views) */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Filter className="h-3.5 w-3.5 text-[#D6A04B]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B]">
                {isTelugu ? "డిజైన్ ఫిల్టర్స్" : "QUICK DESIGN FILTERS"}
              </span>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D6A04B]/40 to-transparent" />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {[
                { label: 'All', icon: '' },
                { label: 'Burma Teak', icon: '🍂' },
                { label: 'Rosewood', icon: '🎯' },
                { label: 'PU Polish', icon: '💎' },
                { label: 'Carving', icon: '🎨' }
              ].map((chip) => {
                const isActive = selectedWoodFilter === chip.label;
                return (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleFilterClick(chip.label)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-xs border ${
                      isActive
                        ? 'bg-[#F5E6C8] text-[#071A33] border-[#F5E6C8] font-black shadow-sm scale-105'
                        : 'bg-[#0C223F] hover:bg-[#0F294D] text-[#F5E6C8] border-[#D6A04B]/30 hover:border-[#D6A04B]'
                    }`}
                  >
                    {chip.icon && <span className="mr-1">{chip.icon}</span>}
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIEW A: POPULAR CATEGORIES & EXPANDABLE ACCORDIONS (Reference Image 2) */}
          {activeTab === 'categories' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1 px-1">
                <LayoutGrid className="h-3.5 w-3.5 text-[#D6A04B]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B]">
                  {isTelugu ? "పాపులర్ కేటగిరీలు & డిజైన్స్" : "POPULAR CATEGORIES & DESIGNS"}
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D6A04B]/40 to-transparent" />
              </div>

              <div className="space-y-2">
                {FURNITURE_CATEGORIES.map((cat) => {
                  const isExpanded = expandedCategory === cat.id;
                  const IconComponent = cat.icon;

                  return (
                    <div 
                      key={cat.id} 
                      className="rounded-2xl overflow-hidden border border-[#D6A04B]/30 transition-all duration-300 shadow-md"
                    >
                      {/* Main Category Header Button */}
                      <button
                        type="button"
                        onClick={() => toggleAccordion(cat.id)}
                        aria-expanded={isExpanded}
                        className={`w-full flex items-center justify-between p-3 transition-all duration-200 cursor-pointer ${
                          isExpanded
                            ? 'bg-[#F5E6C8] text-[#071A33] shadow-sm'
                            : 'bg-[#0C223F] hover:bg-[#0F294D] text-[#F5E6C8]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl transition-colors ${
                            isExpanded ? 'bg-[#A64B24]/15 text-[#071A33]' : 'bg-[#071A33] text-[#D6A04B] border border-[#D6A04B]/30'
                          }`}>
                            <IconComponent className="h-5 w-5 shrink-0" />
                          </div>
                          <div className="text-left">
                            <span className={`block font-serif text-xs sm:text-sm font-bold ${
                              isExpanded ? 'text-[#071A33] font-black' : 'text-[#F5E6C8]'
                            }`}>
                              {isTelugu ? cat.nameTe : cat.name}
                            </span>
                            <span className={`block text-[9.5px] font-mono ${
                              isExpanded ? 'text-[#A64B24] font-bold' : 'text-[#D6A04B]/80 font-medium'
                            }`}>
                              {cat.subCount}
                            </span>
                          </div>
                        </div>

                        {/* Animated Rotating Chevron */}
                        <div className={`p-1.5 rounded-full transition-transform duration-300 ${
                          isExpanded ? 'rotate-90 text-[#071A33]' : 'rotate-0 text-[#D6A04B]'
                        }`}>
                          <ChevronRight className="h-4 w-4" />
                        </div>
                      </button>

                      {/* Expandable Subcategories Accordion Container */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="bg-gradient-to-b from-[#2B170E] via-[#221109] to-[#180C06] border-t border-[#D6A04B]/40 p-2 sm:p-2.5 space-y-1.5">
                          {cat.subcategories.map((sub, sIdx) => (
                            <div
                              key={sIdx}
                              onClick={() => handleSubcategoryClick(sub)}
                              className="flex items-center justify-between p-2 rounded-xl bg-black/25 hover:bg-[#A64B24]/30 border border-white/5 hover:border-[#D6A04B]/50 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5">
                                {/* Subcategory Photo Thumbnail */}
                                <img
                                  src={sub.image}
                                  alt={sub.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=160&q=80";
                                  }}
                                  className="w-10 h-10 rounded-lg object-cover border border-[#D6A04B]/50 shadow-sm shrink-0"
                                />
                                <div className="text-left">
                                  <span className="text-xs font-semibold text-[#F5E6C8] group-hover:text-white transition-colors block">
                                    {isTelugu ? sub.nameTe : sub.name}
                                  </span>
                                  <span className="text-[9px] text-[#D6A04B]/80 font-mono block">
                                    {isTelugu ? "డిజైన్లు చూడండి" : "View Designs"}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-[#D6A04B]/70 group-hover:text-[#F5E6C8] group-hover:translate-x-0.5 transition-all shrink-0" />
                            </div>
                          ))}

                          {/* Quick Link to View Entire Category */}
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              router.push(cat.href);
                            }}
                            className="w-full text-center py-2 text-[10.5px] font-bold text-[#D6A04B] hover:text-[#F5E6C8] hover:underline cursor-pointer pt-2 flex items-center justify-center gap-1"
                          >
                            <span>{isTelugu ? `మొత్తం ${cat.nameTe} డిజైన్లు చూడండి` : `Browse All ${cat.name} (${cat.subCount})`}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Shortcut to switch to Quick Nav */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('nav')}
                  className="text-[11px] font-bold text-[#D6A04B] hover:text-[#F5E6C8] underline cursor-pointer"
                >
                  {isTelugu ? "🧭 మెయిన్ నేవిగేషన్ మెనూ చూడండి" : "🧭 View Quick Navigation Links & Mobile App"}
                </button>
              </div>
            </div>
          )}

          {/* VIEW B: QUICK NAVIGATION & MOBILE APP (Reference Image 1) */}
          {activeTab === 'nav' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2 mb-1 px-1">
                <Compass className="h-3.5 w-3.5 text-[#D6A04B]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#D6A04B]">
                  {isTelugu ? "నేవిగేషన్ మెనూ" : "QUICK NAVIGATION"}
                </span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D6A04B]/40 to-transparent" />
              </div>

              {/* Main Rounded Navigation Cards */}
              <div className="space-y-1.5">
                {[
                  { href: '/', name: 'Home', nameTe: 'హోమ్ పేజీ', icon: Home, isHome: true },
                  { href: '/products', name: 'All Furniture Designs', nameTe: '500+ ఫర్నిచర్ డిజైన్లు', icon: Armchair },
                  { href: '/reels', name: 'Workshop Reels & Shorts', nameTe: 'వర్క్‌షాప్ రీల్స్ & వీడియోస్', icon: Film },
                  { href: '/orders', name: 'My Orders & Tracking', nameTe: 'నా ఆర్డర్లు & ట్రాకింగ్', icon: ShoppingBag },
                  { href: '/wishlist', name: 'My Wishlist Designs', nameTe: 'నా విష్‌లిస్ట్ డిజైన్స్', icon: Heart },
                  { href: '/wood-guide', name: 'Burma Teakwood Guide', nameTe: 'బర్మా టేకువుడ్ గైడ్', icon: BookOpen }
                ].map((item, idx) => {
                  const isItemActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl transition-all duration-200 border cursor-pointer ${
                        isItemActive
                          ? 'bg-[#F5E6C8] text-[#071A33] border-[#F5E6C8] font-black shadow-md'
                          : 'bg-[#0C223F] hover:bg-[#0F294D] text-[#F5E6C8] border-[#D6A04B]/20 hover:border-[#D6A04B]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4.5 w-4.5 shrink-0 ${isItemActive ? 'text-[#071A33]' : 'text-[#D6A04B]'}`} />
                        <span className="text-xs sm:text-sm font-bold">
                          {isTelugu ? item.nameTe : item.name}
                        </span>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${isItemActive ? 'text-[#071A33]' : 'text-[#D6A04B]/60'}`} />
                    </Link>
                  );
                })}
              </div>

              {/* App Action Cards (Burnt Sienna + Cream + Dark) */}
              <div className="space-y-1.5 pt-1">
                {/* 1. Install Mobile App (Burnt Sienna #A64B24) */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event('open-install-app'));
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-gradient-to-r from-[#A64B24] to-[#7B3215] border border-[#D6A04B]/40 text-[#F5E6C8] hover:brightness-110 transition-all cursor-pointer shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Download className="h-4.5 w-4.5 shrink-0 text-[#F5E6C8]" />
                    <span className="text-xs sm:text-sm font-bold">
                      {isTelugu ? "యాప్ ఇన్‌స్టాల్ చేసుకోండి" : "Install Mobile App"}
                    </span>
                  </div>
                  <span className="bg-[#F5E6C8] text-[#071A33] text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    APP
                  </span>
                </button>

                {/* 2. Share Mobile App (Cream #F5E6C8) */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event('open-share-app'));
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#F5E6C8] border border-[#D6A04B]/40 text-[#071A33] hover:brightness-105 transition-all cursor-pointer shadow-md font-bold"
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="h-4.5 w-4.5 shrink-0 text-[#071A33]" />
                    <span className="text-xs sm:text-sm font-black">
                      {isTelugu ? "యాప్‌ను షేర్ చేయండి" : "Share Mobile App"}
                    </span>
                  </div>
                  <span className="bg-[#071A33] text-[#F5E6C8] text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    SHARE
                  </span>
                </button>

                {/* 3. Settings & Updates (Dark Navy) */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.dispatchEvent(new Event('open-settings-modal'));
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl bg-[#0C223F] hover:bg-[#0F294D] border border-[#D6A04B]/30 text-[#F5E6C8] transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Settings className="h-4.5 w-4.5 shrink-0 text-[#D6A04B]" />
                    <span className="text-xs sm:text-sm font-bold">
                      {isTelugu ? "సెట్టింగ్స్ & అప్‌డేట్స్" : "Settings & Updates"}
                    </span>
                  </div>
                  <span className="border border-[#D6A04B]/60 text-[#D6A04B] bg-[#071A33] text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md">
                    v2.4.1
                  </span>
                </button>
              </div>

              {/* Support & Contact Links */}
              <div className="pt-2 border-t border-[#D6A04B]/20 space-y-1">
                <Link 
                  href="/contact" 
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5E6C8]/80 hover:bg-white/5 hover:text-[#F5E6C8] transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#D6A04B] shrink-0" />
                  <span>{isTelugu ? "వర్క్‌షాప్ కాంటాక్ట్" : "Contact Workshop"}</span>
                </Link>
                <Link 
                  href="/support" 
                  onClick={onClose}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#F5E6C8]/80 hover:bg-white/5 hover:text-[#F5E6C8] transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-[#D6A04B] shrink-0" />
                  <span>{isTelugu ? "సపోర్ట్ & సహాయం" : "Customer Support & FAQs"}</span>
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Pinned Bottom Controls (Fixed Theme, Language & WhatsApp) */}
        <div className="relative z-10 shrink-0 p-3 sm:p-3.5 bg-[#051326] border-t border-[#D6A04B]/30 space-y-2 shadow-2xl">
          
          {/* 1. Theme Toggle Card */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-full py-2.5 px-3.5 rounded-xl border border-[#D6A04B]/30 bg-[#0C223F] hover:bg-[#0F294D] text-white flex items-center justify-between text-xs transition-all cursor-pointer shadow-sm group"
          >
            <span className="flex items-center gap-2 font-medium text-[#F5E6C8]">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4 text-[#D6A04B] shrink-0" />
              ) : (
                <Sun className="h-4 w-4 text-[#D6A04B] shrink-0" />
              )}
              <span>
                {theme === 'dark' 
                  ? (isTelugu ? "డార్క్ మోడ్ యాక్టివ్" : "Dark Theme Active")
                  : (isTelugu ? "లైట్ మోడ్ యాక్టివ్" : "Light Theme Active")}
              </span>
            </span>
            <span className="text-[#D6A04B]/40 font-light">|</span>
            <span className="text-[#D6A04B] group-hover:text-[#F5E6C8] font-bold text-[10px] tracking-wider uppercase flex items-center gap-1 transition-colors">
              <span>
                {theme === 'dark' 
                  ? (isTelugu ? 'లైట్‌కి మార్చు' : 'SWITCH TO LIGHT') 
                  : (isTelugu ? 'డార్క్‌కి మార్చు' : 'SWITCH TO DARK')}
              </span>
              <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            </span>
          </button>

          {/* 2. Language Selector Card */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="w-full py-2.5 px-3.5 rounded-xl border border-[#D6A04B]/30 bg-[#0C223F] hover:bg-[#0F294D] text-white flex items-center justify-between text-xs transition-all cursor-pointer shadow-sm group"
          >
            <span className="flex items-center gap-2 font-medium text-[#F5E6C8]">
              <Globe className="h-4 w-4 text-[#D6A04B] shrink-0" />
              <span>{isTelugu ? "భాష: తెలుగు" : "Language: English"}</span>
            </span>
            <span className="text-[#D6A04B] group-hover:text-[#F5E6C8] font-bold text-[11px] flex items-center gap-1 transition-colors">
              <span>{isTelugu ? "Switch to English" : "తెలుగులో చూడండి"}</span>
              <ChevronRight className="h-3 w-3" />
            </span>
          </button>

          {/* 3. WhatsApp Direct Contact Button */}
          <a
            href="https://wa.me/916281653998?text=Hi%20Nagaraju%20garu,%20I%20visited%20LD%20Interiors%20website%20and%20want%20to%20inquire%20about%20handcrafted%20furniture."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 sm:py-3 px-4 rounded-full bg-gradient-to-r from-[#F5E6C8] via-[#E8D1A7] to-[#D6A04B] hover:brightness-105 active:scale-[0.98] text-[#071A33] font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-black/50 transition-all cursor-pointer"
          >
            <MessageCircle className="h-4.5 w-4.5 fill-[#071A33] text-[#F5E6C8] shrink-0" />
            <span>{isTelugu ? "వాట్సాప్‌లో చాట్ చేయండి" : "WhatsApp Nagaraju Garu"}</span>
          </a>

        </div>

      </div>
    </div>
  );
}
