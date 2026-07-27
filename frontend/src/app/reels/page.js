"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import api from '@/utils/api';
import { Loader2, Volume2, VolumeX, Eye, Play, X, Sparkles, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReelsPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations['EN'];
  const isTelugu = language === 'TE';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    
    if (url.includes('/shorts/')) {
      const parts = url.split('/shorts/');
      if (parts[1]) videoId = parts[1].split(/[?#]/)[0];
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) videoId = parts[1].split(/[?#]/)[0];
    } else if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) videoId = parts[1].split(/[&?#]/)[0];
    } else {
      videoId = url;
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
  };

  const DEFAULT_WORKSHOP_REELS = [
    {
      _id: "reel_door_1",
      title: "Hand-Carved Burma Teak Main Door Crafting",
      category: "Gummalu / Doors",
      image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      video: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      price: 45000,
    },
    {
      _id: "reel_mandir_1",
      title: "Teak Wood Royal Temple Hand Carving Showcase",
      category: "Puja Mandiralu",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
      video: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      price: 38000,
    },
    {
      _id: "reel_bed_1",
      title: "Luxury King Size Teakwood Bed Polish Process",
      category: "Wooden Beds",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      video: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      price: 52000,
    },
    {
      _id: "reel_sofa_1",
      title: "Chesterfield Teak Sofa Set Workshop Finish",
      category: "Living Room",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      video: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
      price: 65000,
    }
  ];

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await api.get('/products');
        let videoProducts = [];
        if (Array.isArray(response.data)) {
          videoProducts = response.data.filter(p => p.video && p.video.trim() !== '');
        }
        if (videoProducts.length === 0) {
          setProducts(DEFAULT_WORKSHOP_REELS);
        } else {
          setProducts(videoProducts);
        }
      } catch (err) {
        console.error('Error fetching reels:', err);
        setProducts(DEFAULT_WORKSHOP_REELS);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  const handleWhatsAppInquiry = (product) => {
    const message = isTelugu
      ? `నమస్తే నాగరాజు గారు! నేను మీ LD ఇంటీరియర్స్ వర్క్‌షాప్ రీల్ ద్వారా *${product.title}* వీడియోను చూశాను. దీని గురించి వివరాలు తెలుసుకోవాలనుకుంటున్నాను.\n\nవీడియో: ${product.video}`
      : `Hello Mr. Nagaraju! I watched your workshop reel for *${product.title}* on your LD Interiors website. I would like to inquire about this design.\n\nVideo: ${product.video}`;
    
    window.open(`https://wa.me/916301290966?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col items-center justify-center bg-[#FBF9F1]">
        <Loader2 className="h-8 w-8 animate-spin text-[#008DDA] mb-2" />
        <p className="text-xs text-slate-600 font-medium animate-pulse">Loading Video Reels Showcase...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#FBF9F1] py-8 px-4 sm:px-8 max-w-7xl mx-auto text-left select-none">
      {/* Header */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-[#008DDA] text-[10px] font-extrabold uppercase tracking-widest mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isTelugu ? "కార్పెంటరీ వీడియో షోకేస్" : "Master Carpentry Videos"}</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.reelsTitle || "Workshop Reels & Shorts"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal mt-2 leading-relaxed">
          {isTelugu 
            ? "మాములస్థానం వర్క్‌షాప్‌లో టేకు కలప చెక్కడాలు, పాలిష్ మరియు తయారీ లైవ్ వీడియోలను చూడటానికి ఏదైనా కార్డ్‌పై క్లిక్ చేయండి."
            : "Tap any video card below to watch high-definition woodworking, carving, and polishing reels from our workshop!"}
        </p>
      </div>

      {/* Grid of Small Clickable Reel Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
        {products.map((product) => (
          <div
            key={product._id}
            onClick={() => setActiveProduct(product)}
            className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Reel Thumbnail Card Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              />
              
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>

              {/* Play Badge Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-[#008DDA] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
                <Play className="h-3 w-3 fill-white" />
                <span>REEL</span>
              </div>

              {/* Center Play Button Pulse Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-11 w-11 rounded-full bg-white/30 backdrop-blur-md border border-white/60 flex items-center justify-center group-hover:scale-115 group-hover:bg-[#008DDA] transition-all shadow-lg">
                  <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[9px] font-bold text-sky-300 uppercase tracking-widest block truncate mb-0.5">
                  {product.category}
                </span>
                <h3 className="font-serif text-xs font-extrabold text-white line-clamp-1 group-hover:text-sky-200 transition-colors">
                  {product.title}
                </h3>
              </div>
            </div>

            {/* Bottom Details Footer */}
            <div className="p-3 bg-white flex items-center justify-between gap-1 text-left border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-500 font-medium">Price</p>
                <p className="text-xs font-black text-slate-900 font-mono">
                  {product.price && product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Custom Rate'}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-[#008DDA] font-bold text-[10px] uppercase tracking-wider group-hover:bg-[#008DDA] group-hover:text-white transition-all">
                Watch ▶
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* POPUP FULLSCREEN REEL MODAL PLAYER */}
      {activeProduct && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveProduct(null)}
        >
          <div 
            className="relative w-full max-w-sm h-[75vh] max-h-[620px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close & Audio Bar */}
            <div className="absolute top-4 inset-x-4 z-40 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Play className="h-3 w-3 fill-sky-400 text-sky-400" />
                <span>{activeProduct.category}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setActiveProduct(null)}
                  className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                  title="Close Reel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Reel Video Player */}
            <div className="relative flex-1 w-full h-full bg-black">
              {isYouTubeUrl(activeProduct.video) ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeProduct.video)}
                  title={activeProduct.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={activeProduct.video}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 text-left text-white space-y-3">
              <div>
                <h3 className="font-serif text-sm font-extrabold text-white truncate">{activeProduct.title}</h3>
                <p className="text-xs font-bold text-sky-400 mt-0.5 font-mono">
                  {activeProduct.price && activeProduct.price > 0 ? `₹${activeProduct.price.toLocaleString('en-IN')}` : 'Custom Rate'}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/products/${activeProduct._id}`}
                  onClick={() => setActiveProduct(null)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <Eye className="h-4 w-4 text-[#008DDA]" />
                  <span>View Product</span>
                </Link>

                <button
                  onClick={() => handleWhatsAppInquiry(activeProduct)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
