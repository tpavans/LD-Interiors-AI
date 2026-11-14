"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import api from '@/utils/api';
import { 
  Loader2, Volume2, VolumeX, Eye, Play, Pause, X, 
  Sparkles, MessageCircle, Heart, Share2, ChevronUp, 
  ChevronDown, Check, ArrowLeft, Film, LayoutGrid, Music, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

// Get or create persistent client ID for genuine like tracking
function getClientId() {
  if (typeof window === 'undefined') return 'client_guest';
  let cid = localStorage.getItem('ld_client_id');
  if (!cid) {
    cid = 'ld_user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('ld_client_id', cid);
  }
  return cid;
}

export default function ReelsPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations['EN'];
  const isTelugu = language === 'TE';

  // Reels Data (Purely from Database - NO DEFAULT FAKE REELS)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  // Instagram Reels Player State
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [likedMap, setLikedMap] = useState({});
  const [heartPop, setHeartPop] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // References
  const feedContainerRef = useRef(null);
  const videoRefs = useRef({});
  const lastTapRef = useRef(0);
  const recordedViewsRef = useRef(new Set());

  // Helper to test YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) videoId = parts[1].split(/[?#&]/)[0];
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) videoId = parts[1].split(/[?#&]/)[0];
    } else if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) videoId = parts[1].split(/[?#&]/)[0];
    } else if (url.includes('embed/')) {
      const parts = url.split('embed/');
      if (parts[1]) videoId = parts[1].split(/[?#&]/)[0];
    } else {
      videoId = url;
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&playsinline=1&enablejsapi=1`;
  };

  // Helper to test Instagram
  const isInstagramUrl = (url) => {
    if (!url) return false;
    return url.includes('instagram.com/reel/') || url.includes('instagram.com/p/');
  };

  const getInstagramEmbedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    return `${cleanUrl}/embed/`;
  };

  // Fetch Reels strictly from API (No Mock/Default items)
  const fetchReels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reels');
      const reelsData = response.data?.reels || [];
      setProducts(reelsData);

      // Initialize liked map from DB data using client ID
      const clientId = getClientId();
      const initialLikes = {};
      reelsData.forEach(r => {
        if (Array.isArray(r.likedBy) && r.likedBy.includes(clientId)) {
          initialLikes[r._id] = true;
        }
      });
      setLikedMap(initialLikes);

      // Check if URL has ?reel= or ?index= query param
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const reelId = params.get('reel');
        if (reelId) {
          const foundIdx = reelsData.findIndex(r => r._id === reelId);
          if (foundIdx !== -1) {
            setActiveIndex(foundIdx);
            setIsPlayerOpen(true);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching reels:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  // Filtered Reels based on selected category
  const filteredReels = React.useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => (p.category || '').toLowerCase().includes(activeCategory.toLowerCase()));
  }, [products, activeCategory]);

  const categories = React.useMemo(() => {
    const set = new Set(['All']);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Handle Opening Fullscreen Instagram Reels Player
  const openReelPlayer = (index) => {
    setActiveIndex(index);
    setIsPlayerOpen(true);
    setIsPaused(false);
  };

  const closeReelPlayer = () => {
    setIsPlayerOpen(false);
    setIsPaused(true);
  };

  // Scroll to Specific Reel Index (Smooth Snap)
  const scrollToIndex = useCallback((targetIndex) => {
    if (targetIndex < 0 || targetIndex >= filteredReels.length) return;
    setActiveIndex(targetIndex);
    setIsPaused(false);

    if (feedContainerRef.current) {
      const container = feedContainerRef.current;
      const targetTop = targetIndex * container.clientHeight;
      container.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    }
  }, [filteredReels.length]);

  const goToNextReel = useCallback(() => {
    if (activeIndex < filteredReels.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  }, [activeIndex, filteredReels.length, scrollToIndex]);

  const goToPrevReel = useCallback(() => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  }, [activeIndex, scrollToIndex]);

  // Synchronize Scroll Container Position when Player Opens
  useEffect(() => {
    if (isPlayerOpen && feedContainerRef.current) {
      const container = feedContainerRef.current;
      container.scrollTo({
        top: activeIndex * container.clientHeight,
        behavior: 'instant'
      });
    }
  }, [isPlayerOpen]);

  // Real-Time View Count Increment on Active Reel
  useEffect(() => {
    if (!isPlayerOpen || !filteredReels[activeIndex]) return;
    const currentReel = filteredReels[activeIndex];
    const reelId = currentReel._id;

    // Avoid double counting within same session
    if (recordedViewsRef.current.has(reelId)) return;
    recordedViewsRef.current.add(reelId);

    const timer = setTimeout(async () => {
      try {
        const res = await api.post(`/reels/${reelId}/view`);
        if (res.data?.success && res.data.views !== undefined) {
          setProducts(prev => prev.map(p => p._id === reelId ? { ...p, views: res.data.views } : p));
        }
      } catch (e) {
        console.warn('Real-time view increment error:', e.message);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [activeIndex, isPlayerOpen, filteredReels]);

  // Handle Native Scroll Detection (Snapping to Active Item)
  const handleFeedScroll = () => {
    if (!feedContainerRef.current) return;
    const container = feedContainerRef.current;
    const height = container.clientHeight;
    if (!height) return;

    const detectedIndex = Math.round(container.scrollTop / height);
    if (detectedIndex !== activeIndex && detectedIndex >= 0 && detectedIndex < filteredReels.length) {
      setActiveIndex(detectedIndex);
      setIsPaused(false);
    }
  };

  // Keyboard Navigation: Up, Down, Space, Esc, Mute
  useEffect(() => {
    if (!isPlayerOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        goToNextReel();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        goToPrevReel();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeReelPlayer();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerOpen, goToNextReel, goToPrevReel]);

  // Play/Pause Video Element when activeIndex or isPaused changes
  useEffect(() => {
    if (!isPlayerOpen) return;

    Object.keys(videoRefs.current).forEach((key) => {
      const idx = Number(key);
      const vid = videoRefs.current[idx];
      if (vid) {
        if (idx === activeIndex && !isPaused) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }, [activeIndex, isPaused, isPlayerOpen]);

  // Real-Time Like Toggle Function (Updates database and UI)
  const handleToggleLike = async (reelId, e) => {
    if (e) e.stopPropagation();
    const currentReel = filteredReels.find(r => r._id === reelId);
    if (!currentReel) return;

    const clientId = getClientId();
    const currentlyLiked = likedMap[reelId];

    // Optimistic UI Update
    setLikedMap(prev => ({ ...prev, [reelId]: !currentlyLiked }));
    if (!currentlyLiked) {
      setHeartPop(true);
      setTimeout(() => setHeartPop(false), 800);
    }
    setProducts(prev => prev.map(p => {
      if (p._id === reelId) {
        const newLikes = Math.max(0, (p.likes || 0) + (currentlyLiked ? -1 : 1));
        return { ...p, likes: newLikes };
      }
      return p;
    }));

    // Database Real-time Sync
    try {
      const res = await api.post(`/reels/${reelId}/like`, { clientId });
      if (res.data?.success) {
        setLikedMap(prev => ({ ...prev, [reelId]: res.data.liked }));
        setProducts(prev => prev.map(p => p._id === reelId ? { ...p, likes: res.data.likes } : p));
      }
    } catch (err) {
      console.warn('Real-time like toggle failed:', err.message);
    }
  };

  // Single Tap vs Double Tap Detection (Instagram-style Like & Pause)
  const handleVideoTap = (reelId) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // Double Tap -> Like
      handleToggleLike(reelId);
      lastTapRef.current = 0;
    } else {
      // Single Tap -> Toggle Play/Pause
      lastTapRef.current = now;
      setTimeout(() => {
        if (Date.now() - lastTapRef.current >= DOUBLE_TAP_DELAY && lastTapRef.current !== 0) {
          setIsPaused(prev => !prev);
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // WhatsApp Inquiry Handler
  const handleWhatsAppInquiry = (product, e) => {
    if (e) e.stopPropagation();
    const priceText = product.price && product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Quotation';
    const message = isTelugu
      ? `నమస్తే నాగరాజు గారు! నేను మీ LD ఇంటీరియర్స్ వర్క్‌షాప్ రీల్ ద్వారా *${product.title}* (${priceText}) వీడియోను చూశాను. దీని తయారీ మరియు ఆర్డర్ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.\n\nవీడియో లింక్: ${product.video || 'https://www.ldinteriors.in/reels'}`
      : `Hello Mr. Nagaraju! I watched your workshop reel for *${product.title}* (${priceText}) on LD Interiors. I would like to inquire about this teakwood design.\n\nReel Link: ${product.video || 'https://www.ldinteriors.in/reels'}`;
    
    window.open(`https://wa.me/916281653998?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Share Reel Handler
  const handleShareReel = (product, e) => {
    if (e) e.stopPropagation();
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/reels?reel=${product._id}`
      : `https://www.ldinteriors.in/reels?reel=${product._id}`;

    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Watch this handcrafted teakwood reel from LD Interiors workshop!`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[75vh] w-full flex-col items-center justify-center bg-[#FBF9F1] dark:bg-[#071A33]">
        <Loader2 className="h-9 w-9 animate-spin text-[#008DDA] dark:text-[#D6A04B] mb-2" />
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium animate-pulse">
          Loading Workshop Video Reels from Database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#FBF9F1] dark:bg-[#071A33] py-8 px-4 sm:px-8 max-w-7xl mx-auto text-left select-none transition-colors duration-300">
      {/* Header Banner */}
      <div className="mb-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#A64B24]/15 to-[#D6A04B]/20 border border-[#D6A04B]/40 text-[#A64B24] dark:text-[#D6A04B] text-[10px] font-black uppercase tracking-widest mb-3 shadow-xs">
          <Film className="h-3.5 w-3.5" />
          <span>{isTelugu ? "ఇన్‌స్టాగ్రామ్ స్టైల్ వర్క్‌షాప్ రీల్స్" : "Instagram Style Workshop Reels"}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-[#F5E6C8] tracking-tight">
          {t.reelsTitle || "Workshop Reels & Shorts"}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal mt-2 leading-relaxed">
          {isTelugu 
            ? "అడ్మిన్ అప్‌లోడ్ చేసిన తాజా వర్క్‌షాప్ రీల్స్ ఇక్కడ ప్లే అవుతాయి. ఏదైనా రీల్‌ను క్లిక్ చేసి ఇన్‌స్టాగ్రామ్ లాగా పైకి క్రిందికి స్క్రోల్ చేస్తూ చూడండి!"
            : "Watch real workshop woodworking videos uploaded by our master craftsmen. Tap any video to scroll UP & DOWN like Instagram Reels!"}
        </p>

        {/* Primary CTA: Watch Fullscreen Reels if available */}
        {filteredReels.length > 0 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={() => openReelPlayer(0)}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#A64B24] via-[#c0582d] to-[#D6A04B] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{isTelugu ? "రీల్స్ ఫీడ్ చూడండి (Scroll Mode)" : "▶ Watch All Reels (Instagram Mode)"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Filter Pills Bar */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-2 mb-6">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs border ${
                  isActive
                    ? 'bg-[#071A33] dark:bg-[#F5E6C8] text-white dark:text-[#071A33] border-transparent font-black shadow-md'
                    : 'bg-white dark:bg-[#0B1E3B] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-[#D6A04B]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      {/* EMPTY STATE: Only shown when admin has not uploaded any video reels yet */}
      {filteredReels.length === 0 ? (
        <div className="bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 sm:p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[#D6A04B] flex items-center justify-center mx-auto">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {isTelugu ? "వర్క్‌షాప్ రీల్స్ త్వరలో రానున్నాయి" : "No Workshop Reels Uploaded Yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {isTelugu 
              ? "అడ్మిన్ డాష్‌బోర్డ్ నుండి యూట్యూబ్ షార్ట్స్ లేదా వీడియో లింక్‌లు అప్‌లోడ్ చేసిన తర్వాత ఇక్కడ ప్రత్యక్షంగా కనిపిస్తాయి."
              : "Videos uploaded by admin from the Admin Dashboard will play live here. Check back soon for new woodworking reels!"}
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#071A33] hover:bg-[#0B1E3B] text-[#F5E6C8] border border-[#D6A04B]/40 text-xs font-bold transition-all shadow-sm"
            >
              <Eye className="h-4 w-4 text-[#D6A04B]" />
              <span>{isTelugu ? "ఫర్నిచర్ డిజైన్లు చూడండి" : "Explore Furniture Designs"}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* REELS GRID: Real videos uploaded by admin */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {filteredReels.map((product, index) => (
            <div
              key={product._id || index}
              onClick={() => openReelPlayer(index)}
              className="group relative bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Reel 9:16 Aspect Thumbnail Container */}
              <div className="relative aspect-[9/14] w-full overflow-hidden bg-slate-900">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20" />

                {/* Top Reel Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-[#A64B24] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md">
                  <Play className="h-2.5 w-2.5 fill-white" />
                  <span>REEL</span>
                </div>

                {/* Real-time Likes Counter on Top Right */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[9px] font-bold">
                  <Heart className={`h-3 w-3 ${likedMap[product._id] ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                  <span>{product.likes || 0}</span>
                </div>

                {/* Center Play Button Pulse Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-11 w-11 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center group-hover:scale-120 group-hover:bg-[#008DDA] transition-all duration-300 shadow-xl">
                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Thumbnail Info */}
                <div className="absolute bottom-2.5 inset-x-2.5 text-left">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#D6A04B] block truncate mb-0.5">
                    {product.category || 'Workshop'}
                  </span>
                  <h3 className="font-serif text-xs font-black text-white line-clamp-1 group-hover:text-[#F5E6C8] transition-colors">
                    {product.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-300 font-mono">
                    <span>👁️ {product.views || 0}</span>
                    <span>•</span>
                    <span>{product.price && product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Estimate'}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="p-2.5 bg-white dark:bg-[#0B1E3B] flex items-center justify-between gap-1 text-left border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">
                  {product.views || 0} views
                </span>

                <span className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-[#A64B24] dark:text-[#D6A04B] border border-[#D6A04B]/30 font-extrabold text-[10px] uppercase tracking-wider group-hover:bg-[#A64B24] group-hover:text-white transition-all">
                  Play ▶
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          FULLSCREEN INSTAGRAM REELS VERTICAL SCROLLING PLAYER
          Supports Up and Down scrolling, real-time views, and real-time likes
         ========================================================================= */}
      {isPlayerOpen && filteredReels.length > 0 && (
        <div 
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-lg flex items-center justify-center animate-fadeIn select-none overflow-hidden"
          onClick={closeReelPlayer}
        >
          {/* Main 9:16 Vertical Instagram Frame Container */}
          <div 
            className="relative w-full sm:max-w-[430px] h-[100dvh] sm:h-[94vh] sm:max-h-[860px] bg-black sm:rounded-3xl overflow-hidden border-0 sm:border border-slate-800 shadow-2xl flex flex-col animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Instagram App Bar Overlay */}
            <div className="absolute top-0 inset-x-0 z-40 p-4 pt-5 sm:pt-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={closeReelPlayer}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Close Reels"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                  <Film className="h-3 w-3 text-[#D6A04B]" />
                  <span className="text-[11px] font-black uppercase tracking-wider">Reels</span>
                  <span className="text-white/40 text-[10px]">•</span>
                  <span className="text-[10px] font-mono font-bold text-[#F5E6C8]">
                    {activeIndex + 1}/{filteredReels.length}
                  </span>
                </div>
              </div>

              {/* Sound & Close Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105"
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-[#D6A04B]" />}
                </button>

                <button
                  onClick={closeReelPlayer}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* VERTICAL SCROLL SNAP CONTAINER (UP AND DOWN INSTAGRAM SCROLLING) */}
            <div
              ref={feedContainerRef}
              onScroll={handleFeedScroll}
              style={{ scrollSnapType: 'y mandatory', msOverflowStyle: 'none', scrollbarWidth: 'none' }}
              className="relative flex-1 w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth select-none bg-black no-scrollbar"
            >
              {filteredReels.map((reel, index) => {
                const isActive = index === activeIndex;
                const isLiked = likedMap[reel._id];
                const realLikesCount = reel.likes || 0;
                const realViewsCount = reel.views || 0;

                return (
                  <div
                    key={reel._id || index}
                    style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
                    className="relative w-full h-full snap-start snap-always shrink-0 flex items-center justify-center overflow-hidden bg-black"
                    onClick={() => handleVideoTap(reel._id)}
                  >
                    {/* Video Player Canvas */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                      {isYouTubeUrl(reel.video) ? (
                        // YouTube Shorts / Video Embed
                        isActive ? (
                          <iframe
                            src={getYouTubeEmbedUrl(reel.video)}
                            title={reel.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full object-cover scale-[1.02]"
                          />
                        ) : (
                          <img
                            src={reel.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                            alt={reel.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                        )
                      ) : isInstagramUrl(reel.video) ? (
                        // Instagram Reel Embed
                        isActive ? (
                          <iframe
                            src={getInstagramEmbedUrl(reel.video)}
                            title={reel.title}
                            frameBorder="0"
                            allowTransparency="true"
                            allow="autoplay; encrypted-media"
                            className="w-full h-full object-cover bg-black"
                          />
                        ) : (
                          <img
                            src={reel.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80'}
                            alt={reel.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                        )
                      ) : (
                        // Native HTML5 / Cloudinary MP4 Video
                        <video
                          ref={el => { videoRefs.current[index] = el; }}
                          src={reel.video}
                          poster={reel.image}
                          loop
                          muted={isMuted}
                          playsInline
                          preload="auto"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Dark Vignette Overlay for Readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85 pointer-events-none" />

                    {/* Paused State Center Indicator */}
                    {isPaused && isActive && (
                      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-fadeIn">
                        <div className="h-16 w-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
                          <Play className="h-8 w-8 fill-white text-white ml-1" />
                        </div>
                      </div>
                    )}

                    {/* Double Tap Heart Pop Animation */}
                    {heartPop && isActive && (
                      <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-scaleUp">
                        <Heart className="h-24 w-24 text-red-500 fill-red-500 drop-shadow-2xl animate-ping" />
                      </div>
                    )}

                    {/* RIGHT-SIDE INSTAGRAM ACTION BAR */}
                    <div 
                      className="absolute right-3.5 bottom-20 z-40 flex flex-col items-center gap-4 text-white"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Creator Avatar Monogram */}
                      <div className="relative group cursor-pointer mb-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#A64B24] via-[#D6A04B] to-[#F5E6C8] p-[2px] shadow-lg">
                          <div className="w-full h-full rounded-full bg-[#071A33] flex items-center justify-center text-xs font-serif font-black text-[#F5E6C8]">
                            LD
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-0.5 w-4 h-4 rounded-full bg-[#008DDA] text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-black">
                          ✓
                        </div>
                      </div>

                      {/* 1. Real-Time Like Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(reel._id, e)}
                        className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-90"
                      >
                        <div className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                          isLiked 
                            ? 'bg-red-500/20 border-red-500/50' 
                            : 'bg-black/40 border-white/20 hover:bg-black/60'
                        }`}>
                          <Heart className={`h-6 w-6 transition-colors ${
                            isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                          }`} />
                        </div>
                        <span className="text-[10px] font-extrabold font-mono tracking-tight drop-shadow-md">
                          {realLikesCount}
                        </span>
                      </button>

                      {/* 2. WhatsApp Direct Inquiry Button */}
                      <button
                        type="button"
                        onClick={(e) => handleWhatsAppInquiry(reel, e)}
                        className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-90"
                      >
                        <div className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white backdrop-blur-md border border-white/20 shadow-md">
                          <MessageCircle className="h-6 w-6 fill-white" />
                        </div>
                        <span className="text-[10px] font-extrabold tracking-tight drop-shadow-md">
                          Order
                        </span>
                      </button>

                      {/* 3. View Product Page Button */}
                      {reel.productId ? (
                        <Link
                          href={`/products/${reel.productId}`}
                          onClick={closeReelPlayer}
                          className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-90"
                        >
                          <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20">
                            <Eye className="h-6 w-6 text-[#D6A04B]" />
                          </div>
                          <span className="text-[10px] font-extrabold tracking-tight drop-shadow-md">
                            Design
                          </span>
                        </Link>
                      ) : (
                        <Link
                          href="/products"
                          onClick={closeReelPlayer}
                          className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-90"
                        >
                          <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20">
                            <Eye className="h-6 w-6 text-[#D6A04B]" />
                          </div>
                          <span className="text-[10px] font-extrabold tracking-tight drop-shadow-md">
                            Catalog
                          </span>
                        </Link>
                      )}

                      {/* 4. Share Button */}
                      <button
                        type="button"
                        onClick={(e) => handleShareReel(reel, e)}
                        className="flex flex-col items-center gap-1 group cursor-pointer transition-transform hover:scale-110 active:scale-90"
                      >
                        <div className="p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20">
                          <Share2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-[10px] font-extrabold tracking-tight drop-shadow-md">
                          Share
                        </span>
                      </button>
                    </div>

                    {/* BOTTOM LEFT INSTAGRAM CONTENT OVERLAY */}
                    <div 
                      className="absolute bottom-5 inset-x-4 pr-16 z-30 text-left text-white space-y-2 pointer-events-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Creator Handle Pill */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F5E6C8] flex items-center gap-1">
                          @ldinteriors.workshop
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleWhatsAppInquiry(reel, e)}
                          className="px-2.5 py-0.5 rounded-full border border-[#D6A04B] text-[#D6A04B] hover:bg-[#D6A04B] hover:text-[#071A33] text-[10px] font-black uppercase tracking-wider transition-colors"
                        >
                          Inquire
                        </button>
                      </div>

                      {/* Product Title */}
                      <h2 className="font-serif text-sm sm:text-base font-black text-white leading-snug drop-shadow-md">
                        {reel.title}
                      </h2>

                      {/* Price, Category & Real-Time Views */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#A64B24] text-white text-xs font-black font-mono shadow-sm">
                          {reel.price && reel.price > 0 ? `₹${reel.price.toLocaleString('en-IN')}` : 'Custom Estimate'}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-[10px] font-extrabold text-[#F5E6C8] uppercase tracking-wider">
                          #{reel.category || 'Workshop'}
                        </span>

                        <span className="text-[10px] text-sky-300 font-mono font-bold bg-black/40 px-2 py-0.5 rounded-md">
                          👁️ {realViewsCount} views
                        </span>
                      </div>

                      {/* Description caption */}
                      {reel.description && (
                        <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed font-light">
                          {reel.description}
                        </p>
                      )}

                      {/* Audio Marquee Ticker */}
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium">
                        <Music className="h-3 w-3 text-[#D6A04B] shrink-0" />
                        <span className="truncate">LD Interiors • Handcrafted Woodworking Original Audio</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toast for Copied Share Link */}
            {copiedToast && (
              <div className="absolute top-16 inset-x-8 z-50 p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center shadow-2xl flex items-center justify-center gap-1.5 animate-fadeIn">
                <Check className="h-4 w-4" />
                <span>Reel Link Copied to Clipboard!</span>
              </div>
            )}
          </div>

          {/* DESKTOP SIDE UP/DOWN FLOATING NAVIGATION CONTROLS */}
          <div className="hidden sm:flex flex-col items-center gap-3 absolute right-6 md:right-12 z-50">
            <button
              onClick={goToPrevReel}
              disabled={activeIndex === 0}
              className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-90 shadow-xl"
              title="Previous Reel (Scroll Up - Arrow Up)"
            >
              <ChevronUp className="h-6 w-6" />
            </button>

            <span className="text-[10px] font-mono font-black text-white/70 uppercase tracking-widest text-center">
              SCROLL<br />UP / DOWN
            </span>

            <button
              onClick={goToNextReel}
              disabled={activeIndex === filteredReels.length - 1}
              className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer hover:scale-110 active:scale-90 shadow-xl"
              title="Next Reel (Scroll Down - Arrow Down)"
            >
              <ChevronDown className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
