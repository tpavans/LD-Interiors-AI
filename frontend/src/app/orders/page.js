"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Search, Calendar, Tag, MapPin, CheckCircle, AlertTriangle, Star } from 'lucide-react';

export default function UserOrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchRun, setSearchRun] = useState(false);
  
  // Track submitted ratings locally
  const [ratedOrders, setRatedOrders] = useState({});

  useEffect(() => {
    // 1. Pre-fill phone from localStorage on mount and run search
    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    
    // Load rated orders from localStorage
    const savedRatings = localStorage.getItem('ld_rated_orders');
    if (savedRatings) {
      try {
        setRatedOrders(JSON.parse(savedRatings));
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch products catalog to resolve product IDs for feedback submission
    const fetchCatalogAndTrack = async () => {
      try {
        const prodRes = await api.get('/products');
        setProducts(prodRes.data);
        
        if (savedPhone) {
          setPhone(savedPhone);
          await handleSearch(null, savedPhone);
        }
      } catch (err) {
        console.error('Error fetching designs catalog:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCatalogAndTrack();
  }, []);

  const handleSearch = async (e, forcePhone) => {
    if (e) e.preventDefault();
    const queryPhone = forcePhone || phone.trim();
    if (!queryPhone) return;

    setLoading(true);
    setError('');
    setSearchRun(true);

    try {
      const response = await api.get(`/orders/track?phone=${queryPhone}`);
      setOrders(response.data);
      // Save searched phone to localStorage
      localStorage.setItem('ld_user_phone', queryPhone);
    } catch (err) {
      console.error('Error tracking orders:', err);
      setError('Could not retrieve order details. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Submit rolling rating feedback directly from the orders page
  const handleRateProduct = async (orderId, productTitle, starValue) => {
    // Resolve product ID by matching title
    const matchedProduct = products.find(p => p.title.toLowerCase() === productTitle.toLowerCase());
    if (!matchedProduct) {
      alert("This product is no longer active in our catalog, but thank you for your feedback!");
      return;
    }

    try {
      await api.post(`/products/${matchedProduct._id}/rate`, { rating: starValue });
      
      const newRatings = { ...ratedOrders, [orderId]: starValue };
      setRatedOrders(newRatings);
      localStorage.setItem('ld_rated_orders', JSON.stringify(newRatings));
      
      alert(`Thank you! Your feedback of ${starValue} Stars has been submitted for "${productTitle}".`);
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Could not submit feedback at this time. Please try again.');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-wood-light" />
          <p className="text-sm text-wood-light font-light animate-pulse">Loading order workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 text-left">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1 bg-wood-accent/20 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-3">
          Customer Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-wood-dark">
          Track My Orders
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-wood-light font-light max-w-md mx-auto leading-relaxed">
          Enter your registered mobile number to track live carpentry layouts and submit design feedback directly to Nagaraju.
        </p>
      </div>

      {/* Phone input search bar */}
      <form onSubmit={(e) => handleSearch(e)} className="mx-auto max-w-md bg-wood-cream border border-wood-border rounded-2xl p-5 shadow-md mb-10">
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-2">
          Registered Mobile Number
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 9346325291"
            className="flex-grow rounded-xl border border-wood-border bg-white px-4 py-3 text-xs text-wood-dark focus:border-wood-dark focus:outline-none focus:ring-0 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:bg-neutral-500 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Workspace */}
      <div className="space-y-8">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-150 p-4 text-xs text-red-800 flex items-start gap-2.5 max-w-md mx-auto">
            <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {searchRun && !loading && orders.length === 0 && (
          <div className="rounded-2xl border border-dashed border-wood-border p-12 text-center max-w-md mx-auto bg-wood-cream/50">
            <p className="text-sm text-wood-light font-light">
              No orders found for this mobile number. Verify that you used the same number provided during WhatsApp checkout.
            </p>
          </div>
        )}

        {!searchRun && (
          <div className="text-center text-xs text-wood-light/60 py-10 font-light italic">
            Enter your details above to pull your live carpentry workshop timelines.
          </div>
        )}

        {orders.map((order) => {
          const isCancelled = order.status === 'Cancelled';
          const userSubmittedRating = ratedOrders[order._id];
          
          return (
            <div key={order._id} className="bg-wood-cream border border-wood-border/60 rounded-3xl p-5 sm:p-8 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
              {/* Product and Meta Row */}
              <div className="flex flex-col md:flex-row gap-6 items-start pb-6 border-b border-wood-border/30">
                {order.imageUrl ? (
                  <img
                    src={order.imageUrl}
                    alt={order.product}
                    className="w-20 h-20 rounded-xl object-cover border border-wood-border/20 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-wood-beige/50 border border-wood-border/20 shadow-sm flex items-center justify-center text-wood-accent font-serif font-extrabold text-lg shrink-0">
                    LD
                  </div>
                )}
                <div className="flex-grow space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-wood-beige/60 border border-wood-border/40 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-wood-accent">
                      <Tag className="h-3 w-3" />
                      Custom Design
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-wood-light font-light text-[10px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-wood-accent" />
                      Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {order.updatedAt && new Date(order.updatedAt).getTime() !== new Date(order.createdAt).getTime() && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold animate-fadeIn">
                        <Calendar className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                        Admin Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-wood-dark leading-tight mt-2">{order.product}</h3>
                  <p className="text-xs text-wood-medium font-light whitespace-pre-line leading-relaxed">
                    <strong className="font-semibold text-wood-dark">Notes / Sizing:</strong> {order.notes || 'No custom details provided.'}
                  </p>
                </div>
              </div>

              {/* Live Tracking Timeline */}
              <div className="py-8">
                <p className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase mb-6 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 animate-pulse" />
                  Live Order Status Timeline
                </p>

                {isCancelled ? (
                  <div className="rounded-xl bg-red-50 border border-red-150 p-4 text-xs text-red-800 flex items-start gap-2 max-w-md">
                    <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Order Cancelled</p>
                      <p className="text-[10px] text-wood-light mt-0.5">This order record was cancelled. Contact Pavan Sai or Nagaraju for help.</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6">
                    {/* Vertial Connector Line */}
                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-wood-border/30 -z-10"></div>

                    {/* Pending Step */}
                    <div className="relative flex gap-3.5 items-start">
                      <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-600 border-emerald-600 flex items-center justify-center">
                        <CheckCircle className="h-2 w-2 text-white" />
                      </span>
                      <div>
                        <p className="text-xs font-bold text-wood-dark">Order Booked</p>
                        <p className="text-[10px] text-wood-light font-light mt-0.5">Inquiry received and logged successfully in our system.</p>
                      </div>
                    </div>

                    {/* Processing Step */}
                    <div className="relative flex gap-3.5 items-start">
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        ['Processing', 'In Progress', 'Completed'].includes(order.status)
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'bg-white border-wood-border'
                      }`}>
                        {['Processing', 'In Progress', 'Completed'].includes(order.status) && (
                          <CheckCircle className="h-2 w-2 text-white" />
                        )}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${['Processing', 'In Progress', 'Completed'].includes(order.status) ? 'text-wood-dark' : 'text-wood-light/60'}`}>
                          Processing & Design Sizing
                        </p>
                        <p className="text-[10px] text-wood-light font-light mt-0.5">Nagaraju checks logs, selects teak lumber options, and confirms details.</p>
                      </div>
                    </div>

                    {/* In Progress Step */}
                    <div className="relative flex gap-3.5 items-start">
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        ['In Progress', 'Completed'].includes(order.status)
                          ? 'bg-amber-500 border-amber-500'
                          : 'bg-white border-wood-border'
                      }`}>
                        {['In Progress', 'Completed'].includes(order.status) && (
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                        )}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${['In Progress', 'Completed'].includes(order.status) ? 'text-wood-dark font-extrabold' : 'text-wood-light/60'}`}>
                          In Progress (Crafting wood carvings)
                        </p>
                        <p className="text-[10px] text-wood-light font-light mt-0.5">Wood cuts, sizing framing, and PU polish application at Alamuru workshop.</p>
                      </div>
                    </div>

                    {/* Completed Step */}
                    <div className="relative flex gap-3.5 items-start">
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${
                        order.status === 'Completed'
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'bg-white border-wood-border'
                      }`}>
                        {order.status === 'Completed' && (
                          <CheckCircle className="h-2 w-2 text-white" />
                        )}
                      </span>
                      <div>
                        <p className={`text-xs font-bold ${order.status === 'Completed' ? 'text-emerald-700 font-extrabold' : 'text-wood-light/60'}`}>
                          Completed & Installed
                        </p>
                        <p className="text-[10px] text-wood-light font-light mt-0.5">Bespoke furniture setup installed successfully at client location.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sizing description / Star feedback block */}
              <div className="pt-6 border-t border-wood-border/30 flex flex-wrap items-center justify-between gap-4 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-wood-accent">Submit Feedback</span>
                  <p className="text-[10px] text-wood-light font-light mt-0.5">Rate this carpentry design to help our workshop improve layouts.</p>
                </div>
                
                <div className="flex items-center gap-1 bg-wood-beige/40 px-4 py-2 rounded-2xl border border-wood-border/40">
                  {userSubmittedRating ? (
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= userSubmittedRating ? 'text-amber-500 fill-amber-500' : 'text-neutral-300'
                          }`}
                        />
                      ))}
                      <span className="text-[10px] text-emerald-800 font-bold ml-1.5">Submitted ({userSubmittedRating}★)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRateProduct(order._id, order.product, star)}
                          className="text-neutral-300 hover:text-amber-500 hover:scale-125 transition-all duration-150 cursor-pointer text-lg"
                          title={`Rate ${star} Stars`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-[10px] text-wood-light font-light ml-1">Rate item</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-wood-border hover:bg-wood-cream hover:text-wood-dark px-6 py-3 text-xs font-bold uppercase tracking-wider text-wood-light shadow-sm transition-colors duration-300"
        >
          Browse Designs Catalog
        </Link>
      </div>
    </div>
  );
}
