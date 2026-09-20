"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, ArrowLeft, Calendar, Tag, ChevronRight, ChevronLeft, AlertCircle, Phone, ShoppingBag, X, MessageCircle, Check, Share2, Copy, Play, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';
import ARRoomViewerModal from '@/components/ARRoomViewerModal';
import ProductCard from '@/components/ProductCard';
import CelebrationModal from '@/components/CelebrationModal';

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

const formatDate = (dateStr, isTelugu) => {
  if (!dateStr) return isTelugu ? 'అందుబాటులో ఉంది' : 'Available';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return isTelugu ? 'అందుబాటులో ఉంది' : 'Available';
    return d.toLocaleDateString(isTelugu ? 'te-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return isTelugu ? 'అందుబాటులో ఉంది' : 'Available';
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showARModal, setShowARModal] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  const { language = 'TE' } = useLanguage() || {};
  const langKey = (language && typeof language === 'string') ? language.toUpperCase() : 'TE';
  const t = translations[langKey] || translations.TE || {};
  const isTelugu = langKey === 'TE';

  const relatedScrollRef = useRef(null);
  const scrollRelatedLeft = () => {
    if (relatedScrollRef.current) {
      relatedScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };
  const scrollRelatedRight = () => {
    if (relatedScrollRef.current) {
      relatedScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Touch Swipe Carousel State
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && product && product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
    }
    if (isRightSwipe && product && product.images && product.images.length > 1) {
      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
    }
  };

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
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0`;
  };

  // Form Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `Check out this beautiful design: *${product?.title || 'Teakwood Design'}* (${product?.category || 'Furniture'}) from LD Interiors & Furnitures!\n\n👉 ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [plywoodBrand, setPlywoodBrand] = useState('Pure Teak Wood (No Plywood)');
  const [polishBrand, setPolishBrand] = useState('Asian Paints PU Polish');
  const [glueBrand, setGlueBrand] = useState('Fevicol Marine (Waterproof)');
  const [hardwareBrand, setHardwareBrand] = useState('Hettich Soft-Close Channels');

  // Rating states
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const handleRateProduct = async (starValue) => {
    if (isRatingSubmitted || isRatingLoading) return;
    setIsRatingLoading(true);
    setRatingMessage('');
    try {
      const response = await api.post(`/products/${id}/rate`, { rating: starValue });
      setUserRating(starValue);
      setIsRatingSubmitted(true);
      // Update local product average rating representation
      setProduct(prev => ({
        ...prev,
        rating: response.data.rating,
        ratingsCount: response.data.ratingsCount
      }));
      setRatingMessage(`Thank you! Rated ${starValue} Stars successfully.`);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setRatingMessage('Could not submit rating. Please try again.');
    } finally {
      setIsRatingLoading(false);
    }
  };

  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      // 1. Try fetching product from backend API
      try {
        const response = await api.get(`/products/${id}`);
        if (response.data && response.data._id) {
          const currentProd = response.data;
          setProduct(currentProd);
          setActiveImageIndex(0);
          setError(null);

          // Fetch related products in the same category
          try {
            const relRes = await api.get('/products');
            if (Array.isArray(relRes.data)) {
              let sameCategory = relRes.data.filter(
                p => p._id !== currentProd._id && p.category?.toLowerCase() === currentProd.category?.toLowerCase()
              );
              if (sameCategory.length < 20) {
                const others = relRes.data.filter(p => p._id !== currentProd._id && !sameCategory.some(s => s._id === p._id));
                sameCategory = [...sameCategory, ...others];
              }
              setRelatedProducts(sameCategory.slice(0, 20));
            }
          } catch (relErr) {
            console.warn('Could not fetch related products:', relErr);
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('API product fetch failed, checking fallbacks:', err.message);
      }

      // 2. Search cached products in sessionStorage
      try {
        const cachedProdStr = sessionStorage.getItem('ld_cached_products');
        if (cachedProdStr) {
          const cachedProds = JSON.parse(cachedProdStr);
          const match = cachedProds.find(p => p._id === id || p._id?.toString() === id);
          if (match) {
            setProduct(match);
            setActiveImageIndex(0);
            setError(null);
            setLoading(false);
            return;
          }
        }
      } catch (e) {}

      // 3. Fallback search in FALLBACK_PRODUCTS
      const fallbackMatch = FALLBACK_PRODUCTS.find(p => p._id === id || p._id?.toString() === id);
      if (fallbackMatch) {
        setProduct(fallbackMatch);
        setError(null);
        setLoading(false);
        return;
      }

      // 4. Try fetching all products to match ID
      try {
        const allRes = await api.get('/products');
        if (Array.isArray(allRes.data) && allRes.data.length > 0) {
          const matchInAll = allRes.data.find(p => p._id === id || p._id?.toString() === id);
          if (matchInAll) {
            setProduct(matchInAll);
            setError(null);
            setLoading(false);
            return;
          }
          // Default to first product if ID doesn't exist
          setProduct(allRes.data[0]);
          setError(null);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 5. Ultimate fallback if nothing matches
      setProduct(FALLBACK_PRODUCTS[0]);
      setError(null);
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    let savedName = '', savedPhone = '', savedEmail = '', savedAddress = '';
    try {
      savedName = localStorage.getItem('ld_user_name') || '';
      savedPhone = localStorage.getItem('ld_user_phone') || '';
      savedEmail = localStorage.getItem('ld_user_email') || '';
      savedAddress = localStorage.getItem('ld_user_address') || '';
    } catch (e) {}
    setOrderName(savedName);
    setOrderPhone(savedPhone);
    setOrderEmail(savedEmail);
    setOrderAddress(savedAddress);
    // Reset file and custom inputs
    setCustomSize('');
    setDesiredPrice('');
    setReferenceImageFile(null);
    setPlywoodBrand('Pure Teak Wood (No Plywood)');
    setPolishBrand('Asian Paints PU Polish');
    setGlueBrand('Fevicol Marine (Waterproof)');
    setHardwareBrand('Hettich Soft-Close Channels');
  }, [showOrderModal]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    setFormError('');

    const cleanPhone = orderPhone.trim().replace(/\D/g, '');
    if (!orderName.trim()) {
      setFormError('⚠️ Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setFormError('⚠️ Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!orderEmail.trim() || !orderEmail.includes('@')) {
      setFormError('⚠️ Please enter a valid Gmail / Email address.');
      return;
    }
    if (!orderAddress.trim()) {
      setFormError('⚠️ Please enter your full delivery address.');
      return;
    }

    setOrderSuccess(true);
    
    // Save to localStorage to keep visitor info synced
    localStorage.setItem('ld_user_registered', 'true');
    localStorage.setItem('ld_user_name', orderName.trim());
    localStorage.setItem('ld_user_phone', cleanPhone);
    localStorage.setItem('ld_user_email', orderEmail.trim());
    localStorage.setItem('ld_user_address', orderAddress.trim());

    // Dispatch login event to sync across navbar and account portal
    window.dispatchEvent(new Event('storage'));

    const currentProdTitle = product?.title || 'Custom Teakwood Design';
    const currentProdId = product?._id ? product._id.toString() : 'N/A';
    const currentProdPrice = product?.price && product.price > 0 ? product.price : 0;
    const absoluteImageUrl = product?.image ? (product.image.startsWith('http') ? product.image : `${window.location.origin}${product.image.startsWith('/') ? '' : '/'}${product.image}`) : '';

    const finalNotes = `[Material Selections]
Plywood Brand: ${plywoodBrand}
Polish/Finish: ${polishBrand}
Glue/Adhesive: ${glueBrand}
Hardware/Channels: ${hardwareBrand}

[Customer Customization Notes]
${orderNotes.trim() || 'No custom notes.'}`;

    let createdOrder = null;

    try {
      const formData = new FormData();
      formData.append('name', orderName.trim());
      formData.append('phone', cleanPhone);
      formData.append('email', orderEmail.trim());
      formData.append('address', orderAddress.trim());
      formData.append('product', currentProdTitle);
      formData.append('notes', finalNotes);
      formData.append('productId', currentProdId);
      if (customSize.trim()) formData.append('customSize', customSize.trim());
      if (desiredPrice.trim()) formData.append('desiredPrice', desiredPrice.trim());
      if (referenceImageFile) {
        formData.append('referenceImage', referenceImageFile);
      } else {
        formData.append('imageUrl', absoluteImageUrl);
      }

      const response = await api.post('/orders', formData);
      createdOrder = response.data;
    } catch (err) {
      console.warn('Backend order post handled safely:', err.message);
      createdOrder = {
        _id: `LD-LOCAL-${Date.now()}`,
        name: orderName.trim(),
        phone: cleanPhone,
        product: currentProdTitle,
        imageUrl: absoluteImageUrl
      };
    }

    const safeOrder = createdOrder || {
      _id: `LD-LOCAL-${Date.now()}`,
      imageUrl: absoluteImageUrl
    };

    const orderImage = safeOrder.imageUrl || absoluteImageUrl;
    const mainProductUrl = `https://www.ldinteriors.in/products/${currentProdId}`;

    const msgNagaraju = `Hello Nagaraju Garu! New order placed on website:

📦 Product: ${currentProdTitle} (ID: #${currentProdId})
👤 Customer: ${orderName.trim()} (${cleanPhone})
📧 Email: ${orderEmail.trim()}
📍 Address: ${orderAddress.trim()}
💰 Price: ${currentProdPrice > 0 ? `₹${currentProdPrice.toLocaleString('en-IN')}` : 'Contact for pricing'}
🌐 Product Link: ${mainProductUrl}
${orderImage ? `🖼️ Main Design Image: ${orderImage}\n` : ''}`;

    const waUrlNagaraju = `https://wa.me/916281653998?text=${encodeURIComponent(msgNagaraju)}`;

    // Trigger Celebration Modal with Victory Chime
    setCelebrationData({
      product: currentProdTitle,
      image: orderImage,
      _id: safeOrder._id,
      phone: cleanPhone,
      email: orderEmail.trim(),
      waUrl: waUrlNagaraju
    });

    setShowOrderModal(false);
    setOrderSuccess(false);
    setOrderNotes('');
    setCustomSize('');
    setDesiredPrice('');
    setReferenceImageFile(null);
    setShowCelebrationModal(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-wood-light" />
          <p className="text-sm text-wood-light font-light animate-pulse">Loading design details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4 stroke-1" />
        <h2 className="font-serif text-2xl font-bold text-wood-dark">Design Not Found</h2>
        <p className="mt-3 text-sm text-wood-light font-light leading-relaxed">{error || "The requested item is not available."}</p>
        <button
          onClick={() => router.push('/products')}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-wood-dark px-6 py-2.5 text-xs font-semibold tracking-wider text-white hover:bg-wood-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Gallery
        </button>
      </div>
    );
  }

  const { title = "Teakwood Design", category = "Doors", image, images = [], createdAt, price = 0, description = "", rating = 5 } = product || {};

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Breadcrumbs navigation */}
      <div className="flex items-center justify-between mb-8 border-b border-wood-border/30 pb-6">
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5 transform transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-wood-light font-light">
          <Link href="/" className="hover:text-wood-medium">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-wood-medium">Designs</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-wood-dark font-semibold truncate max-w-[200px]">{title}</span>
        </div>
      </div>

      {/* Main product structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Col: High-Res Image Display with Thumbnails */}
        <div className="lg:col-span-8">
          <div 
            onClick={() => setShowLightbox(true)}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="overflow-hidden rounded-2xl border border-wood-border/40 bg-wood-cream/30 shadow-sm relative cursor-zoom-in group select-none touch-pan-y"
          >
            <img
              src={images && images.length > 0 ? images[activeImageIndex] : image}
              alt={title}
              draggable="false"
              className="w-full h-auto object-contain max-h-[70vh] mx-auto transition-transform duration-500 group-hover:scale-[1.01]"
            />
            {/* Play Button Overlay for Videos */}
            {product.video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors duration-300">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-full text-wood-dark shadow-xl border border-wood-border/30 transform transition-transform group-hover:scale-110 duration-350">
                  <Play className="h-8 w-8 fill-current text-wood-dark ml-0.5" />
                </div>
              </div>
            )}

            {/* Left/Right Swipe Navigation Arrows overlay */}
            {images && images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                  }}
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 hover:scale-105 active:scale-95 text-white p-2 rounded-full z-20 backdrop-blur-xs transition-all cursor-pointer border border-white/10 flex items-center justify-center"
                  title="Previous Image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 hover:scale-105 active:scale-95 text-white p-2 rounded-full z-20 backdrop-blur-xs transition-all cursor-pointer border border-white/10 flex items-center justify-center"
                  title="Next Image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Carousel Dot Indicators overlay */}
            {images && images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/25 px-2.5 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
                {images.map((_, dotIdx) => (
                  <span 
                    key={dotIdx}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === activeImageIndex ? 'bg-wood-accent w-3.5' : 'bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {images && images.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                    idx === activeImageIndex
                      ? 'border-wood-accent shadow-md scale-105'
                      : 'border-wood-border/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${title} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Info/Meta Box */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 bg-wood-cream border border-wood-border/60 rounded-2xl p-6 sm:p-8 shadow-sm text-left">
          <span className="inline-flex items-center gap-1.5 bg-wood-beige border border-wood-border/40 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-wood-accent mb-6">
            <Tag className="h-3 w-3" />
            {isTelugu && category === "Gummalu" ? "గుమ్మాలు" : isTelugu && category === "Puja Mandiralu" ? "పూజ మందిరాలు" : category}
          </span>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-wood-dark leading-tight">
            {title}
          </h1>
          <div className="mt-3 text-lg font-bold text-wood-accent">
            {price && price > 0 ? (
              <span>
                {isTelugu ? "ధర" : "Price"}: <span className="font-bold text-xl">₹{price.toLocaleString('en-IN')}</span>
              </span>
            ) : (
              <span className="text-base sm:text-lg">{isTelugu ? "ధర కొరకు సంప్రదించండి" : "Contact Nagaraju for pricing"}</span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
            <span>{'★'.repeat(rating || 5)}{'☆'.repeat(5 - (rating || 5))}</span>
            <span className="text-wood-light text-[10px]">({rating || 5}.0 {isTelugu ? "రేటింగ్" : "rating"})</span>
          </div>

          {description && (
            <div className="mt-5 pt-4 border-t border-wood-border/30">
              <p className="text-[10px] uppercase font-bold tracking-wider text-wood-accent mb-1.5">{isTelugu ? "డిజైన్ వివరాలు" : "Design Details"}</p>
              <p className="text-xs text-wood-medium leading-relaxed font-light whitespace-pre-wrap">{description}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-wood-border/30 space-y-4">
            <div className="flex items-center gap-3 text-wood-medium">
              <Calendar className="h-5 w-5 text-wood-light stroke-1.2" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-wood-accent">{isTelugu ? "అప్‌లోడ్ చేసిన తేదీ" : "Date Uploaded"}</p>
                <p className="text-xs font-light mt-0.5">
                  {formatDate(createdAt, isTelugu)}
                </p>
              </div>
            </div>
          </div>

          {/* User Feedback Star Rating Widget */}
          <div className="mt-6 pt-5 border-t border-wood-border/30 text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-wood-accent">{t.rateTitle}</span>
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isHighlighted = isRatingSubmitted 
                    ? star <= userRating 
                    : star <= (hoverRating || userRating);
                  return (
                    <button
                      key={star}
                      disabled={isRatingSubmitted || isRatingLoading}
                      onClick={() => handleRateProduct(star)}
                      onMouseEnter={() => !isRatingSubmitted && setHoverRating(star)}
                      onMouseLeave={() => !isRatingSubmitted && setHoverRating(0)}
                      className={`text-xl transition-all duration-150 cursor-pointer ${
                        isRatingSubmitted ? 'opacity-80' : 'hover:scale-125'
                      } ${isHighlighted ? 'text-amber-500 scale-110' : 'text-neutral-300'}`}
                      title={`Rate ${star} Stars`}
                    >
                      ★
                    </button>
                  );
                })}
                <span className="text-[10px] text-wood-light font-light ml-1">
                  {isRatingSubmitted ? (isTelugu ? 'సమీక్ష సమర్పించబడింది' : 'Feedback submitted') : (isTelugu ? 'సమీక్షను సబ్మిట్ చేయడానికి క్లిక్ చేయండి' : 'Click to submit feedback')}
                </span>
              </div>
              {ratingMessage && (
                <p className={`text-[10px] font-semibold mt-1 animate-fadeIn ${
                  isRatingSubmitted ? 'text-emerald-700 font-medium' : 'text-red-650'
                }`}>
                  {ratingMessage}
                </p>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {/* Actions Grid */}
            <div className="flex flex-col gap-3">
              {/* Call for Pricing Note */}
              <div className="text-[10px] sm:text-xs text-wood-light text-center font-medium italic mt-0.5 leading-none">
                {isTelugu ? "ధర మరియు సైజు వివరాల కోసం:" : "Contact Nagaraju for pricing & custom sizes"}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Call Nagaraju */}
                <a
                  href="tel:+916281653998"
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                  title="Call Nagaraju (Owner)"
                >
                  <Phone className="h-4 w-4 text-wood-accent" />
                  <span>{isTelugu ? "నాగరాజు (యజమాని)" : "Nagaraju (Owner)"}</span>
                </a>
                {/* Call Pavan Sai */}
                <a
                  href="tel:+919346325291"
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                  title="Call Pavan Sai (Tech Admin)"
                >
                  <Phone className="h-4 w-4 text-wood-accent/80" />
                  <span>{isTelugu ? "సపోర్ట్ కాల్" : "Call Admin"}</span>
                </a>
              </div>

              {/* Order via WhatsApp Button */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                {t.orderBtn}
              </button>
            </div>

            {/* See Design in Room (AR & 3D Simulator) Button */}
            <button
              onClick={() => setShowARModal(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#008DDA] hover:bg-[#0077B6] text-white px-4 py-3.5 text-xs font-black tracking-widest uppercase transition-all duration-300 shadow-md cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isTelugu ? "గదిలో డిజైన్ పెట్టి చూడండి (AR 3D)" : "See Design in Your Room (AR 3D)"}</span>
            </button>

            {/* Share Design Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-wood-accent hover:bg-wood-accent hover:text-wood-dark px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-accent font-semibold"
            >
              <Share2 className="h-4 w-4" />
              <span>{isTelugu ? "డిజైన్ షేర్ చేయండి" : "Share Design"}</span>
            </button>

            {/* Render AR Room Viewer Modal */}
            {showARModal && (
              <ARRoomViewerModal product={product} onClose={() => setShowARModal(false)} />
            )}

            <Link
              href="/products"
              className="block w-full text-center rounded-xl border border-wood-border hover:bg-wood-cream hover:text-wood-dark px-6 py-3.5 text-xs font-bold tracking-widest text-wood-light uppercase shadow-sm transition-colors duration-300"
            >
              {t.backToGallery}
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products Horizontal Scroll Carousel Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 animate-fadeIn text-left relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">
                {isTelugu ? "సంబంధిత డిజైన్లు (సైడ్‌కి స్క్రోల్ చేయండి ➔)" : "Recommended Designs (Scroll Sideways ➔)"}
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                {isTelugu ? `ఇతర ${product?.category} డిజైన్లు` : `Related ${product?.category} Teakwood Designs`}
              </h2>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Left and Right Scroll Navigation Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700">
                <button
                  onClick={scrollRelatedLeft}
                  className="p-1.5 rounded-full hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Scroll Left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={scrollRelatedRight}
                  className="p-1.5 rounded-full hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Scroll Right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={`/products?category=${encodeURIComponent(product?.category || '')}`}
                className="text-xs font-bold text-[#008DDA] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{isTelugu ? "అన్నీ చూడండి" : "View All"}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Horizontally Scrollable Cards Container */}
          <div
            ref={relatedScrollRef}
            className="flex overflow-x-auto gap-3.5 sm:gap-4 py-3 pb-6 px-1 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-slate-100 dark:scrollbar-track-slate-900 snap-x snap-mandatory scroll-smooth"
          >
            {relatedProducts.map((relProd) => (
              <Link
                key={relProd._id}
                href={`/products/${relProd._id}`}
                className="w-[110px] sm:w-[130px] md:w-[140px] shrink-0 snap-start bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 sm:p-2 shadow-xs hover:shadow-md transition-all group text-left block hover:-translate-y-0.5"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 mb-1.5 relative">
                  <img
                    src={relProd.image}
                    alt={relProd.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[7px] font-mono px-1 py-0.2 rounded">
                    #{String(relProd._id || '').slice(-6).toUpperCase()}
                  </span>
                </div>
                <span className="text-[7.5px] font-black uppercase text-[#008DDA] tracking-wider block truncate">
                  {relProd.category}
                </span>
                <h4 className="text-[10px] font-bold text-slate-900 dark:text-white line-clamp-1 mt-0.5 group-hover:text-[#008DDA] transition-colors">
                  {relProd.title}
                </h4>
                <p className="text-[9.5px] font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center justify-between">
                  <span>{relProd.price && relProd.price > 0 ? `₹${relProd.price.toLocaleString('en-IN')}` : 'Check Price'}</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal Popup */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-6 shadow-2xl relative overflow-y-auto max-h-[85vh] text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-lg font-bold text-wood-dark">
                Order Design
              </h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-wood-accent">{isTelugu ? "ఎంపిక చేసిన డిజైన్" : "Selected Item"}</p>
              <p className="text-xs font-semibold text-wood-dark mt-0.5">{title} ({isTelugu && category === "Gummalu" ? "గుమ్మాలు" : isTelugu && category === "Puja Mandiralu" ? "పూజ మందిరాలు" : category})</p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder={isTelugu ? "మీ పూర్తి పేరు వ్రాయండి" : "Your full name"}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.phoneNumber}
                </label>
                <input
                  type="tel"
                  required
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder={isTelugu ? "మీ వాట్సాప్ నెంబర్" : "Your contact number"}
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.gmail}
                </label>
                <input
                  type="email"
                  required
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder="name@gmail.com"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.address}
                </label>
                <input
                  type="text"
                  required
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder={isTelugu ? "ఇంటి నెంబర్, వీధి, ఊరు, పిన్‌కోడ్" : "House No, Street, City, Pincode"}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                    {t.customSize}
                  </label>
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                    placeholder={t.customSizePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                    {t.budget}
                  </label>
                  <input
                    type="text"
                    value={desiredPrice}
                    onChange={(e) => setDesiredPrice(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                    placeholder={t.budgetPlaceholder}
                  />
                </div>
              </div>



              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.refImage}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReferenceImageFile(e.target.files[0])}
                  className="w-full text-xs text-wood-dark file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:tracking-wider file:bg-wood-beige file:text-wood-accent hover:file:bg-wood-accent hover:file:text-white file:transition-colors file:cursor-pointer cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  {t.customNotes}
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows="2"
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
                  placeholder={t.customNotesPlaceholder}
                ></textarea>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-900 leading-relaxed font-semibold">
                ⚠️ <strong>MUST ENTER VALID DETAILS:</strong> దయచేసి మీ యొక్క నికరమైన పేరు, 10-అంకెల ఫోన్ నంబర్, ఈమెయిల్ మరియు ఆర్డర్ డెలివరీ అడ్రస్ తప్పనిసరిగా ఇవ్వగలరు. వర్క్‌షాప్‌లో మీ ఆర్డర్ ఖరారు చేయడానికి మా టీమ్ మిమ్మల్ని ఫోన్ ద్వారా సంప్రదిస్తారు.
              </div>

              {orderSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[11px] text-emerald-800 flex items-center gap-1.5 font-bold">
                  <Check className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                  <span>{t.orderSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={orderSuccess}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {orderSuccess ? t.submitting : (isTelugu ? "ఆర్డర్ సబ్మిట్ చేయండి (Confirm Order)" : "Confirm & Submit Order")}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowShareModal(false)}>
          <div className="w-full max-w-sm bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-6 shadow-2xl relative text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <Share2 className="h-4 w-4 text-wood-accent" />
                Share Design
              </h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Design Title</p>
              <p className="text-xs font-semibold text-wood-dark mt-0.5">{title}</p>
            </div>

            <div className="space-y-3.5">
              {/* WhatsApp Share Button */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white py-2.5 text-xs font-bold tracking-wider uppercase transition-colors duration-300 cursor-pointer shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Share via WhatsApp
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
              Copy this link to share on Instagram posts, stories, or other platforms!
            </p>
          </div>
        </div>
      )}
      {/* Floating Lightbox Popup Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowLightbox(false)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute -top-10 right-2 sm:top-2 sm:-right-12 bg-white/15 hover:bg-white/25 border border-white/20 p-2.5 rounded-full text-white transition-all cursor-pointer shadow-lg z-50 hover:scale-105 active:scale-95"
              title="Close View"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Media Canvas container */}
            <div className="w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/45 shadow-2xl relative min-h-[300px]">
              {product.video ? (
                isYouTubeUrl(product.video) ? (
                  <div className="w-full aspect-video max-h-[75vh] max-w-full rounded-2xl overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(product.video)}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <video
                    src={product.video}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                    poster={images && images.length > 0 ? images[activeImageIndex] : image}
                  />
                )
              ) : (
                <img
                  src={images && images.length > 0 ? images[activeImageIndex] : image}
                  alt={title}
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl animate-scaleIn select-none"
                />
              )}
            </div>

            {/* Info and Actions Overlay Panel */}
            <div className="w-full max-w-2xl bg-wood-dark/90 backdrop-blur-md border border-wood-border/10 rounded-2xl p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-xl animate-fadeIn">
              <div className="text-center sm:text-left">
                <span className="text-[9px] uppercase font-bold tracking-widest text-wood-accent font-semibold">{category}</span>
                <h4 className="font-serif text-sm sm:text-base font-bold tracking-wide mt-0.5">{title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowLightbox(false);
                    setShowOrderModal(true);
                  }}
                  className="px-6 py-2.5 bg-wood-accent hover:brightness-110 active:scale-95 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 text-white cursor-pointer shadow-sm w-full sm:w-auto"
                >
                  Place Inquiry / Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Confetti Modal */}
      <CelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        orderData={celebrationData}
      />
    </div>
  );
}
