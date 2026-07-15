"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import api from '@/utils/api';
import { Loader2, MessageSquare, ArrowUp, ArrowDown, Volume2, VolumeX, Eye, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReelsPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
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
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('youtu.be/')) {
      const parts = url.split('youtu.be/');
      if (parts[1]) {
        videoId = parts[1].split(/[?#]/)[0];
      }
    } else if (url.includes('v=')) {
      const parts = url.split('v=');
      if (parts[1]) {
        videoId = parts[1].split(/[&?#]/)[0];
      }
    } else {
      videoId = url;
    }
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
  };

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const response = await api.get('/products');
        // Filter only products that have showcase video URLs
        const videoProducts = response.data.filter(p => p.video);
        setProducts(videoProducts);
      } catch (err) {
        console.error('Error fetching reels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReels();
  }, []);

  // Control video play/pause on index change or mute change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log("Auto-play blocked:", e));
    }
  }, [activeIdx, products]);

  const handleNext = () => {
    if (activeIdx < products.length - 1) {
      setActiveIdx(prev => prev + 1);
    } else {
      setActiveIdx(0); // loop back
    }
  };

  const handlePrev = () => {
    if (activeIdx > 0) {
      setActiveIdx(prev => prev - 1);
    } else {
      setActiveIdx(products.length - 1); // loop to end
    }
  };

  const currentProduct = products[activeIdx];

  const handleWhatsAppInquiry = (product) => {
    const message = isTelugu
      ? `నమస్తే నాగరాజు గారు! నేను మీ వర్క్‌షాప్ రీల్స్ ద్వారా *${product.title}* వీడియోను చూశాను. దీని సైజ్ కస్టమైజేషన్ మరియు తయారీ వివరాలు తెలుసుకోవాలనుకుంటున్నాను.\n\nవీడియో లింక్: ${product.video}`
      : `Hello Mr. Nagaraju! I saw your carpentry showcase video for *${product.title}* on your website reels. I would like to inquire about its customization, pricing, and delivery details.\n\nVideo: ${product.video}`;
    
    window.open(`https://wa.me/916301290966?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex min-h-[80vh] w-full flex-col items-center justify-center bg-wood-plank-bg">
        <Loader2 className="h-8 w-8 animate-spin text-wood-accent mb-2" />
        <p className="text-xs text-wood-light font-light animate-pulse">{t.loadingShowcase}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[85vh] w-full flex-col items-center justify-center p-6 text-center bg-wood-plank-bg">
        <div className="max-w-md bg-white/80 border border-wood-border/60 p-8 rounded-3xl shadow-lg">
          <HelpCircle className="mx-auto h-12 w-12 text-wood-accent mb-4 stroke-1" />
          <h3 className="text-lg font-serif font-bold text-wood-dark">{isTelugu ? "వీడియోలు ఏవీ లేవు" : "No Videos Showcase Yet"}</h3>
          <p className="mt-2 text-xs text-wood-light leading-relaxed font-light mb-6">
            {t.noVideosFound}
          </p>
          <Link 
            href="/products" 
            className="inline-block rounded-xl bg-wood-dark hover:bg-wood-dark/90 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {isTelugu ? "గ్యాలరీ చూడండి" : "Go to Gallery"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-neutral-950 flex flex-col justify-center items-center py-8 px-4 relative overflow-hidden">
      {/* Dynamic blurred background canvas */}
      {currentProduct.image && (
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 transition-all duration-700 -z-10"
          style={{ backgroundImage: `url('${currentProduct.image}')` }}
        ></div>
      )}

      {/* Title Header */}
      <div className="text-center mb-4 z-10">
        <h1 className="font-serif text-lg sm:text-2xl font-extrabold text-white tracking-wide gold-text-glow leading-none">
          {t.reelsTitle}
        </h1>
        <p className="text-[10px] sm:text-xs text-wood-cream/70 font-light mt-1.5 leading-none">
          {t.reelsDesc}
        </p>
      </div>

      {/* Main Reels Viewport */}
      <div className="relative w-full max-w-sm h-[70vh] min-h-[480px] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center">
        
        {/* Looping video element / YouTube Embed */}
        {isYouTubeUrl(currentProduct.video) ? (
          <iframe
            src={getYouTubeEmbedUrl(currentProduct.video)}
            title={currentProduct.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full object-cover scale-105"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentProduct.video}
            loop
            muted={isMuted}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Top controls: Mute overlay */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors border border-white/10 cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Right side controls: Navigation Arrows */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-30">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors border border-white/10 cursor-pointer shadow-md hover:scale-105"
            title="Previous Reel"
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </button>
          <div className="text-[10px] text-white/80 font-bold bg-black/60 py-1.5 rounded-full select-none text-center border border-white/5">
            {activeIdx + 1}/{products.length}
          </div>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition-colors border border-white/10 cursor-pointer shadow-md hover:scale-105"
            title="Next Reel"
          >
            <ArrowDown className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Bottom overlay: Product information */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-5 pt-10 text-left text-white z-20">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-wood-accent text-wood-dark text-[8.5px] font-extrabold uppercase tracking-wider mb-2">
            {currentProduct.category}
          </span>
          
          <h3 className="font-serif text-base sm:text-lg font-bold leading-tight line-clamp-1">{currentProduct.title}</h3>
          
          <p className="text-xs text-wood-accent font-semibold mt-1">
            {currentProduct.price && currentProduct.price > 0 ? (
              <span>₹{currentProduct.price.toLocaleString('en-IN')} ({t.estimated})</span>
            ) : (
              <span>{t.contactPricing}</span>
            )}
          </p>

          {/* Action Row */}
          <div className="flex gap-2.5 mt-4">
            <Link
              href={`/products/${currentProduct._id}`}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-accent hover:bg-amber-500 active:scale-98 text-wood-dark py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <Eye className="h-4 w-4" />
              <span>{isTelugu ? "డిజైన్ వివరాలు చూడండి" : "View Product Details"}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
