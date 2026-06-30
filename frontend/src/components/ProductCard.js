"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, ShoppingBag, X, MessageCircle, Check, Share2, Copy } from 'lucide-react';
import api from '../utils/api';

export default function ProductCard({ product }) {
  const { _id, title, category, image, price, rating, createdAt } = product;
  const isNew = createdAt ? (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24) <= 7 : false;
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/products/${_id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const message = `Check out this beautiful design: *${title}* (${category}) from LD Interiors & Furnitures!\n\n👉 ${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  // Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [referenceImageFile, setReferenceImageFile] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

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

    const absoluteImageUrl = image ? (image.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`) : '';

    // Save order in the database and wait for it (triggers email to Pavan Sai)
    try {
      const formData = new FormData();
      formData.append('name', orderName.trim());
      formData.append('phone', orderPhone.trim());
      formData.append('email', orderEmail.trim());
      formData.append('address', orderAddress.trim());
      formData.append('product', title);
      formData.append('notes', orderNotes.trim() || 'No custom notes.');
      formData.append('productId', _id);
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
- Name: ${title}
- Category: ${category}
- Price: ${price && price > 0 ? `₹${price.toLocaleString('en-IN')} (Estimated)` : 'Contact for pricing'}
${orderImage ? `- Image URL: ${orderImage}\n` : ''}
*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}
- Gmail: ${orderEmail.trim()}
- Delivery Address: ${orderAddress.trim()}
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

  return (
    <>
      <div className="card-3d block">
        <div className="card-3d-inner group overflow-hidden rounded-2xl bg-wood-cream border border-wood-border/50 transition-all duration-500 ease-out shadow-lg">
          <Link href={`/products/${_id}`} className="block relative overflow-hidden aspect-[4/5] bg-wood-beige/25">
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Category Overlay */}
            <div className="absolute top-4 left-4 bg-wood-cream/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-wood-accent shadow-sm border border-wood-border/30">
              {category}
            </div>
            {/* New Arrival Badge */}
            {isNew && (
              <div className="absolute top-12 left-4 bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest shadow-sm border border-blue-700/20 z-10 animate-pulse">
                New Arrival
              </div>
            )}
            {/* Share Overlay Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="absolute top-4 right-4 bg-wood-cream/90 backdrop-blur-md p-2 rounded-full text-wood-dark hover:bg-wood-accent hover:text-white transition-colors duration-300 shadow-sm border border-wood-border/30 cursor-pointer z-10"
              title="Share Design"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </Link>
          <div className="p-3 sm:p-5 flex flex-col gap-2.5 sm:gap-4">
            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase">
                {category}
              </span>
              <Link href={`/products/${_id}`} className="block mt-0.5 sm:mt-1">
                <h3 className="font-serif text-sm sm:text-base font-bold text-wood-dark hover:text-wood-light transition-colors line-clamp-1 font-semibold">
                  {title}
                </h3>
              </Link>
              <div className="mt-0.5 sm:mt-1 flex flex-col gap-0.5">
                <span className="text-[10px] sm:text-xs font-semibold text-wood-accent leading-snug">
                  {price && price > 0 ? (
                    <span>
                      Estimated Price: <span className="font-bold">₹{price.toLocaleString('en-IN')}</span>
                      <br />
                      <span className="text-[8.5px] sm:text-[9.5px] font-normal text-wood-light">(Contact Nagaraju for fixed price)</span>
                    </span>
                  ) : (
                    <span>Contact Nagaraju for pricing</span>
                  )}
                </span>
                <span className="text-[10px] text-amber-500 font-bold tracking-wider">
                  {'★'.repeat(rating || 5)}{'☆'.repeat(5 - (rating || 5))}
                </span>
              </div>
            </div>
            
            {/* Actions Grid */}
            <div className="flex flex-col gap-2">
              {/* Call for Pricing Note */}
              <div className="text-[8.5px] sm:text-[9.5px] text-wood-light text-center font-medium italic mt-0.5 leading-none">
                Contact Nagaraju for pricing & custom sizes
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                {/* Call Nagaraju */}
                <a
                  href="tel:+916281653998"
                  title="Call Nagaraju (Manager)"
                  className="flex-grow flex items-center justify-center gap-1.5 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-1.5 py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-wood-accent" />
                  <span>Call Nagaraju</span>
                </a>
                {/* Call Pavan Sai */}
                <a
                  href="tel:+919346325291"
                  title="Call Pavan Sai (Tech Admin)"
                  className="flex-grow flex items-center justify-center gap-1.5 rounded-xl border border-wood-border hover:border-wood-accent hover:text-wood-accent px-1.5 py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
                >
                  <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-wood-accent/80" />
                  <span>Call Pavan</span>
                </a>
              </div>

              {/* Order / WhatsApp Details Button */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-2 sm:py-2.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-colors duration-300 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>Order Now</span>
              </button>
            </div>
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
                  Mobile Number *
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
                  Gmail/Email Address *
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
                  Delivery Address *
                </label>
                <input
                  type="text"
                  required
                  value={orderAddress}
                  onChange={(e) => setOrderAddress(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  placeholder="House No, Street, City, Pincode"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                    Custom Size (Optional)
                  </label>
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                    placeholder="e.g., 6x7 feet"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                    Your Budget (Optional)
                  </label>
                  <input
                    type="text"
                    value={desiredPrice}
                    onChange={(e) => setDesiredPrice(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                    placeholder="e.g., ₹25,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-wood-accent mb-1">
                  Upload Reference Image (Optional)
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
                  Custom Notes / Special Requests (Optional)
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows="2"
                  className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark placeholder-neutral-400 font-light"
                  placeholder="e.g., Teak Wood, specific carving..."
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
                disabled={orderSuccess}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-650 px-4 py-3 text-xs font-bold tracking-widest text-white uppercase shadow-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {orderSuccess ? 'Submitting Order...' : 'Submit Order to WhatsApp (Both Admins)'}
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
    </>
  );
}
