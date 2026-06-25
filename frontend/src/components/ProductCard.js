"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, ShoppingBag, X, MessageCircle, Check } from 'lucide-react';
import api from '../utils/api';

export default function ProductCard({ product }) {
  const { _id, title, category, image, price, rating } = product;
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Form State
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

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

    const absoluteImageUrl = image ? (image.startsWith('http') ? image : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`) : '';

    // Save order in the database
    try {
      await api.post('/orders', {
        name: orderName.trim(),
        phone: orderPhone.trim(),
        product: title,
        imageUrl: absoluteImageUrl,
        notes: orderNotes.trim() || 'No custom notes.'
      });
    } catch (err) {
      console.error('Error saving order record to database:', err);
    }

    const whatsappMessage = `Hello Pavan Sai! I would like to place an order/inquiry via LD Interiors & Furnitures:

*Product Details:*
- Name: ${title}
- Category: ${category}
- Price: ${price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Contact for pricing'}
${absoluteImageUrl ? `- Image URL: ${absoluteImageUrl}\n` : ''}
*Customer Details:*
- Name: ${orderName.trim()}
- Phone: ${orderPhone.trim()}
- Notes/Sizing/Address: ${orderNotes.trim() || 'No custom notes.'}`;

    const encodedMsg = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/919346325291?text=${encodedMsg}`;
    
    window.open(whatsappUrl, '_blank');
    setOrderSuccess(true);
    
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
      setOrderNotes('');
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
          </Link>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <span className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase">
                {category}
              </span>
              <Link href={`/products/${_id}`} className="block mt-1">
                <h3 className="font-serif text-base font-bold text-wood-dark hover:text-wood-light transition-colors line-clamp-1 font-semibold">
                  {title}
                </h3>
              </Link>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-wood-accent">
                  {price && price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Contact for Price'}
                </span>
                <span className="text-[10px] text-amber-500 font-bold tracking-wider">
                  {'★'.repeat(rating || 5)}{'☆'.repeat(5 - (rating || 5))}
                </span>
              </div>
            </div>
            
            {/* Actions Grid */}
            <div className="flex gap-2.5">
              {/* Call Admin Button */}
              <a
                href="tel:+919346325291"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-wood-border hover:border-wood-dark hover:bg-wood-dark hover:text-white px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 cursor-pointer text-wood-dark"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>

              {/* Order / WhatsApp Details Button */}
              <button
                onClick={() => setShowOrderModal(true)}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-3 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors duration-300 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Order
              </button>
            </div>
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
                Submit Order to WhatsApp
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
