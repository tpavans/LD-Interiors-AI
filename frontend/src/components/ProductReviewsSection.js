"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Star, CheckCircle2, ThumbsUp, Filter, 
  ChevronDown, Image as ImageIcon, X, Loader2, 
  MessageSquare, Sparkles, MapPin, ShieldCheck, ChevronRight
} from 'lucide-react';
import api from '@/utils/api';

/**
 * Format UTC date string to Indian Standard Time (IST)
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

export default function ProductReviewsSection({ productId, productName }) {
  const [data, setData] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    allCustomerPhotos: [],
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);
  const [onlyPhotosFilter, setOnlyPhotosFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest'
  
  // Lightbox Modal for Customer Photos
  const [activePhoto, setActivePhoto] = useState(null);
  
  // Helpful votes stored locally
  const [helpfulVotes, setHelpfulVotes] = useState({});

  useEffect(() => {
    if (!productId) return;

    let isMounted = true;
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/reviews/product/${productId}`);
        if (res.data?.success && isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Failed to load product reviews:', err?.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReviews();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  // Handle local helpful vote
  const handleHelpfulClick = (reviewId) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
  };

  // Filtered & Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...(data.reviews || [])];

    if (selectedStarFilter) {
      list = list.filter(r => r.rating === selectedStarFilter);
    }

    if (onlyPhotosFilter) {
      list = list.filter(r => Array.isArray(r.imageUrls) && r.imageUrls.length > 0);
    }

    if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [data.reviews, selectedStarFilter, onlyPhotosFilter, sortBy]);

  const totalRatings = data.totalReviews || 0;

  // Calculate percentage for Amazon-style progress bars
  const getPercentage = (count) => {
    if (!totalRatings || totalRatings === 0) return 0;
    return Math.round((count / totalRatings) * 100);
  };

  return (
    <div id="customer-reviews" className="mt-16 pt-12 border-t-2 border-slate-200 dark:border-slate-800 text-left">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <span className="text-[10px] font-black text-[#A64B24] dark:text-[#D6A04B] uppercase tracking-widest block mb-1">
            Verified Teakwood Craftsmanship
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Customer Reviews &amp; Ratings
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real customer photographs and verified feedback for <strong className="text-slate-800 dark:text-slate-200">{productName}</strong>
          </p>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0B1E3B] text-[#F5E6C8] border border-[#D6A04B]/40 text-xs font-bold transition-all shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <MessageSquare className="h-4 w-4 text-[#D6A04B]" />
          <span>Write a Review from Orders</span>
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#D6A04B]" />
          <p className="text-xs text-slate-500">Loading verified customer reviews...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Amazon-Style Rating Breakdown (4 cols on large screen) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm sticky top-20">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white mb-3">
              Customer Feedback
            </h3>

            {/* Overall Rating & Stars */}
            <div className="flex items-center gap-3 mb-2">
              <span className="font-serif text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {data.averageRating ? data.averageRating.toFixed(1) : '5.0'}
              </span>
              <div>
                <div className="flex items-center gap-1 text-[#D6A04B]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4.5 w-4.5 ${
                        star <= Math.round(data.averageRating || 5)
                          ? 'fill-[#D6A04B] text-[#D6A04B]'
                          : 'fill-transparent text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  {totalRatings} verified customer {totalRatings === 1 ? 'rating' : 'ratings'}
                </p>
              </div>
            </div>

            {/* Amazon-style 5★ - 1★ progress bars */}
            <div className="mt-5 space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = data.ratingCounts?.[stars] || 0;
                const pct = getPercentage(count);
                const isFilterActive = selectedStarFilter === stars;

                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedStarFilter(isFilterActive ? null : stars)}
                    className={`w-full flex items-center gap-2.5 text-xs text-left group transition-all p-1 rounded-lg cursor-pointer ${
                      isFilterActive ? 'bg-amber-50 dark:bg-amber-950/40 ring-1 ring-[#D6A04B]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="w-12 font-bold text-slate-700 dark:text-slate-300 shrink-0 text-[11px] group-hover:text-[#A64B24] dark:group-hover:text-[#D6A04B]">
                      {stars} star
                    </span>

                    {/* Progress Bar Track */}
                    <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                      <div
                        className="h-full bg-gradient-to-r from-[#D6A04B] to-[#F5E6C8] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-9 text-right font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Clear Filter if active */}
            {selectedStarFilter && (
              <button
                onClick={() => setSelectedStarFilter(null)}
                className="mt-3 text-xs font-bold text-[#008DDA] hover:underline flex items-center gap-1"
              >
                <span>Clear star filter (Showing {selectedStarFilter}★)</span>
                <X className="h-3 w-3" />
              </button>
            )}

            {/* Verified Guarantee Badge */}
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>100% Verified Purchases:</strong> Only customers who completed an actual order with LD Interiors can submit reviews.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Customer Gallery & Review Feed (8 cols on large screen) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Amazon-Style "Reviews with images" Gallery Strip */}
            {data.allCustomerPhotos && data.allCustomerPhotos.length > 0 && (
              <div className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-[#F5E6C8] flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-[#D6A04B]" />
                    <span>Customer Installation Photographs ({data.allCustomerPhotos.length})</span>
                  </h4>
                  <span className="text-[10px] text-slate-500">Click photo to zoom</span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-thin pb-2 snap-x">
                  {data.allCustomerPhotos.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhoto(item)}
                      className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 snap-start rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[#D6A04B] transition-all group cursor-pointer shadow-xs hover:scale-105"
                    >
                      <img
                        src={item.url}
                        alt={`Customer photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-[#F5E6C8]" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Filter and Sort Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => { setSelectedStarFilter(null); setOnlyPhotosFilter(false); }}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                    !selectedStarFilter && !onlyPhotosFilter
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  All ({totalRatings})
                </button>

                <button
                  onClick={() => setOnlyPhotosFilter(!onlyPhotosFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    onlyPhotosFilter
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>With Photos</span>
                </button>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-bold">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Most Recent</option>
                  <option value="highest">Highest Rating</option>
                </select>
              </div>
            </div>

            {/* Customer Review Cards List */}
            {displayedReviews.length === 0 ? (
              <div className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D6A04B] flex items-center justify-center mx-auto">
                  <Star className="h-6 w-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  No reviews match your filter
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {totalRatings === 0 
                    ? "Be the first verified customer to share photos and review this teakwood piece!" 
                    : "Try clearing your star or photo filter to see all verified reviews."}
                </p>
                {totalRatings === 0 && (
                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#A64B24] to-[#7B3215] text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-sm"
                  >
                    <span>Go to My Orders to Review</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedReviews.map((rev) => {
                  const avatarLetter = (rev.customerName || 'Customer').trim().charAt(0).toUpperCase();

                  return (
                    <div
                      key={rev._id}
                      className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm text-left transition-all hover:border-[#D6A04B]/50"
                    >
                      {/* Customer Info Row */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circle */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#A64B24] to-[#D6A04B] text-[#F5E6C8] flex items-center justify-center font-serif font-black text-sm shadow-xs">
                            {avatarLetter}
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                {rev.customerName}
                              </h4>
                              {rev.verifiedPurchase && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.2 rounded-full border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Verified Purchase</span>
                                </span>
                              )}
                            </div>

                            {/* Location (City, State, India) */}
                            {rev.locationConsent !== false && (rev.city || rev.state) && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                                <MapPin className="h-3 w-3 text-[#A64B24] dark:text-[#D6A04B]" />
                                <span>{rev.city ? `${rev.city}, ` : ''}{rev.state ? `${rev.state}, ` : ''}{rev.country || 'India'}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Category Badge */}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#D6A04B] bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-[#D6A04B]/30 hidden sm:inline-block">
                          {rev.projectCategory || 'Customized Furniture'}
                        </span>
                      </div>

                      {/* Stars & IST Timestamp */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5 text-[#D6A04B]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= rev.rating
                                  ? 'fill-[#D6A04B] text-[#D6A04B]'
                                  : 'fill-transparent text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-400 text-xs">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Reviewed in India on {formatToIST(rev.createdAt)}
                        </span>
                      </div>

                      {/* Written Feedback Text */}
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-light mt-2 whitespace-pre-line">
                        {rev.reviewText}
                      </p>

                      {/* Customer Uploaded Project Photographs */}
                      {Array.isArray(rev.imageUrls) && rev.imageUrls.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Customer Real Photos ({rev.imageUrls.length})
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5">
                            {rev.imageUrls.map((imgUrl, i) => (
                              <button
                                key={i}
                                onClick={() => setActivePhoto({
                                  url: imgUrl,
                                  customerName: rev.customerName,
                                  city: rev.city,
                                  state: rev.state,
                                  rating: rev.rating,
                                  reviewText: rev.reviewText,
                                  createdAt: rev.createdAt
                                })}
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[#D6A04B] transition-all cursor-pointer group shadow-2xs hover:scale-105"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Review photo ${i + 1}`}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Customer Video if uploaded */}
                      {rev.videoUrl && (
                        <div className="mt-3.5 max-w-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                          <video src={rev.videoUrl} controls className="w-full h-48 object-cover" />
                        </div>
                      )}

                      {/* Helpful Button Row */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => handleHelpfulClick(rev._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer text-slate-700 dark:text-slate-300"
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-[#D6A04B]" />
                          <span>Helpful ({helpfulVotes[rev._id] || 0})</span>
                        </button>

                        <span className="text-[10px] text-slate-400">
                          Order Ref: #{String(rev.orderRefNumber || rev.orderId).slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal for Customer Photos */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setActivePhoto(null)}
        >
          <div
            className="relative w-full max-w-3xl flex flex-col items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute -top-10 right-2 sm:top-2 sm:-right-12 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full cursor-pointer transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Photo Canvas */}
            <div className="w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-3xl bg-black/60 border border-white/10 shadow-2xl">
              <img
                src={activePhoto.url}
                alt="Enlarged customer installation"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl animate-scaleIn"
              />
            </div>

            {/* Photo Metadata Card */}
            <div className="w-full bg-[#071A33]/95 backdrop-blur-md border border-[#D6A04B]/30 rounded-2xl p-4 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#F5E6C8]">{activePhoto.customerName}</h4>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-700">
                    Verified Customer
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  {activePhoto.city ? `${activePhoto.city}, ` : ''}{activePhoto.state ? `${activePhoto.state}, ` : ''}India • {formatToIST(activePhoto.createdAt)}
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
                    className={`h-4 w-4 ${
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
