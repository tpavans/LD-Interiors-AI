"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Loader2, Compass, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/products');
        // Slice the latest 3 items
        setFeatured(response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Could not connect to the backend server. Please verify the API endpoint is available.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col gap-24 pb-20">
      <section className="-mt-20 relative overflow-hidden border-b-2 border-wood-border/40 shadow-2xl px-6 pt-44 pb-28 sm:pt-52 sm:pb-36 lg:px-8" style={{ backgroundImage: "linear-gradient(to bottom, rgba(44, 26, 15, 0.45), rgba(26, 15, 8, 0.7)), url('/images/hero-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-wood-accent/20 px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-6 border border-wood-accent/30 backdrop-blur-sm">
            <Sparkles className="h-3 w-3 text-wood-accent animate-pulse" />
            Curated Inspiration
          </div>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-none drop-shadow-lg">
            Bespoke Spaces <br />
            <span className="font-light italic text-wood-accent font-serif">Designed for Living</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl font-light leading-relaxed text-wood-beige drop-shadow-sm">
            LD Interiors & Furnitures brings you high-end, contemporary interior designs and premium woodwork. Explore our collection of premium residential and commercial spaces designed to inspire.
          </p>
          
          {/* Traditional Proverb Quote */}
          <div className="mx-auto mt-8 max-w-2xl border-y border-wood-accent/20 py-3.5 mb-8">
            <p className="font-serif italic text-sm sm:text-base text-wood-accent font-semibold tracking-wide leading-relaxed">
              "గృహమే కదా స్వర్గసీమ" — Traditional Proverb: 'Home is indeed a heaven.' We bring that heaven into reality with 25+ years of craftsmanship.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-x-6">
            <Link
              href="/products"
              className="flex items-center gap-2 rounded-full bg-wood-accent hover:bg-amber-500 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-wood-dark shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer btn-3d-accent"
            >
              Explore Showcase
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* About & Wooden Furniture Themes Section */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Col: About Office */}
        <div className="lg:col-span-7">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Our Legacy
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-wood-dark mt-2 mb-6">
            About LD Interiors & Furnitures
          </h2>
          <p className="text-sm sm:text-base text-wood-medium font-light leading-relaxed mb-6">
            For over <strong className="font-bold text-wood-dark">25+ years</strong>, LD Interiors & Furnitures has been a trusted pioneer in transforming blueprints into breathtaking living realities. Led by our head constructor and pricing specialist, <strong className="font-bold text-wood-dark">Nagaraju</strong>, we craft design experiences combining traditional durability with modern luxury aesthetics.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">Traditional Carving</h4>
                <p className="text-xs text-wood-light font-light mt-1">Custom door and mandir layout carvings in teak wood.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">Premium Lumber Selection</h4>
                <p className="text-xs text-wood-light font-light mt-1">High-quality Teak, Rosewood, and Cedar materials.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">End-to-End Handover</h4>
                <p className="text-xs text-wood-light font-light mt-1">Complete structural builds, partitionings, and installations.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-wood-accent font-serif text-lg font-bold">✓</span>
              <div>
                <h4 className="font-serif font-bold text-sm text-wood-dark">25+ Years of Trust</h4>
                <p className="text-xs text-wood-light font-light mt-1">Generations of families served in Konaseema region.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Wooden Theme Highlights */}
        <div className="lg:col-span-5 bg-wood-cream border border-wood-border/60 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Signature Design Tones
          </span>
          <h3 className="font-serif text-xl font-bold text-wood-dark mt-1 mb-6">
            Bespoke Wooden Furniture
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-wood-beige/25 border border-wood-border/30 hover:border-wood-accent/35 transition-colors">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Teak Wood Main Doors</h4>
              <p className="text-xs text-wood-light font-light mt-1">Robust entryways featuring traditional temple carving and brass fittings.</p>
            </div>
            <div className="p-4 rounded-xl bg-wood-beige/25 border border-wood-border/30 hover:border-wood-accent/35 transition-colors">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Walnut & Beech Dining Sets</h4>
              <p className="text-xs text-wood-light font-light mt-1">Hand-finished joint alignments with scratch-resistant wood polish.</p>
            </div>
            <div className="p-4 rounded-xl bg-wood-beige/25 border border-wood-border/30 hover:border-wood-accent/35 transition-colors">
              <h4 className="font-serif font-bold text-sm text-wood-dark">Rosewood Modular Cabinets</h4>
              <p className="text-xs text-wood-light font-light mt-1">Space-saving wardrobes and drawers built from seasoned rosewood.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Showcase Section */}
      <section className="mx-auto w-full max-w-7xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-wood-border/30 pb-6 gap-4">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
              Fresh Daily
            </span>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-wood-dark mt-1">
              Latest Additions
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-wood-dark hover:text-wood-medium transition-colors"
          >
            View all designs
            <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex h-60 w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-wood-light" />
              <p className="text-sm text-wood-light font-light animate-pulse">Loading showcase...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-wood-border/60 bg-wood-cream p-12 text-center">
            <Compass className="mx-auto h-12 w-12 text-wood-light stroke-1 mb-4 animate-bounce" />
            <h3 className="text-lg font-serif font-bold text-wood-dark">Connection Offline</h3>
            <p className="mt-2 text-sm text-wood-light font-light max-w-md mx-auto">{error}</p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-wood-border px-5 py-2 text-xs font-semibold hover:bg-wood-dark hover:text-white hover:border-wood-dark transition-all duration-300"
            >
              Access Admin Panel
            </Link>
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-wood-border p-12 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-wood-light mb-4" />
            <h3 className="text-lg font-serif font-bold text-wood-dark">Gallery is empty</h3>
            <p className="mt-2 text-sm text-wood-light font-light max-w-md mx-auto">
              We are preparing to upload our interior design catalog soon. Admins can start uploading right away.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-wood-dark px-5 py-2.5 text-xs font-semibold text-white hover:bg-wood-medium transition-colors"
            >
              Go to Admin Panel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
