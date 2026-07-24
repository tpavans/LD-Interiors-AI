"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ShoppingBag, X, MessageCircle, Check, Share2, Copy, Play, Smartphone, Heart } from 'lucide-react';
import api from '../utils/api';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/utils/translations';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { _id, title, category, image, price, rating, createdAt } = product;
  const isNew = createdAt ? (new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24) <= 7 : false;
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];
  const isTelugu = language === 'TE';

  const formatImageUrl = (imgUrl) => {
    if (!imgUrl || typeof imgUrl !== 'string') return '/images/hero-bg.png';
    if (imgUrl.includes('res.cloudinary.com') && imgUrl.includes('/upload/') && !imgUrl.includes('f_auto')) {
      return imgUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
    }
    return imgUrl;
  };

  useEffect(() => {
    const checkLiked = () => {
      try {
        const liked = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
        setIsLiked(liked.includes(_id));
      } catch (err) {
        setIsLiked(false);
      }
    };
    checkLiked();
    window.addEventListener('storage', checkLiked);
    window.addEventListener('liked-updated', checkLiked);
    return () => {
      window.removeEventListener('storage', checkLiked);
      window.removeEventListener('liked-updated', checkLiked);
    };
  }, [_id]);

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const liked = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
      let updated;
      if (liked.includes(_id)) {
        updated = liked.filter(id => id !== _id);
      } else {
        updated = [...liked, _id];
      }
      localStorage.setItem('ld_liked_designs', JSON.stringify(updated));
      setIsLiked(updated.includes(_id));
      window.dispatchEvent(new Event('liked-updated'));
    } catch (err) {
      console.error('Failed to toggle liked design:', err);
    }
  };

  const handleCardClick = (e) => {
    // If user clicked inside active elements (buttons, inputs, links, modals), do not trigger navigation
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.modal') || e.target.closest('form')) {
      return;
    }
    router.push(`/products/${_id}`);
  };
  const [showLightbox, setShowLightbox] = useState(false);
  
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
  const [plywoodBrand, setPlywoodBrand] = useState('Pure Teak Wood (No Plywood)');
  const [polishBrand, setPolishBrand] = useState('Asian Paints PU Polish');
  const [glueBrand, setGlueBrand] = useState('Fevicol Marine (Waterproof)');
  const [hardwareBrand, setHardwareBrand] = useState('Hettich Soft-Close Channels');

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

    const absoluteImageUrl = image ? (image.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`) : '';

    // Save order in the database and wait for it (triggers email to Pavan Sai)
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
      formData.append('product', title);
      formData.append('notes', finalNotes);
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
- Price: ${price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Contact for pricing'}
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

  return (
    <>
      <div className="card-3d block">
        <div 
          onClick={handleCardClick}
          className="card-3d-inner group overflow-hidden rounded-3xl bg-white/85 backdrop-blur-md border border-wood-border/40 transition-all duration-500 ease-out shadow-lg hover:shadow-xl hover:border-wood-accent/30 glow-on-hover cursor-pointer"
        >
          <div 
            onClick={handleCardClick}
            className="block relative overflow-hidden aspect-[4/5] bg-wood-beige/10 cursor-pointer group"
          >
            <img
              src={formatImageUrl(image)}
              alt={title}
              loading="lazy"
              className="h-full w-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Play Button Overlay for Videos */}
            {product.video && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors duration-300">
                <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-full text-wood-dark shadow-xl border border-wood-border/30 transform transition-transform group-hover:scale-110 duration-350">
                  <Play className="h-6 w-6 fill-current text-wood-dark ml-0.5" />
                </div>
              </div>
            )}
            {/* Category Overlay */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest text-wood-accent shadow-sm border border-wood-border/30">
              {category}
            </div>
            {/* New Arrival Badge */}
            {isNew && (
              <div className="absolute top-12 left-4 bg-amber-500 text-wood-dark px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest shadow-sm border border-amber-600/20 z-10 animate-pulse">
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
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-wood-dark hover:bg-wood-accent hover:text-white transition-colors duration-300 shadow-sm border border-wood-border/30 cursor-pointer z-10"
              title="Share Design"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            {/* Like Overlay Button */}
            <button
              onClick={handleToggleLike}
              className="absolute top-14 right-4 bg-white/90 backdrop-blur-md p-2 rounded-full text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-colors duration-300 shadow-sm border border-wood-border/30 cursor-pointer z-10"
              title={isLiked ? "Remove from Liked Designs" : "Add to Liked Designs"}
            >
              <Heart className={`h-3.5 w-3.5 transition-transform duration-300 hover:scale-110 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase">
                {category}
              </span>
              <Link href={`/products/${_id}`} className="block mt-0.5 sm:mt-1">
                <h3 className="font-serif text-sm sm:text-base font-bold text-wood-dark hover:text-wood-accent transition-colors line-clamp-1">
                  {title}
                </h3>
              </Link>
              <div className="mt-1 flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs font-semibold text-wood-accent leading-snug">
                  {price && price > 0 ? (
                    <span>
                      {isTelugu ? "ధర" : "Price"}: <span className="font-extrabold text-wood-dark">₹{price.toLocaleString('en-IN')}</span>
                    </span>
                  ) : (
                    <span className="font-semibold text-wood-accent">{isTelugu ? "ధర కొరకు సంప్రదించండి" : "Contact Nagaraju for pricing"}</span>
                  )}
                </span>
                <span className="text-[10px] text-amber-400 font-bold tracking-wider filter drop-shadow-sm">
                  {'★'.repeat(rating || 5)}{'☆'.repeat(5 - (rating || 5))}
                </span>
              </div>
            </div>
            
            {/* Actions Grid */}
            <div className="flex flex-col gap-2.5">
              {/* Call for Pricing Note */}
              <div className="text-[8px] sm:text-[9px] text-wood-light text-center font-medium italic leading-none">
                {isTelugu ? "ధర మరియు సైజు వివరాల కోసం:" : "Get pricing & custom sizing info:"}
              </div>

              <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2">
                {/* Call Nagaraju */}
                <a
                  href="tel:+916281653998"
                  title="Call Nagaraju (Owner)"
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-wood-border/60 hover:border-wood-accent hover:text-wood-accent py-2 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-wood-dark"
                >
                  <Phone className="h-3 w-3 text-wood-accent shrink-0" />
                  <span>{isTelugu ? "నాగరాజు (యజమాని)" : "Nagaraju (Owner)"}</span>
                </a>
                {/* Call Pavan Sai */}
                <a
                  href="tel:+919346325291"
                  title="Call Pavan Sai (Tech Admin)"
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-wood-border/60 hover:border-wood-accent hover:text-wood-accent py-2 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer text-wood-dark"
                >
                  <Phone className="h-3 w-3 text-wood-accent/80 shrink-0" />
                  <span>{isTelugu ? "సపోర్ట్ కాల్" : "Call Admin"}</span>
                </a>
              </div>

              {/* Order / WhatsApp Details Button */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-2.5 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase transition-all duration-350 shadow-sm hover:shadow-wood-dark/20 cursor-pointer"
              >
                <ShoppingBag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{t.orderBtn}</span>
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
                {t.orderTitle}
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
                <video
                  src={product.video}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[75vh] object-contain rounded-2xl"
                  poster={image}
                />
              ) : (
                <img
                  src={image}
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
                  className="px-4 py-2 bg-wood-accent hover:brightness-110 active:scale-95 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-300 text-white cursor-pointer shadow-sm"
                >
                  Place Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
