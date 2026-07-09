"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Loader2, Layers, EyeOff, Search, X, Share2, Check, Copy, MessageCircle } from 'lucide-react';

const CATEGORIES = ["All", "Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", "Glass Windows", "Office", "Bathroom", "Puja Mandiralu", "Gummalu", "Dressing Tables"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);

        // Read category query parameter from URL (e.g., ?category=Sofas)
        const params = new URLSearchParams(window.location.search);
        const catParam = params.get('category') || 'All';
        
        // Find match in categories list (case-insensitive)
        const matchedCategory = CATEGORIES.find(
          c => c.toLowerCase() === catParam.toLowerCase()
        ) || 'All';

        setSelectedCategory(matchedCategory);

        if (matchedCategory !== "All") {
          setFilteredProducts(response.data.filter(
            p => p.category.toLowerCase() === matchedCategory.toLowerCase()
          ));
        } else {
          setFilteredProducts(response.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Could not connect to the API. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12 border-b border-wood-border/30 pb-8 select-none">
        {CATEGORIES.map((category) => (
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
    </div>
  );
}
