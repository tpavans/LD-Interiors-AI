"use client";
import { useEffect, useState } from 'react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { Loader2, Layers, EyeOff, Search, X } from 'lucide-react';

const CATEGORIES = ["All", "Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", "Glass Windows", "Office", "Bathroom", "Devudi Mandiralu", "Gummalu"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
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
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterProducts(selectedCategory, query);
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
            className="w-full rounded-full border border-wood-border/60 bg-wood-cream/50 pl-11 pr-10 py-3 text-sm focus:border-wood-dark focus:outline-none transition-colors text-wood-dark placeholder-wood-light/70 shadow-sm"
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
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12 border-b border-wood-border/30 pb-8">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 cursor-pointer ${
              selectedCategory === category
                ? 'bg-wood-dark text-white shadow-sm'
                : 'bg-wood-cream text-wood-light border border-wood-border/40 hover:bg-wood-beige hover:text-wood-dark'
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
    </div>
  );
}
