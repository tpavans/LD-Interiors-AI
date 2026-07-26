"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import api from '@/utils/api';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePaymentProduct, setActivePaymentProduct] = useState(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingAddress, setBookingAddress] = useState('');
  const [bookingPaymentType, setBookingPaymentType] = useState('50'); // '50' or '100'
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');

  const loadWishlistProducts = async () => {
    setLoading(true);
    try {
      const likedIds = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
      if (!likedIds || likedIds.length === 0) {
        setWishlistProducts([]);
        setLoading(false);
        return;
      }
      const response = await api.get('/products');
      const allProducts = response.data.products || response.data || [];
      const filtered = allProducts.filter(p => likedIds.includes(p._id));
      setWishlistProducts(filtered);
    } catch (err) {
      console.error('Failed to load wishlist products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistProducts();
    // Prefill user details from localStorage
    if (typeof window !== 'undefined') {
      setBookingName(localStorage.getItem('ld_user_name') || '');
      setBookingPhone(localStorage.getItem('ld_user_phone') || '');
      setBookingAddress(localStorage.getItem('ld_user_address') || '');
    }

    const handleUpdate = () => loadWishlistProducts();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('liked-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('liked-updated', handleUpdate);
    };
  }, []);

  const handleRemoveWishlist = (productId) => {
    try {
      const likedIds = JSON.parse(localStorage.getItem('ld_liked_designs') || '[]');
      const updated = likedIds.filter(id => id !== productId);
      localStorage.setItem('ld_liked_designs', JSON.stringify(updated));
      setWishlistProducts(prev => prev.filter(p => p._id !== productId));
      window.dispatchEvent(new Event('liked-updated'));
    } catch (err) {
      console.error('Failed to remove item from wishlist:', err);
    }
  };

  const handlePlaceOrderWithPayment = async (e) => {
    e.preventDefault();
    if (!activePaymentProduct) return;
    setIsSubmittingOrder(true);
    setOrderSuccessMsg('');

    try {
      const cleanPhone = bookingPhone.replace(/\D/g, '').slice(-10);
      const totalAmt = activePaymentProduct.price || activePaymentProduct.estimatePrice || 25000;
      const payableNow = bookingPaymentType === '50' ? Math.round(totalAmt * 0.5) : totalAmt;

      const orderData = {
        product: activePaymentProduct.name || activePaymentProduct.title,
        customerName: bookingName,
        phone: cleanPhone,
        address: bookingAddress,
        notes: `Wishlist booking - ${bookingPaymentType === '50' ? '50% Advance Online Booking' : 'Full Payment'}`,
        totalPrice: totalAmt,
        paidAmount: payableNow,
        imageUrl: activePaymentProduct.imageUrl
      };

      const res = await api.post('/orders', orderData);
      
      // Save phone to localStorage
      localStorage.setItem('ld_user_phone', cleanPhone);
      localStorage.setItem('ld_user_name', bookingName);
      localStorage.setItem('ld_user_address', bookingAddress);
      window.dispatchEvent(new Event('storage'));

      setOrderSuccessMsg(`✅ Order Booked Successfully! ID: LD-${res.data.order?._id?.substring(18).toUpperCase() || 'NEW'}`);
      
      setTimeout(() => {
        setActivePaymentProduct(null);
        setIsSubmittingOrder(false);
      }, 2500);
    } catch (err) {
      console.error('Order creation failed:', err);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 text-left select-none bg-[#FBF9F1] min-h-[85vh]">
      {/* Wishlist Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1.5 rounded-full text-slate-700 hover:text-slate-900 bg-white border border-slate-200 transition-colors shadow-xs">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-[#008DDA] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 mb-1">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              <span>Saved Teak Collections</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              My Dream Designs Wishlist
            </h1>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs">
          {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Design' : 'Designs'}
        </span>
      </div>

      {loading ? (
        <div className="flex py-24 w-full items-center justify-center bg-white border border-slate-200 rounded-3xl shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-[#008DDA]" />
        </div>
      ) : wishlistProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center bg-white shadow-xs animate-fadeIn max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Heart className="h-8 w-8 fill-red-400 text-red-500 animate-pulse" />
          </div>
          <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">Your Wishlist is Empty</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed mb-6">
            You haven't saved any carpentry designs yet. Explore our premium teakwood catalog and tap the ❤️ heart icon on designs you love!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-[#008DDA] hover:bg-[#0077B6] text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>Explore Teak Designs Catalog</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* ONLINE PAYMENT & BOOKING MODAL */}
      {activePaymentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setActivePaymentProduct(null)}>
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-left relative animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActivePaymentProduct(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 text-[#008DDA] font-bold text-xs uppercase tracking-widest mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span>Instant Payment Gateway</span>
            </div>

            <h3 className="font-serif text-xl font-black text-slate-900 leading-tight mb-2">
              Book {activePaymentProduct.name || activePaymentProduct.title}
            </h3>

            {orderSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-emerald-800 leading-relaxed">{orderSuccessMsg}</p>
                <p className="text-xs text-slate-500 font-light">Redirecting to your orders list...</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrderWithPayment} className="space-y-4 text-xs">
                {/* Product Summary */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                  <img
                    src={activePaymentProduct.imageUrl}
                    alt={activePaymentProduct.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{activePaymentProduct.name || activePaymentProduct.title}</p>
                    <p className="font-mono text-xs font-black text-[#008DDA] mt-0.5">
                      Total Valuation: ₹{(activePaymentProduct.price || activePaymentProduct.estimatePrice || 25000).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Payment Option Selection */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1.5">
                    Payment Plan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookingPaymentType('50')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        bookingPaymentType === '50'
                          ? 'border-[#008DDA] bg-sky-50 text-slate-900 font-bold ring-2 ring-sky-300'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold text-[#008DDA]">50% Advance</span>
                      <span className="font-mono font-extrabold text-sm block mt-0.5">
                        ₹{Math.round((activePaymentProduct.price || activePaymentProduct.estimatePrice || 25000) * 0.5).toLocaleString('en-IN')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingPaymentType('100')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        bookingPaymentType === '100'
                          ? 'border-[#008DDA] bg-sky-50 text-slate-900 font-bold ring-2 ring-sky-300'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span className="block text-[10px] uppercase font-bold text-emerald-600">Full Payment</span>
                      <span className="font-mono font-extrabold text-sm block mt-0.5">
                        ₹{(activePaymentProduct.price || activePaymentProduct.estimatePrice || 25000).toLocaleString('en-IN')}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008DDA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">WhatsApp Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#008DDA]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Delivery Address</label>
                  <textarea
                    required
                    rows="2"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="Enter destination address"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008DDA]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="mt-2 w-full py-3.5 bg-gradient-to-r from-[#008DDA] to-[#0077B6] hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingOrder ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      <span>Confirm & Proceed to Payment</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
