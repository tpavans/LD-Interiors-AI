"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Star, CheckCircle2, MapPin, Calendar, Image as ImageIcon, 
  Filter, Search, RefreshCw, Sparkles, ChevronRight, X, 
  ArrowLeft, ShieldCheck, Heart, LayoutGrid, MessageSquare, 
  ThumbsUp, SlidersHorizontal, Loader2
} from 'lucide-react';
import api from '@/utils/api';

const PROJECT_CATEGORIES = [
  'All Projects',
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Wall Designs',
  'Ceiling Designs',
  'Lighting',
  'Customized Furniture',
  'Wooden Products',
  'Other Interior Projects'
];

/**
 * Format date in Indian Standard Time (IST)
 */
function formatToIST(dateStr) {
  if (!dateStr) return 'Recent';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }) + ' IST';
  } catch (e) {
    return 'Recent';
  }
}

export default function CustomerReviewsAndGalleryPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters & State
  const [activeCategory, setActiveCategory] = useState('All Projects');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest_rated'
  const [viewMode, setViewMode] = useState('reviews'); // 'reviews' | 'gallery'

  // Lightbox Modal State
  const [activePhoto, setActivePhoto] = useState(null);

  // Helpful votes state
  const [helpfulMap, setHelpfulMap] = useState({});

  // Fetch approved reviews
  const fetchReviews = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'All Projects') {
        params.append('category', activeCategory);
      }
      if (ratingFilter && ratingFilter !== 'all') {
        params.append('rating', ratingFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('sort', sortBy);
      params.append('limit', '50');

      const res = await api.get(`/reviews?${params.toString()}`);
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.warn('Error fetching approved reviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeCategory, ratingFilter, sortBy]);

  // Extract all customer photos for the Completed Projects Gallery View
  const allCompletedProjectPhotos = useMemo(() => {
    const list = [];
    reviews.forEach((r) => {
      if (Array.isArray(r.imageUrls)) {
        r.imageUrls.forEach((url) => {
          list.push({
            url,
            customerName: r.customerName,
            city: r.city,
            state: r.state,
            country: r.country || 'India',
            productName: r.productName,
            projectCategory: r.projectCategory,
            rating: r.rating,
            reviewText: r.reviewText,
            createdAt: r.createdAt
          });
        });
      }
    });
    return list;
  }, [reviews]);

  const handleHelpful = (id) => {
    setHelpfulMap(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  return (
    <div className="min-h-screen bg-[#FBF9F1] dark:bg-[#071A33] text-slate-900 dark:text-[#F5E6C8] select-none transition-colors duration-300">
      {/* Luxury Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#071A33] via-[#0B1E3B] to-[#071A33] text-white py-14 sm:py-20 px-4 sm:px-6 border-b border-[#D6A04B]/30">
        <div className="absolute inset-0 bg-[radial-gradient(#D6A04B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D6A04B] hover:text-[#F5E6C8] transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A64B24]/40 border border-[#D6A04B]/50 text-[#F5E6C8] text-[11px] font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#D6A04B]" />
            <span>Verified Customer Showcase</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#F5E6C8] tracking-tight">
            Real Stories. Real Spaces. Real Customers.
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-base text-slate-300 font-light leading-relaxed">
            Genuine customer photographs, heartfelt testimonials, and completed teakwood interior transformations crafted by LD Interiors.
          </p>

          {/* Aggregate Rating & Stats Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-[#0C223F]/80 border border-[#D6A04B]/30 p-3.5 rounded-2xl text-center backdrop-blur-sm">
              <span className="font-serif text-2xl sm:text-3xl font-black text-[#D6A04B]">
                {stats.averageRating ? stats.averageRating.toFixed(1) : '5.0'} ★
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-1">Average Rating</p>
            </div>

            <div className="bg-[#0C223F]/80 border border-[#D6A04B]/30 p-3.5 rounded-2xl text-center backdrop-blur-sm">
              <span className="font-mono text-2xl sm:text-3xl font-black text-white">
                {stats.totalReviews || reviews.length}
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-1">Verified Reviews</p>
            </div>

            <div className="bg-[#0C223F]/80 border border-[#D6A04B]/30 p-3.5 rounded-2xl text-center backdrop-blur-sm">
              <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400">
                100%
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-1">Genuine Purchases</p>
            </div>

            <div className="bg-[#0C223F]/80 border border-[#D6A04B]/30 p-3.5 rounded-2xl text-center backdrop-blur-sm">
              <span className="font-serif text-2xl sm:text-3xl font-black text-[#F5E6C8]">
                Grade-A
              </span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-1">Burma Teakwood</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-left">
        {/* Project Categories Filter Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#A64B24] dark:text-[#D6A04B]">
              Browse by Project Space
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {reviews.length} {reviews.length === 1 ? 'project review' : 'project reviews'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#A64B24] to-[#7B3215] text-white border-transparent font-black shadow-md scale-105'
                      : 'bg-white dark:bg-[#0C223F] text-slate-700 dark:text-[#F5E6C8] border-slate-200 dark:border-[#D6A04B]/30 hover:border-[#D6A04B]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Search, Rating Filter, View Mode, Refresh */}
        <div className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 mb-8 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
              placeholder="Search by customer, city, or furniture name..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D6A04B]"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); fetchReviews(); }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle: Reviews Cards vs Photo Gallery */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('reviews')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'reviews'
                    ? 'bg-white dark:bg-[#071A33] text-slate-900 dark:text-[#F5E6C8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Stories</span>
              </button>

              <button
                onClick={() => setViewMode('gallery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'gallery'
                    ? 'bg-white dark:bg-[#071A33] text-slate-900 dark:text-[#F5E6C8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Gallery</span>
              </button>
            </div>

            {/* Rating Filter Dropdown */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Star Ratings</option>
              <option value="5">5 Stars Only</option>
              <option value="4">4 Stars &amp; Above</option>
              <option value="3">3 Stars &amp; Above</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="highest_rated">Highest Rated</option>
            </select>

            {/* Live Refresh Button */}
            <button
              onClick={() => fetchReviews(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#D6A04B] transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Reviews"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#D6A04B]' : ''}`} />
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-[#D6A04B]" />
            <p className="text-xs text-slate-500 font-medium animate-pulse">
              Loading authentic customer reviews &amp; completed project photographs...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D6A04B] flex items-center justify-center mx-auto">
              <Star className="h-8 w-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              No reviews found matching this filter
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try selecting &quot;All Projects&quot; or clearing your search query to see genuine customer stories.
            </p>
            <button
              onClick={() => { setActiveCategory('All Projects'); setRatingFilter('all'); setSearchQuery(''); }}
              className="px-5 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0B1E3B] text-[#F5E6C8] border border-[#D6A04B]/40 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'gallery' ? (
          /* COMPLETED PROJECTS GALLERY (Photo Masonry View) */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-[#F5E6C8]">
                Real Installation Gallery ({allCompletedProjectPhotos.length} Photos)
              </h3>
              <span className="text-xs text-slate-500">Click any image for full-screen view</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {allCompletedProjectPhotos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setActivePhoto(photo)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#D6A04B] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <img
                    src={photo.url}
                    alt={photo.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#D6A04B]">
                      {photo.projectCategory}
                    </span>
                    <h4 className="font-bold text-xs line-clamp-1">{photo.productName}</h4>
                    <p className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-[#D6A04B]" />
                      <span>{photo.city}, {photo.state}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* CUSTOMER STORIES (Detailed Responsive Cards View) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => {
              const avatarLetter = (rev.customerName || 'Customer').trim().charAt(0).toUpperCase();

              return (
                <article
                  key={rev._id}
                  className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between"
                >
                  <div>
                    {/* Customer Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#A64B24] to-[#D6A04B] text-[#F5E6C8] flex items-center justify-center font-serif font-black text-sm shadow-xs shrink-0">
                          {avatarLetter}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {rev.customerName}
                            </h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Verified {rev.reviewType === 'custom_project' ? 'Project' : 'Purchase'}</span>
                            </span>
                          </div>

                          {/* Location */}
                          {rev.locationConsent !== false && (rev.city || rev.state) && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                              <MapPin className="h-3 w-3 text-[#A64B24] dark:text-[#D6A04B]" />
                              <span>{rev.city ? `${rev.city}, ` : ''}{rev.state ? `${rev.state}, ` : ''}{rev.country || 'India'}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Project Category Tag */}
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#A64B24] dark:text-[#D6A04B] bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                        {rev.projectCategory || 'Customized Furniture'}
                      </span>
                    </div>

                    {/* Product Name Banner */}
                    <div className="mb-2.5 py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {rev.productName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 shrink-0">
                        Ref #{String(rev.orderRefNumber || rev.orderId).slice(-6).toUpperCase()}
                      </span>
                    </div>

                    {/* Stars & IST Date */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-0.5 text-[#D6A04B]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= rev.rating
                                ? 'fill-[#D6A04B] text-[#D6A04B]'
                                : 'fill-transparent text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-300 text-xs">•</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {formatToIST(rev.createdAt)}
                      </span>
                    </div>

                    {/* Written Customer Feedback */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light whitespace-pre-line mb-4">
                      {rev.reviewText}
                    </p>

                    {/* Uploaded Customer Photos Grid */}
                    {Array.isArray(rev.imageUrls) && rev.imageUrls.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {rev.imageUrls.map((imgUrl, i) => (
                            <button
                              key={i}
                              onClick={() => setActivePhoto({
                                url: imgUrl,
                                customerName: rev.customerName,
                                city: rev.city,
                                state: rev.state,
                                productName: rev.productName,
                                projectCategory: rev.projectCategory,
                                rating: rev.rating,
                                reviewText: rev.reviewText,
                                createdAt: rev.createdAt
                              })}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[#D6A04B] transition-all cursor-pointer group shadow-2xs hover:scale-105"
                            >
                              <img
                                src={imgUrl}
                                alt={`Customer project photo ${i + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video if uploaded */}
                    {rev.videoUrl && (
                      <div className="mb-4 max-w-xs rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <video src={rev.videoUrl} controls className="w-full h-40 object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Helpful & Link */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 text-[#D6A04B]" />
                      <span>Helpful ({helpfulMap[rev._id] || 0})</span>
                    </button>

                    {rev.productId ? (
                      <Link
                        href={`/products/${rev.productId}`}
                        className="text-xs font-bold text-[#008DDA] hover:underline flex items-center gap-1"
                      >
                        <span>View Design</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Custom Interior Commission</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Zoom Modal */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative w-full max-w-4xl flex flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-2 sm:top-2 sm:-right-12 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full cursor-pointer transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo Canvas */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-3xl bg-black/70 border border-white/10 shadow-2xl">
              <img
                src={activePhoto.url}
                alt={activePhoto.productName}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl animate-scaleIn"
              />
            </div>

            {/* Photo Details Overlay */}
            <div className="w-full bg-[#071A33]/95 backdrop-blur-md border border-[#D6A04B]/30 rounded-2xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#D6A04B]">
                    {activePhoto.projectCategory || 'Teakwood Interior'}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                    Verified Customer
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#F5E6C8] mt-0.5">
                  {activePhoto.productName}
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Client: <strong>{activePhoto.customerName}</strong> • {activePhoto.city ? `${activePhoto.city}, ` : ''}{activePhoto.state ? `${activePhoto.state}, ` : ''}India
                </p>
                {activePhoto.reviewText && (
                  <p className="text-xs text-slate-200 mt-1 line-clamp-2 italic">
                    &ldquo;{activePhoto.reviewText}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 text-[#D6A04B] shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4.5 w-4.5 ${
                      s <= (activePhoto.rating || 5) ? 'fill-[#D6A04B]' : 'fill-transparent text-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
