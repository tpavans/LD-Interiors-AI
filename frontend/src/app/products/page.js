"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Loader2, Layers, EyeOff, Search, X, Share2, Check, Copy, MessageCircle, Heart, Trash2, Sparkles, ChevronRight, Sliders, Home, Calendar, Video, Eye } from 'lucide-react';
import CustomBuildStudio from '@/components/CustomBuildStudio';
import HomePackagesPlanner from '@/components/HomePackagesPlanner';
import WorkshopTourBookingModal from '@/components/WorkshopTourBookingModal';
import ARRoomViewerModal from '@/components/ARRoomViewerModal';

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
        setProducts(initialProducts);
        setLoading(false);
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
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories')
        ]);

        let fetchedProducts = [];
        if (prodRes.status === 'fulfilled' && Array.isArray(prodRes.value.data) && prodRes.value.data.length > 0) {
          fetchedProducts = prodRes.value.data;
          setProducts(fetchedProducts);
          setError(null);
          try {
            sessionStorage.setItem('ld_cached_products', JSON.stringify(fetchedProducts));
          } catch (e) {}
        } else {
          if (retryCount < 2) {
            setTimeout(() => fetchData(retryCount + 1), 1500);
            return;
          }
          // Fallback to initial seed products so page is NEVER broken
          setProducts(FALLBACK_PRODUCTS);
          setError(null);
        }

        let catList = DEFAULT_CATEGORIES;
        if (catRes.status === 'fulfilled' && Array.isArray(catRes.value.data)) {
          catList = catRes.value.data.map(c => c.name);
          try {
            sessionStorage.setItem('ld_cached_categories', JSON.stringify(catList));
          } catch (e) {}
        }

        const fullCatList = ["All", ...new Set([...catList])];
        setCategories(fullCatList);

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

  // Reactive auto-filtering effect when products, selectedCategory, or searchQuery updates
  useEffect(() => {
    let filtered = products.filter(p => isCategoryMatch(p.category, selectedCategory));

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

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
            onClick={() => setShowBuildStudio(prev => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#008DDA] hover:bg-[#0077B6] text-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>🛠️ Custom Wood Build Studio & Cft Calculator</span>
          </button>

          <button
            onClick={() => setShowPackagesPlanner(prev => !prev)}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-[10px] font-extrabold uppercase tracking-wider shadow-md transition-all duration-300 cursor-pointer"
          >
            <Home className="h-3.5 w-3.5 text-amber-400" />
            <span>🏡 Whole-Home Teak Packages</span>
          </button>

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

      {/* Conditionally Render Build Studio Inline Section */}
      {showBuildStudio && (
        <div className="mb-12">
          <CustomBuildStudio onClose={() => setShowBuildStudio(false)} />
        </div>
      )}

      {/* Conditionally Render Home Packages Planner Inline Section */}
      {showPackagesPlanner && (
        <div className="mb-12">
          <HomePackagesPlanner onClose={() => setShowPackagesPlanner(false)} />
        </div>
      )}

      {/* Workshop Booking Modal */}
      {showWorkshopBooking && (
        <WorkshopTourBookingModal onClose={() => setShowWorkshopBooking(false)} />
      )}

      {/* AR & 3D Room Viewer Modal */}
      {arProduct && (
        <ARRoomViewerModal product={arProduct} onClose={() => setArProduct(null)} />
      )}

      {/* Search Bar with Amazon/Flipkart Live Autocomplete Dropdown */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-wood-light/60 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search designs (e.g. bed, dining, doors...)"
            className="w-full rounded-full border border-wood-border/60 bg-white/90 backdrop-blur-md pl-11 pr-10 py-3 text-sm focus:border-[#008DDA] focus:ring-4 focus:ring-[#008DDA]/15 focus:outline-none transition-all text-wood-dark placeholder-wood-light/70 shadow-md font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                filterProducts(selectedCategory, "");
              }}
              className="absolute right-4 top-3.5 text-wood-light hover:text-wood-dark transition-colors cursor-pointer flex items-center justify-center"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}

          {/* Amazon / Flipkart Style Live Search Dropdown */}
          {isSearchFocused && searchQuery.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between px-3.5 py-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-sky-500" />
                  Matching Products ({products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())).length})
                </span>
                <span className="text-[9px] text-slate-500 font-medium">Click to view design</span>
              </div>

              {products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                <div className="p-1.5 divide-y divide-slate-100 max-h-80 overflow-y-auto">
                  {products.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6).map((item) => (
                    <div
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setIsSearchFocused(false);
                        window.location.href = `/products/${item._id}`;
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
                  <p className="text-xs text-slate-600 font-medium">No matching designs found for "{searchQuery}"</p>
                  <p className="text-[10px] text-slate-400 mt-1">Try searching for Doors, Beds, Puja Mandirams...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Aligned Category Filter Pills */}
      <div className="w-full overflow-x-auto scrollbar-none mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center justify-start sm:justify-center gap-2 min-w-max px-2 select-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-full transition-all duration-200 cursor-pointer shadow-sm ${
                selectedCategory === category
                  ? 'bg-[#008DDA] text-white ring-2 ring-[#008DDA]/40 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
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
        <div className="rounded-2xl border border-dashed border-wood-border p-12 text-center max-w-lg mx-auto">
          <Layers className="mx-auto h-10 w-10 text-wood-light mb-4" />
          <h3 className="text-lg font-serif font-bold text-wood-dark">No designs found</h3>
          <p className="mt-2 text-sm text-wood-light font-light">
            We don't have any uploads in the <strong className="font-semibold">"{selectedCategory}"</strong> category yet. Select another category or check back later!
          </p>
        </div>
      ) : (
        <div className="masonry-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

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
