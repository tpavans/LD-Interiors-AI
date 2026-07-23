"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, ArrowLeft, Calendar, Tag, ChevronRight, ChevronLeft, AlertCircle, Phone, ShoppingBag, X, MessageCircle, Check, Share2, Copy, Play } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

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
    const message = `Check out this beautiful design: *${product?.title}* (${product?.category}) from LD Interiors & Furnitures!\n\n👉 ${shareUrl}`;
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

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setActiveImageIndex(0);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('We couldn\'t load this design. It may have been deleted or the link is invalid.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    // Pre-populate fields from localStorage if available
    const savedName = localStorage.getItem('ld_user_name') || '';
    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    const savedEmail = localStorage.getItem('ld_user_email') || '';
    const savedAddress = localStorage.getItem('ld_user_address') || '';
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
    
    setOrderSuccess(true);
    
    // Save to localStorage to keep visitor info synced
    localStorage.setItem('ld_user_registered', 'true');
    localStorage.setItem('ld_user_name', orderName.trim());
    localStorage.setItem('ld_user_phone', orderPhone.trim());
    localStorage.setItem('ld_user_email', orderEmail.trim());
    localStorage.setItem('ld_user_address', orderAddress.trim());

    // Dispatch login event to sync across navbar and account portal
    window.dispatchEvent(new Event('storage'));

    const absoluteImageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${window.location.origin}${product.image.startsWith('/') ? '' : '/'}${product.image}`) : '';

    try {
      const finalNotes = `[Material Selections]
Plywood Brand: ${plywoodBrand}
Polish/Finish: ${polishBrand}
Glue/Adhesive: ${glueBrand}
Hardware/Channels: ${hardwareBrand}

[Customer Customization Notes]
${orderNotes.trim() || 'No custom notes.'}`;

      const formData = new FormData();
      formData.append('name', orderName.trim());
      formData.append('phone', orderPhone.trim());
      formData.append('email', orderEmail.trim());
      formData.append('address', orderAddress.trim());
      formData.append('product', product.title);
      formData.append('notes', finalNotes);
      formData.append('productId', product._id);
      if (customSize.trim()) formData.append('customSize', customSize.trim());
      if (desiredPrice.trim()) formData.append('desiredPrice', desiredPrice.trim());
      if (referenceImageFile) {
        formData.append('referenceImage', referenceImageFile);
      } else {
        formData.append('imageUrl', absoluteImageUrl);
      }

      const response = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const createdOrder = response.data;
      const orderImage = createdOrder.imageUrl || absoluteImageUrl;

      const baseMessageBody = `*Product Details:*
- Name: ${product.title}
- Category: ${product.category}
- Price: ${product.price && product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
${orderImage ? `- Image URL: ${orderImage}\n` : ''}
*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}
- Gmail: ${orderEmail.trim()}
- Delivery Address: ${orderAddress.trim()}
*Material Selections (High-Quality Brands):*
- Plywood Brand: ${plywoodBrand}
- Polish/Finish Type: ${polishBrand}
- Adhesive/Glue: ${glueBrand}
- Drawer Channels/Hardware: ${hardwareBrand}
${customSize.trim() ? `- Custom Size: ${customSize.trim()}\n` : ''}${desiredPrice.trim() ? `- Desired Budget: ${desiredPrice.trim()}\n` : ''}- Notes/Customization: ${orderNotes.trim() || 'No custom notes.'}`;

      const msgNagaraju = `Hello Nagaraju Garu! I would like to place an order/inquiry via LD Interiors & Furnitures:\n\n${baseMessageBody}`;
      const waUrlNagaraju = `https://wa.me/916301290966?text=${encodeURIComponent(msgNagaraju)}`;

      // Redirect the current tab to WhatsApp directly to bypass mobile popup blockers
      window.location.href = waUrlNagaraju;
    } catch (err) {
      console.error('Error saving order record to database:', err);
      alert('Failed to place order. Please check that you entered valid details.');
    }
    
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
      setOrderNotes('');
      setCustomSize('');
      setDesiredPrice('');
      setReferenceImageFile(null);
    }, 2000);
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

  const { title, category, image, images, createdAt, price, description, rating } = product;

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
                  {new Date(createdAt).toLocaleDateString(isTelugu ? 'te-IN' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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
                  title="Call Nagaraju (Manager)"
                >
                  <Phone className="h-4 w-4 text-wood-accent" />
                  <span>{isTelugu ? "యజమాని కాల్" : "Call Owner"}</span>
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

            {/* Share Design Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-wood-accent hover:bg-wood-accent hover:text-wood-dark px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-accent font-semibold"
            >
              <Share2 className="h-4 w-4" />
              <span>{isTelugu ? "డిజైన్ షేర్ చేయండి" : "Share Design"}</span>
            </button>

            <Link
              href="/products"
              className="block w-full text-center rounded-xl border border-wood-border hover:bg-wood-cream hover:text-wood-dark px-6 py-3.5 text-xs font-bold tracking-widest text-wood-light uppercase shadow-sm transition-colors duration-300"
            >
              {t.backToGallery}
            </Link>
          </div>
        </div>
      </div>

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

              <div className="bg-wood-beige/30 p-3 rounded-2xl border border-wood-border/40 space-y-3">
                <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent font-semibold">{t.materialPref}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-wood-light mb-1">{t.plywoodBrand}</label>
                    <select
                      value={plywoodBrand}
                      onChange={(e) => setPlywoodBrand(e.target.value)}
                      className="w-full rounded-lg border border-wood-border bg-white px-2 py-1.5 text-[10px] text-wood-dark focus:outline-none"
                    >
                      <option value="Pure Teak Wood (No Plywood)">{isTelugu ? "ప్యూర్ టేకు కలప (ప్లైవుడ్ లేదు)" : "Pure Teak Wood (No Ply)"}</option>
                      <option value="CenturyPly (Club Prime)">CenturyPly (Club Prime)</option>
                      <option value="Greenply (Gold Platinum)">Greenply (Gold Platinum)</option>
                      <option value="Kitply (Boiling Water Resistant)">Kitply (BWR Marine)</option>
                      <option value="Local Gold Premium Plywood">Local Gold Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-wood-light mb-1">{t.polishBrand}</label>
                    <select
                      value={polishBrand}
                      onChange={(e) => setPolishBrand(e.target.value)}
                      className="w-full rounded-lg border border-wood-border bg-white px-2 py-1.5 text-[10px] text-wood-dark focus:outline-none"
                    >
                      <option value="Asian Paints PU Polish (Luxury)">Asian Paints PU</option>
                      <option value="Sheenlac Shellac & Sealer Finish">Sheenlac Shellac/Sealer</option>
                      <option value="Melamine Glossy/Matte Finish">Melamine Polish</option>
                      <option value="Natural Teak Oil Polish">Natural Teak Oil</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-wood-light mb-1">{t.glueBrand}</label>
                    <select
                      value={glueBrand}
                      onChange={(e) => setGlueBrand(e.target.value)}
                      className="w-full rounded-lg border border-wood-border bg-white px-2 py-1.5 text-[10px] text-wood-dark focus:outline-none"
                    >
                      <option value="Fevicol Marine (Waterproof Elite)">Fevicol Marine</option>
                      <option value="Fevicol SH (Standard Glue)">Fevicol SH</option>
                      <option value="Araldite Wood Adhesive">Araldite Adhesive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase tracking-wider text-wood-light mb-1">{t.channelsBrand}</label>
                    <select
                      value={hardwareBrand}
                      onChange={(e) => setHardwareBrand(e.target.value)}
                      className="w-full rounded-lg border border-wood-border bg-white px-2 py-1.5 text-[10px] text-wood-dark focus:outline-none"
                    >
                      <option value="Hettich Premium Soft-Close">Hettich Soft-Close</option>
                      <option value="Ebco Telescopic Channels">Ebco Telescopic</option>
                      <option value="Godrej Drawer Hardware">Godrej Channels</option>
                      <option value="Standard Smooth Ball-Bearing">Standard Runner</option>
                    </select>
                  </div>
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

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[10px] text-amber-800 leading-relaxed font-medium">
                ⚠️ {t.disclaimer}
              </div>

              {orderSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <Check className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                  <span>{t.orderSuccessMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={orderSuccess}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {orderSuccess ? t.submitting : (isTelugu ? "వాట్సాప్ ద్వారా ఆర్డర్ చేయండి" : "Submit Order to WhatsApp")}
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
    </div>
  );
}
