"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, ArrowLeft, Calendar, Tag, ChevronRight, AlertCircle, Phone, ShoppingBag, X, MessageCircle, Check, Share2, Copy } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Form Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
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
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

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
    // Pre-populate name and phone from localStorage if available
    const savedName = localStorage.getItem('ld_user_name') || '';
    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    setOrderName(savedName);
    setOrderPhone(savedPhone);
  }, [showOrderModal]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    // Save to localStorage to keep visitor info synced
    localStorage.setItem('ld_user_registered', 'true');
    localStorage.setItem('ld_user_name', orderName.trim());
    localStorage.setItem('ld_user_phone', orderPhone.trim());

    const absoluteImageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${window.location.origin}${product.image.startsWith('/') ? '' : '/'}${product.image}`) : '';

    const baseMessageBody = `*Product Details:*
- Name: ${product.title}
- Category: ${product.category}
- Price: ${product.price && product.price > 0 ? `₹${product.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
${absoluteImageUrl ? `- Image URL: ${absoluteImageUrl}\n` : ''}
*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}
- Notes/Sizing/Address: ${orderNotes.trim() || 'No custom notes.'}`;

    const msgNagaraju = `Hello Nagaraju Garu! I would like to place an order/inquiry via LD Interiors & Furnitures:\n\n${baseMessageBody}`;
    const msgPavanSai = `Hello Pavan Sai Garu! I would like to place an order/inquiry via LD Interiors & Furnitures:\n\n${baseMessageBody}`;

    const waUrlNagaraju = `https://wa.me/916301290966?text=${encodeURIComponent(msgNagaraju)}`;
    const waUrlPavanSai = `https://wa.me/919346325291?text=${encodeURIComponent(msgPavanSai)}`;

    // 1. Open Mr. Nagaraju's WhatsApp in a new tab synchronously (allowed by browser)
    window.open(waUrlNagaraju, '_blank');

    setOrderSuccess(true);

    // 2. Save order in the database and wait for it
    try {
      await api.post('/orders', {
        name: orderName.trim(),
        phone: orderPhone.trim(),
        product: product.title,
        imageUrl: absoluteImageUrl,
        notes: orderNotes.trim() || 'No custom notes.'
      });
    } catch (err) {
      console.error('Error saving order record to database:', err);
    }

    // 3. Redirect current window to Pavan Sai (never blocked by browser)
    window.location.href = waUrlPavanSai;
    
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
      setOrderNotes('');
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
          <div className="overflow-hidden rounded-2xl border border-wood-border/40 bg-wood-cream/30 shadow-sm relative">
            <img
              src={images && images.length > 0 ? images[activeImageIndex] : image}
              alt={title}
              className="w-full h-auto object-contain max-h-[70vh] mx-auto"
            />
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
            {category}
          </span>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-wood-dark leading-tight">
            {title}
          </h1>
          <div className="mt-3 text-lg font-bold text-wood-accent">
            {price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Contact for Pricing'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-500">
            <span>{'★'.repeat(rating || 5)}{'☆'.repeat(5 - (rating || 5))}</span>
            <span className="text-wood-light text-[10px]">({rating || 5}.0 rating)</span>
          </div>

          {description && (
            <div className="mt-5 pt-4 border-t border-wood-border/30">
              <p className="text-[10px] uppercase font-bold tracking-wider text-wood-accent mb-1.5">Design Details</p>
              <p className="text-xs text-wood-medium leading-relaxed font-light whitespace-pre-wrap">{description}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-wood-border/30 space-y-4">
            <div className="flex items-center gap-3 text-wood-medium">
              <Calendar className="h-5 w-5 text-wood-light stroke-1.2" />
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-wood-accent">Date Uploaded</p>
                <p className="text-xs font-light mt-0.5">
                  {new Date(createdAt).toLocaleDateString('en-US', {
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
            <span className="text-[10px] uppercase font-bold tracking-wider text-wood-accent">Rate this Design</span>
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
                  {isRatingSubmitted ? 'Feedback submitted' : 'Click to submit feedback'}
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
                Contact Nagaraju for pricing & custom sizes
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Call Nagaraju */}
                <a
                  href="tel:+916281653998"
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                  title="Call Nagaraju (Manager)"
                >
                  <Phone className="h-4 w-4 text-wood-accent" />
                  <span>Call Nagaraju</span>
                </a>
                {/* Call Pavan Sai */}
                <a
                  href="tel:+919346325291"
                  className="flex-grow flex items-center justify-center gap-2 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                  title="Call Pavan Sai (Tech Admin)"
                >
                  <Phone className="h-4 w-4 text-wood-accent/80" />
                  <span>Call Pavan Sai</span>
                </a>
              </div>

              {/* Order via WhatsApp Button */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 shadow-md cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                Order Now
              </button>
            </div>

            {/* Share Design Button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-wood-accent hover:bg-wood-accent hover:text-wood-dark px-4 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-accent font-semibold"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Design</span>
            </button>

            <Link
              href="/products"
              className="block w-full text-center rounded-xl border border-wood-border hover:bg-wood-cream hover:text-wood-dark px-6 py-3.5 text-xs font-bold tracking-widest text-wood-light uppercase shadow-sm transition-colors duration-300"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Order Details Modal Popup */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
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
              <p className="text-[10px] uppercase font-bold tracking-widest text-wood-accent">Selected Item</p>
              <p className="text-xs font-semibold text-wood-dark mt-0.5">{title} ({category})</p>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder="Your contact number"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  Custom Sizing / Wood Details / Delivery Address
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows="3"
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
                  placeholder="e.g., 6x6 feet double bed, Teak Wood, delivery to Mulasthanam..."
                ></textarea>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[10px] text-amber-800 leading-relaxed font-medium">
                ⚠️ For the latest pricing, material selection, and final quotation, please speak with Mr. Nagaraju (+916281653998). Once the quotation is confirmed, we'll proceed with your order.
              </div>

              {orderSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <Check className="h-4.5 w-4.5 text-emerald-600 animate-bounce" />
                  <span>Redirecting to WhatsApp...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  Submit Order to WhatsApp (Both Admins)
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
    </div>
  );
}
