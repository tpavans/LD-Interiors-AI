"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Loader2, Layers, EyeOff, Search, X, Share2, Check, Copy, MessageCircle, Heart, Trash2, Sparkles, ChevronRight, Sliders, Home, Calendar, Video, Eye, ArrowUpDown, Filter, Flame, Zap } from 'lucide-react';
import { parseSearchQuery, filterAndRankProducts, QUICK_SEARCH_CHIPS } from '@/utils/searchEngine';
import CustomBuildStudio from '@/components/CustomBuildStudio';
import HomePackagesPlanner from '@/components/HomePackagesPlanner';
import WorkshopTourBookingModal from '@/components/WorkshopTourBookingModal';
import ARRoomViewerModal from '@/components/ARRoomViewerModal';
import CustomerInstallationsGallery from '@/components/CustomerInstallationsGallery';

const DEFAULT_CATEGORIES = ["Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", "Glass Windows", "Office", "Bathroom", "Puja Mandiralu", "Gummalu", "Dressing Tables"];

const FALLBACK_PRODUCTS = [
  {
    _id: "seed_door_1",
    title: "Hand-Carved Burma Teak Main Door",
    category: "Doors",
    price: 45000,
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted Grade-A Burma Teakwood entrance door with intricate traditional carvings."
  },
  {
    _id: "seed_bed_1",
    title: "Classic Teak Wood King-Size Canopy Bed",
    category: "Wooden Beds",
    price: 52000,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    description: "Royal Burma Teakwood king size bed with premium matte PU polish finish."
  },
  {
    _id: "seed_mandir_1",
    title: "Teak Wood Royal Temple Puja Mandir",
    category: "Puja Mandiralu",
    price: 38000,
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    description: "Traditional handcrafted puja mandiram made from pure teak wood with brass fittings."
  },
  {
    _id: "seed_sofa_1",
    title: "Chesterfield Teak Wood Tufted Sofa Set",
    category: "Sofas",
    price: 65000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
    description: "Handcrafted teakwood sofa set with premium leatherette cushioning."
  },
  {
    _id: "seed_dining_1",
    title: "6-Seater Royal Burma Teak Dining Table Set",
    category: "Dining Tables",
    price: 58000,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80",
    description: "Elegant 6-seater solid teakwood dining table with ergonomically carved chairs."
  }
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All", ...DEFAULT_CATEGORIES]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [activePriceFilter, setActivePriceFilter] = useState(null);
  const [activeQuickChip, setActiveQuickChip] = useState('🌟 All Designs');
  const [detectedFilters, setDetectedFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive Studio & Booking Modal States
  const [showBuildStudio, setShowBuildStudio] = useState(false);
  const [showPackagesPlanner, setShowPackagesPlanner] = useState(false);
  const [showWorkshopBooking, setShowWorkshopBooking] = useState(false);
  const [arProduct, setArProduct] = useState(null);

  // Sharing Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/products?category=${encodeURIComponent(selectedCategory)}` 
    : '';

  // Liked Designs Board States
  const [likedIds, setLikedIds] = useState([]);
  const [showLikedDrawer, setShowLikedDrawer] = useState(false);

  useEffect(() => {
    const updateLikedList = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
        setLikedIds(liked);
      } catch (err) {
        setLikedIds([]);
      }
    };
    updateLikedList();
    window.addEventListener('storage', updateLikedList);
    window.addEventListener('liked-updated', updateLikedList);
    const handleOpenDrawer = () => setShowLikedDrawer(true);
    window.addEventListener('open-liked-drawer', handleOpenDrawer);

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('openLiked') === 'true') {
        setShowLikedDrawer(true);
      }
    }

    return () => {
      window.removeEventListener('storage', updateLikedList);
      window.removeEventListener('liked-updated', updateLikedList);
      window.removeEventListener('open-liked-drawer', handleOpenDrawer);
    };
  }, []);

  const handleRemoveLiked = (id) => {
    try {
      const updated = likedIds.filter(item => item !== id);
      localStorage.setItem('ld_liked_designs', JSON.stringify(updated));
      setLikedIds(updated);
      window.dispatchEvent(new Event('liked-updated'));
    } catch (err) {
      console.error('Error removing liked design:', err);
    }
  };

  const handleShareLikedOnWhatsApp = () => {
    if (likedIds.length === 0) return;
    const likedProducts = products.filter(p => likedIds.includes(p._id));
    const listText = likedProducts.map((p, idx) => {
      const productUrl = `${window.location.origin}/products/${p._id}`;
      return `${idx + 1}. *${p.title}* (${p.category}) - ${p.price && p.price > 0 ? `₹${p.price.toLocaleString('en-IN')}` : 'Contact for price'}\n🔗 Link: ${productUrl}`;
    }).join('\n\n');

    const waMessage = `🔔 Dream Designs Board / నచ్చిన డిజైన్ల జాబితా\n\nHello Nagaraju garu,\n\nI liked these designs on your LD Interiors & Furnitures website. Can you please check their wood pricing/sizing?\n\n${listText}\n\nThank you,\n[Customer Name]`;
    const waUrl = `https://wa.me/916281653998?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
  };

  useEffect(() => {
    let initialProducts = [];
    try {
      const cachedProdStr = sessionStorage.getItem('ld_cached_products');
      const cachedCatStr = sessionStorage.getItem('ld_cached_categories');
      if (cachedProdStr) {
        initialProducts = JSON.parse(cachedProdStr);
        if (Array.isArray(initialProducts) && initialProducts.length > 5) {
          setProducts(initialProducts);
          setLoading(false);
        }
      }
      if (cachedCatStr) {
        const catList = JSON.parse(cachedCatStr);
        setCategories(["All", ...new Set(catList)]);
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }
  }, []);

  // Helper: Smart Fuzzy Category Synonym Match
  const isCategoryMatch = (productCat, selectedCat) => {
    if (!selectedCat || selectedCat === "All") return true;
    if (!productCat) return false;

    const pCat = productCat.toString().trim().toLowerCase();
    const sCat = selectedCat.toString().trim().toLowerCase();

    if (pCat === sCat) return true;
    if (pCat.includes(sCat) || sCat.includes(pCat)) return true;

    // Synonyms & Teakwood Category Mappings
    if ((sCat === 'gummalu' || sCat === 'doors') && (pCat === 'gummalu' || pCat === 'doors' || pCat.includes('door'))) return true;
    if ((sCat.includes('mandir') || sCat.includes('puja')) && (pCat.includes('mandir') || pCat.includes('puja') || pCat.includes('temple'))) return true;
    if ((sCat.includes('bed') || sCat.includes('bedroom')) && (pCat.includes('bed') || pCat.includes('cot') || pCat.includes('mattress'))) return true;
    if ((sCat.includes('sofa') || sCat.includes('living')) && (pCat.includes('sofa') || pCat.includes('living') || pCat.includes('couch'))) return true;
    if ((sCat.includes('table') || sCat.includes('dining')) && (pCat.includes('table') || pCat.includes('dining') || pCat.includes('chair'))) return true;

    return false;
  };

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      try {
        let fetchedProducts = [];
        let catList = DEFAULT_CATEGORIES;

        // Primary: Fetch via API client
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories')
        ]);

        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value?.data) && prodRes.value.data.length > 0) {
          fetchedProducts = prodRes.value.data;
        } else {
          // Robust Secondary Fallback: Direct unintercepted fetch
          try {
            const rawRes = await fetch('https://ld-interiors-ai.onrender.com/api/products');
            if (rawRes.ok) {
              const rawData = await rawRes.json();
              if (Array.isArray(rawData) && rawData.length > 0) {
                fetchedProducts = rawData;
              }
            }
          } catch (rawErr) {
            console.warn('Direct fetch fallback error:', rawErr.message);
          }
        }

        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.data) && catRes.value.data.length > 0) {
          catList = catRes.value.data.map(c => c.name);
        } else {
          try {
            const rawCatRes = await fetch('https://ld-interiors-ai.onrender.com/api/categories');
            if (rawCatRes.ok) {
              const rawCatData = await rawCatRes.json();
              if (Array.isArray(rawCatData) && rawCatData.length > 0) {
                catList = rawCatData.map(c => c.name);
              }
            }
          } catch (e) {}
        }

        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          setError(null);
          try {
            sessionStorage.setItem('ld_cached_products', JSON.stringify(fetchedProducts));
          } catch (e) {}
        } else {
          if (retryCount < 2) {
            setTimeout(() => fetchData(retryCount + 1), 1200);
            return;
          }
          setProducts(FALLBACK_PRODUCTS);
          setError(null);
        }

        const fullCatList = ["All", ...new Set([...catList])];
        setCategories(fullCatList);
        try {
          sessionStorage.setItem('ld_cached_categories', JSON.stringify(catList));
        } catch (e) {}

        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category') || 'All';
        const searchParam = params.get('search') || '';
        
        const matchedCategory = fullCatList.find(
          c => c.toLowerCase() === catParam.toLowerCase()
        ) || 'All';

        setSelectedCategory(matchedCategory);
        if (searchParam) {
          setSearchQuery(searchParam);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setProducts(FALLBACK_PRODUCTS);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Listen for search events from Main Navbar Search Bar
  useEffect(() => {
    const handleAppSearch = (e) => {
      if (typeof e.detail === 'string') {
        setSearchQuery(e.detail);
      }
    };
    window.addEventListener('app-search', handleAppSearch);

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('search');
      if (s !== null) {
        setSearchQuery(s);
      }
      const c = params.get('category');
      if (c) {
        setSelectedCategory(c);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('app-search', handleAppSearch);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Amazon-Grade Reactive Filter & Rank Engine
  useEffect(() => {
    const parsed = parseSearchQuery(searchQuery);

    const effectiveMinPrice = activePriceFilter?.minPrice !== undefined ? activePriceFilter.minPrice : parsed.minPrice;
    const effectiveMaxPrice = activePriceFilter?.maxPrice !== undefined ? activePriceFilter.maxPrice : parsed.maxPrice;

    const { results } = filterAndRankProducts(products, parsed, {
      activeCategory: selectedCategory,
      manualSort: sortOption,
      customMinPrice: effectiveMinPrice,
      customMaxPrice: effectiveMaxPrice
    });

    setFilteredProducts(results);
    setDetectedFilters(parsed.extractedFilters || []);
  }, [products, selectedCategory, searchQuery, sortOption, activePriceFilter]);

  const handleQuickChipClick = (chip) => {
    setActiveQuickChip(chip.label);
    if (chip.category) {
      setSelectedCategory(chip.category);
    }
    if (chip.maxPrice !== undefined) {
      setActivePriceFilter({ label: chip.label, maxPrice: chip.maxPrice, minPrice: null });
      setSearchQuery('');
    } else if (chip.filterType === 'latest') {
      setActivePriceFilter(null);
      setSearchQuery('latest models');
    } else if (chip.icon === 'all') {
      setSelectedCategory('All');
      setActivePriceFilter(null);
      setSearchQuery('');
    } else {
      setActivePriceFilter(null);
      setSearchQuery(chip.query);
    }
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setActivePriceFilter(null);
    setSortOption('relevance');
    setActiveQuickChip('🌟 All Designs');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      url.searchParams.delete('search');
      url.searchParams.delete('category');
      window.history.pushState({}, '', url);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    // Update URL query parameters dynamically without forcing page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location);
      if (category === "All") {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', category);
      }
      window.history.pushState({}, '', url);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `Check out our collection of premium *${selectedCategory}* designs from LD Interiors & Furnitures!\n\n👉 ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
          LD Gallery
        </span>
        <h1 className="font-serif text-3xl font-extrabold tracking-tight text-wood-dark sm:text-4xl mt-2">
          Design Portfolio
        </h1>
        <p className="mt-3 text-sm text-wood-medium font-light leading-relaxed">
          Filter our architectural and interior design showcases by room style. Discover modern craftsmanship and luxury aesthetics.
        </p>

        {/* High-Tech Interactive Feature Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 animate-fadeIn">
          <button
            onClick={() => setShowWorkshopBooking(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>📹 Book Live Workshop Tour</span>
          </button>

          {selectedCategory !== "All" && (
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-wood-beige border border-wood-border/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-wood-accent shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-wood-accent" />
              <span>Share {selectedCategory} Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Workshop Booking Modal */}
      {showWorkshopBooking && (
        <WorkshopTourBookingModal onClose={() => setShowWorkshopBooking(false)} />
      )}

      {/* AR & 3D Room Viewer Modal */}
      {arProduct && (
        <ARRoomViewerModal product={arProduct} onClose={() => setArProduct(null)} />
      )}

      {/* Amazon-Style Discovery Filter Chips & Active Filters */}
      <div className="max-w-4xl mx-auto mb-6 text-left px-2">
        {/* Amazon Quick-Filter Chips Row */}
        <div className="mt-3.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {QUICK_SEARCH_CHIPS.map((chip) => {
            const isActive = activeQuickChip === chip.label || (chip.icon === 'all' && !searchQuery && selectedCategory === 'All' && !activePriceFilter);
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleQuickChipClick(chip)}
                className={`px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer shadow-xs border ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-extrabold shadow-sm scale-105'
                    : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200 hover:border-amber-300'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {/* Active Smart Filters Pills Banner */}
        {(searchQuery || selectedCategory !== 'All' || activePriceFilter || detectedFilters.length > 0) && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="h-3 w-3 text-amber-500" />
              Active:
            </span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-900 border border-sky-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Keyword: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-0.5 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('All')} className="hover:text-red-500 ml-0.5 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}
            {activePriceFilter && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Price: {activePriceFilter.label}
                <button onClick={() => setActivePriceFilter(null)} className="hover:text-red-500 ml-0.5 cursor-pointer"><X className="h-3 w-3" /></button>
              </span>
            )}
            {detectedFilters.map((df, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-purple-50 text-purple-900 border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
                Smart: {df.label}
              </span>
            ))}
            <button
              onClick={handleClearAllFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 underline ml-auto cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Amazon-Style Results Bar with Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-2 border-b border-slate-200 pb-3 text-left">
        <div className="text-xs sm:text-sm font-semibold text-slate-700">
          Showing <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> of {products.length} Designs
          {searchQuery && <span className="text-slate-500"> for <span className="text-slate-900 font-bold">&quot;{searchQuery}&quot;</span></span>}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="product-sort" className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort:
          </label>
          <select
            id="product-sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-xs"
          >
            <option value="relevance">🎯 Best Match (Relevance)</option>
            <option value="price_asc">💰 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
            <option value="newest">🆕 Newest Arrivals (Latest Models)</option>
          </select>
        </div>
      </div>

      {/* Aligned Category Filter Pills */}
      <div className="w-full overflow-x-auto scrollbar-none mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-2 select-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
                selectedCategory === category
                  ? 'bg-[#008DDA] text-white ring-2 ring-[#008DDA]/40 scale-105'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Pinterest-Style Masonry Grid */}
      {loading ? (
        <div className="flex h-80 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-wood-light" />
            <p className="text-sm text-wood-light font-light animate-pulse">Loading modern layouts...</p>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-wood-border bg-wood-cream p-12 text-center max-w-lg mx-auto">
          <EyeOff className="mx-auto h-10 w-10 text-wood-light mb-4" />
          <h3 className="text-lg font-serif font-bold text-wood-dark">API Error</h3>
          <p className="mt-2 text-sm text-wood-light font-light">{error}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-amber-50/40 to-white p-8 sm:p-12 text-center max-w-xl mx-auto shadow-md">
          <Search className="mx-auto h-12 w-12 text-amber-500/70 mb-3" />
          <h3 className="text-lg font-serif font-bold text-slate-900">
            No exact designs match &quot;{searchQuery || selectedCategory}&quot;
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
            Try checking for typos, exploring broader keywords, or try our smart search filters below.
          </p>

          {/* Quick Fallback Filter Buttons */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button onClick={() => { setSearchQuery('under 1500'); setSelectedCategory('All'); }} className="px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-xs">
              💰 Items Under ₹1,500
            </button>
            <button onClick={() => { setSearchQuery('latest models'); setSelectedCategory('All'); }} className="px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-xs">
              ⚡ Latest Models
            </button>
            <button onClick={() => { setSearchQuery('doors'); setSelectedCategory('Gummalu'); }} className="px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-xs">
              🚪 Main Doors
            </button>
            <button onClick={() => { setSearchQuery('mandir'); setSelectedCategory('Puja Mandiralu'); }} className="px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl text-amber-900 font-bold hover:bg-amber-100 transition-colors cursor-pointer shadow-xs">
              🕉️ Puja Mandirams
            </button>
            <button onClick={handleClearAllFilters} className="px-3.5 py-1.5 text-xs bg-amber-400 text-slate-950 font-extrabold rounded-xl hover:bg-amber-500 transition-colors cursor-pointer shadow-sm">
              ✨ View All Designs
            </button>
          </div>

          {/* Popular Recommendations Below */}
          {products.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-4 flex items-center justify-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Popular Designs You Might Like
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                {products.slice(0, 6).map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="masonry-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Verified Customer Home Installations Showcase */}
      <CustomerInstallationsGallery />

      {/* Share Category Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowShareModal(false)}>
          <div className="w-full max-w-sm bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-6 shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <Share2 className="h-4 w-4 text-wood-accent" />
                Share {selectedCategory} Category
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Category Name</p>
              <p className="text-xs font-semibold text-wood-dark mt-0.5">{selectedCategory}</p>
            </div>

            <div className="space-y-3.5">
              {/* WhatsApp Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white py-2.5 text-xs font-bold tracking-wider uppercase transition-colors duration-300 cursor-pointer shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Share Category via WhatsApp
              </button>

              {/* Copy Link Row */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-grow rounded-xl border border-wood-border bg-white px-3 py-2 text-[10px] text-wood-medium font-mono focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-3.5 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer shrink-0 shadow-sm min-w-[75px]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <p className="text-[9px] text-wood-light font-light text-center mt-4">
              Sharing this link will automatically load the portfolio page filtered for only the "{selectedCategory}" designs!
            </p>
          </div>
        </div>
      )}

      {/* LIKED DESIGNS DRAWER PORTAL */}
      {showLikedDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn bg-black/50 backdrop-blur-xs" onClick={() => setShowLikedDrawer(false)}>
          <div 
            className="w-full max-w-md bg-wood-cream border-l border-wood-border/40 h-full flex flex-col shadow-2xl text-left animate-slideLeft animate-duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-wood-border/30 flex items-center justify-between bg-wood-beige/10">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-wood-dark">
                  Dream Designs / నచ్చిన డిజైన్లు
                </h3>
              </div>
              <button 
                onClick={() => setShowLikedDrawer(false)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {likedIds.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-wood-light py-16 px-4">
                  <div className="bg-red-50 p-4 rounded-full mb-3">
                    <Heart className="h-10 w-10 text-red-500 fill-red-200" />
                  </div>
                  <h4 className="text-base font-serif font-bold text-wood-dark">Dream Designs Board (నచ్చిన డిజైన్లు)</h4>
                  <p className="text-xs text-wood-light font-light mt-1 max-w-xs leading-relaxed">
                    Explore our handcrafted teak wood living rooms, bedrooms, kitchens, and doors. Tap the <strong className="text-red-500 font-bold">❤️ Heart icon</strong> on any design to save it here!
                  </p>
                  <button
                    onClick={() => setShowLikedDrawer(false)}
                    className="mt-6 px-6 py-2.5 bg-wood-dark text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-wood-accent transition-colors shadow-md cursor-pointer"
                  >
                    🎨 Explore All Designs & Tap ❤️
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-wood-medium font-light leading-relaxed">
                    These are your selected favorite designs. You can discuss this custom shortlist directly with Nagaraju on WhatsApp for a custom quotation!
                  </p>
                  <div className="divide-y divide-wood-border/20">
                    {products.filter(p => likedIds.includes(p._id)).map((prod) => (
                      <div key={prod._id} className="py-3 flex items-center gap-3.5 first:pt-0 last:pb-0">
                        <img 
                          src={prod.image} 
                          alt={prod.title} 
                          className="h-12 w-12 rounded-xl object-cover border border-wood-border/30"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-wood-dark truncate">{prod.title}</h4>
                          <span className="text-[9px] font-semibold text-wood-accent uppercase block mt-0.5">{prod.category}</span>
                          <span className="text-[10px] text-wood-light block mt-0.5 font-mono">
                            {prod.price && prod.price > 0 ? `₹${prod.price.toLocaleString('en-IN')}` : 'Contact for price'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveLiked(prod._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer animate-fadeIn"
                          title="Remove design"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {likedIds.length > 0 && (
              <div className="p-6 border-t border-wood-border/30 bg-wood-beige/10">
                <button
                  onClick={handleShareLikedOnWhatsApp}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer shadow-md"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                  <span>Discuss list on WhatsApp</span>
                </button>
                <p className="text-[9px] text-wood-light font-light text-center mt-2.5 leading-relaxed">
                  *This will format your favorite designs with links and open WhatsApp directly to Nagaraju.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
