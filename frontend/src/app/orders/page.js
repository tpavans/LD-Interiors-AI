"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Search, Calendar, Tag, MapPin, CheckCircle, AlertTriangle, Star, User, Mail, Compass, LogOut, Edit3, Check } from 'lucide-react';

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

  // Profile Edit State
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    // 1. Pre-fill phone from localStorage on mount and run search
    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    const savedName = localStorage.getItem('ld_user_name') || '';
    const savedEmail = localStorage.getItem('ld_user_email') || '';
    const savedAddress = localStorage.getItem('ld_user_address') || '';
    
    setProfileName(savedName);
    setProfilePhone(savedPhone);
    setProfileEmail(savedEmail);
    setProfileAddress(savedAddress);

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
      const ordersData = response.data;
      setOrders(ordersData);
      
      // Auto-extract customer info from first order to restore details!
      if (ordersData && ordersData.length > 0) {
        const primaryOrder = ordersData[0];
        const recoveredName = primaryOrder.name || localStorage.getItem('ld_user_name') || '';
        const recoveredEmail = primaryOrder.email || localStorage.getItem('ld_user_email') || '';
        const recoveredAddress = primaryOrder.address || localStorage.getItem('ld_user_address') || '';
        
        localStorage.setItem('ld_user_name', recoveredName);
        localStorage.setItem('ld_user_phone', queryPhone);
        localStorage.setItem('ld_user_email', recoveredEmail);
        localStorage.setItem('ld_user_address', recoveredAddress);
        localStorage.setItem('ld_user_registered', 'true');
        
        setPhone(queryPhone);
        setProfileName(recoveredName);
        setProfilePhone(queryPhone);
        setProfileEmail(recoveredEmail);
        setProfileAddress(recoveredAddress);
      } else {
        localStorage.setItem('ld_user_phone', queryPhone);
        localStorage.setItem('ld_user_registered', 'true');
        setPhone(queryPhone);
        setProfilePhone(queryPhone);
      }
      
      // Dispatch storage event to sync navbar
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error tracking orders:', err);
      setError('Could not retrieve order details. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('ld_user_name', profileName.trim());
    localStorage.setItem('ld_user_phone', profilePhone.trim());
    localStorage.setItem('ld_user_email', profileEmail.trim());
    localStorage.setItem('ld_user_address', profileAddress.trim());
    localStorage.setItem('ld_user_registered', 'true');
    
    // Sync phone state and fetch orders again with the new phone if changed
    setPhone(profilePhone.trim());
    handleSearch(null, profilePhone.trim());
    setIsEditingProfile(false);
    
    // Dispatch storage event to navbar
    window.dispatchEvent(new Event('storage'));
    alert('Profile details saved successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('ld_user_name');
    localStorage.removeItem('ld_user_phone');
    localStorage.removeItem('ld_user_email');
    localStorage.removeItem('ld_user_address');
    localStorage.removeItem('ld_user_registered');
    
    setPhone('');
    setOrders([]);
    setSearchRun(false);
    setProfileName('');
    setProfilePhone('');
    setProfileEmail('');
    setProfileAddress('');
    setIsEditingProfile(false);
    
    // Dispatch storage event to navbar
    window.dispatchEvent(new Event('storage'));
  };

  // Submit feedback rating directly from the orders page
  const handleRateProduct = async (orderId, productTitle, starValue) => {
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

  // If visitor is NOT logged in, render the login card
  if (!phone) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-left">
        <div className="bg-wood-cream border-2 border-wood-border/60 rounded-3xl p-8 shadow-xl text-center">
          <span className="inline-flex items-center gap-1 bg-wood-accent/20 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-4">
            Customer Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-wood-dark">
            Access My Account
          </h1>
          <p className="mt-2 text-xs text-wood-light font-light leading-relaxed mb-6">
            Enter your registered mobile number to manage your profile, load your live order logs, and track status timelines.
          </p>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-150 p-3.5 text-xs text-red-800 flex items-start gap-2.5 text-left mb-5">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSearch(e)} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 9346325291"
                className="w-full rounded-xl border border-wood-border bg-white px-4 py-3 text-xs text-wood-dark focus:border-wood-dark focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:bg-neutral-500 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Verify and Login</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 text-left">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-wood-border/30 pb-6">
        <div>
          <span className="inline-flex items-center gap-1 bg-wood-accent/20 px-3 py-0.5 rounded-full text-[9px] font-extrabold tracking-widest text-wood-accent uppercase mb-2">
            Secure Client Workspace
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-wood-dark">
            My Account & Orders
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-wood-cream border border-wood-border/60 rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-wood-beige/40 -z-10"></div>
            
            <h3 className="font-serif text-lg font-bold text-wood-dark mb-4 flex items-center gap-2 pb-2.5 border-b border-wood-border/30">
              <User className="h-5 w-5 text-wood-accent" />
              My Profile Info
            </h3>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Gmail / Email</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Delivery Address</label>
                  <textarea
                    required
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    rows="2.5"
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-dark"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-grow flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-grow rounded-xl border border-wood-border hover:bg-neutral-50 text-wood-light hover:text-wood-dark py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-wood-light">Registered Name</p>
                  <p className="text-sm font-semibold text-wood-dark">{profileName || 'Not specified'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-wood-light">Mobile Phone</p>
                  <p className="text-sm font-semibold text-wood-dark">📞 {profilePhone}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-wood-light">Gmail Address</p>
                  <p className="text-sm font-semibold text-wood-dark flex items-center gap-1">
                    <Mail className="h-4 w-4 text-wood-light/70" />
                    {profileEmail || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-wood-light">Delivery Address</p>
                  <p className="text-xs text-wood-medium leading-relaxed bg-white border border-wood-border/40 rounded-xl p-3 font-light">
                    {profileAddress || 'No address registered.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-wood-accent hover:bg-wood-beige text-wood-accent py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer mt-3"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile details</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Workspace */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-serif text-xl font-bold text-wood-dark flex items-center gap-2 pb-2.5 border-b border-wood-border/30">
            <Compass className="h-5.5 w-5.5 text-wood-accent" />
            My Order Logs ({orders.length})
          </h3>

          {loading ? (
            <div className="flex py-20 w-full items-center justify-center bg-wood-cream/30 border border-dashed border-wood-border/50 rounded-3xl">
              <Loader2 className="h-7 w-7 animate-spin text-wood-light" />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-wood-border/60 p-12 text-center bg-wood-cream/50">
              <p className="text-sm text-wood-light font-light leading-relaxed mb-4">
                No orders found under phone number <strong>{phone}</strong>. Let's create your first order!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Teak Designs
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const isCancelled = order.status === 'Cancelled';
                const userSubmittedRating = ratedOrders[order._id];
                
                return (
                  <div key={order._id} className="bg-wood-cream border border-wood-border/60 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Product and Meta Row */}
                    <div className="flex flex-col md:flex-row gap-5 items-start pb-5 border-b border-wood-border/30">
                      {order.imageUrl ? (
                        <img
                          src={order.imageUrl}
                          alt={order.product}
                          className="w-20 h-20 rounded-2xl object-cover border border-wood-border/20 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-wood-beige/50 border border-wood-border/20 shadow-sm flex items-center justify-center text-wood-accent font-serif font-extrabold text-lg shrink-0">
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
                        <h3 className="font-serif text-lg font-bold text-wood-dark leading-tight mt-1">{order.product}</h3>
                        
                        {/* Custom fields rendered if available */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white border border-wood-border/30 rounded-xl p-3 text-[10px] text-wood-medium mt-2 font-light">
                          {order.customSize && (
                            <p><strong>Custom Size:</strong> {order.customSize}</p>
                          )}
                          {order.desiredPrice && (
                            <p><strong>Desired Cost:</strong> {order.desiredPrice}</p>
                          )}
                          <p className="sm:col-span-2"><strong>Notes:</strong> {order.notes || 'No custom details provided.'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Live Tracking Timeline */}
                    <div className="py-6">
                      <p className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase mb-5 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 animate-pulse" />
                        Live Status Track
                      </p>

                      {isCancelled ? (
                        <div className="rounded-xl bg-red-50 border border-red-150 p-4 text-xs text-red-800 flex items-start gap-2 max-w-md animate-fadeIn">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            {order.updatedAt && (
                              <p className="text-[9px] text-red-650 font-bold mb-1">
                                Cancelled: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                            <p className="font-bold text-red-700">Order Cancelled</p>
                            <p className="text-[10px] text-wood-light mt-0.5">This order record was cancelled. Contact Pavan Sai or Nagaraju for details.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative pl-6 space-y-6">
                          {/* Vertical Connector Line */}
                          <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-wood-border/30 -z-10"></div>

                          {/* Pending Step */}
                          <div className="relative flex gap-3.5 items-start">
                            <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-600 border-emerald-600 flex items-center justify-center">
                              <CheckCircle className="h-2 w-2 text-white" />
                            </span>
                            <div>
                              <p className="text-[9px] text-wood-accent font-semibold mb-0.5">
                                Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
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
                              {order.status === 'Processing' && order.updatedAt && (
                                <p className="text-[9px] text-wood-accent font-semibold mb-0.5 animate-fadeIn">
                                  Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
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
                              {order.status === 'In Progress' && order.updatedAt && (
                                <p className="text-[9px] text-wood-accent font-semibold mb-0.5 animate-fadeIn">
                                  Updated: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
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
                              {order.status === 'Completed' && order.updatedAt && (
                                <p className="text-[9px] text-emerald-600 font-semibold mb-0.5 animate-fadeIn">
                                  Completed: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
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
                    <div className="pt-5 border-t border-wood-border/30 flex flex-wrap items-center justify-between gap-4 text-left">
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
          )}
        </div>
      </div>

      <div className="mt-16 text-center">
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
