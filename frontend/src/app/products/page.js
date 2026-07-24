"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Loader2, Layers, EyeOff, Search, X, Share2, Check, Copy, MessageCircle, Heart, Trash2 } from 'lucide-react';

const DEFAULT_CATEGORIES = ["Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", "Glass Windows", "Office", "Bathroom", "Puja Mandiralu", "Gummalu", "Dressing Tables"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState(["All", ...DEFAULT_CATEGORIES]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    // Read openLiked param from URL
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

    const waMessage = `🔔 Dream Designs Board / నచ్చిన డిజైన్ల జాబితా

Hello Nagaraju garu,

I liked these designs on your LD Interiors & Furnitures website. Can you please check their wood pricing/sizing?

${listText}

Thank you,
[Customer Name]`;

    const waUrl = `https://wa.me/916281653998?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, '_blank');
  };

  useEffect(() => {
    // 1. Instant Stale-While-Revalidate Cache Hydration (loads in 0.05s)
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

    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories')
        ]);

        let fetchedProducts = [];
        if (prodRes.status === 'fulfilled') {
          fetchedProducts = prodRes.value.data;
          setProducts(fetchedProducts);
          try {
            sessionStorage.setItem('ld_cached_products', JSON.stringify(fetchedProducts));
          } catch (e) {}
        } else if (initialProducts.length === 0) {
          setError('Could not connect to the API. Please make sure the backend is running.');
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

        // Read category query parameter from URL (e.g., ?category=Sofas)
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category') || 'All';
        
        // Find match in categories list (case-insensitive)
        const matchedCategory = fullCatList.find(
          c => c.toLowerCase() === catParam.toLowerCase()
        ) || 'All';

        setSelectedCategory(matchedCategory);

        if (matchedCategory !== "All") {
          setFilteredProducts(fetchedProducts.filter(
            p => p.category && p.category.toLowerCase() === matchedCategory.toLowerCase()
          ));
        } else {
          setFilteredProducts(fetchedProducts);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterProducts = (category, search) => {
    let filtered = products;

    if (category !== "All") {
      filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search.trim() !== "") {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterProducts(category, searchQuery);

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
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(selectedCategory, query);
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

        {/* Share Category Button */}
        {selectedCategory !== "All" && (
          <div className="mt-4 flex items-center justify-center gap-2 animate-fadeIn">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/80 hover:bg-wood-beige border border-wood-border/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-wood-accent shadow-sm transition-all duration-300 cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-wood-accent" />
              <span>Share {selectedCategory} Category</span>
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-10">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-wood-light/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search designs (e.g. bed, dining, modern...)"
            className="w-full rounded-full border border-wood-border/60 bg-white/70 backdrop-blur-md pl-11 pr-10 py-3 text-sm focus:border-wood-accent focus:ring-2 focus:ring-wood-accent/15 focus:outline-none transition-all text-wood-dark placeholder-wood-light/70 shadow-sm"
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
        </div>
      </div>

      {/* Filter Buttons & Dream Designs Quick Access */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12 border-b border-wood-border/30 pb-8 select-none">
        <button
          onClick={() => setShowLikedDrawer(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-all duration-300 cursor-pointer animate-pulse"
        >
          <Heart className="h-4 w-4 fill-white text-white" />
          <span>Dream Designs Board ({likedIds.length})</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4.5 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${
              selectedCategory === category
                ? 'bg-wood-dark text-white shadow-md'
                : 'bg-white/60 text-wood-light border border-wood-border/40 hover:bg-wood-beige hover:text-wood-dark'
            }`}
          >
            {category}
          </button>
        ))}
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
