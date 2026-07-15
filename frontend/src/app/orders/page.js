"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Search, Calendar, Tag, MapPin, CheckCircle, AlertTriangle, Star, User, Mail, Compass, LogOut, Edit3, Check, CreditCard, QrCode, FileText, CheckCircle2, DollarSign, X, Smartphone, Truck } from 'lucide-react';

const UPI_IDS = {
  phonepe: { id: "9346325291@axl", name: "Pavansai Teki", label: "PhonePe" },
  gpay: { id: "pavansaiteki7@okicici", name: "Pavansai Teki", label: "Google Pay" }
};

export default function UserOrdersPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [loginError, setLoginError] = useState('');
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

  // Payment Modal States
  const [activePayOrder, setActivePayOrder] = useState(null);
  const [selectedUpiKey, setSelectedUpiKey] = useState('phonepe');
  const [selectedOption, setSelectedOption] = useState('50'); // '50', '100'
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' or 'gateway'

  // Tracking Modal State
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    // Load Razorpay Checkout SDK Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    const savedPhone = localStorage.getItem('ld_user_phone') || '';
    const savedName = localStorage.getItem('ld_user_name') || '';
    const savedEmail = localStorage.getItem('ld_user_email') || '';
    const savedAddress = localStorage.getItem('ld_user_address') || '';
    
    setProfileName(savedName);
    setProfilePhone(savedPhone);
    setProfileEmail(savedEmail);
    setProfileAddress(savedAddress);

    const savedRatings = localStorage.getItem('ld_rated_orders');
    if (savedRatings) {
      try {
        setRatedOrders(JSON.parse(savedRatings));
      } catch (e) {
        console.error(e);
      }
    }

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

    return () => {
      document.body.removeChild(script);
    };
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
      
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Error tracking orders:', err);
      setError('Could not retrieve order details. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoginError('');
    setSimulatedOtp('');
    
    try {
      const response = await api.post('/auth/send-otp', { phone });
      setIsOtpSent(true);
      setSimulatedOtp(response.data.otp);
    } catch (err) {
      console.error('OTP Send error:', err);
      setLoginError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('ld_user_token', token);
      localStorage.setItem('ld_user_phone', phone);
      localStorage.setItem('ld_user_registered', 'true');
      
      // Load orders timeline on verified login success
      await handleSearch(null, phone);
    } catch (err) {
      console.error('OTP Verification error:', err);
      setLoginError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
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
    
    setPhone(profilePhone.trim());
    handleSearch(null, profilePhone.trim());
    setIsEditingProfile(false);
    
    window.dispatchEvent(new Event('storage'));
    alert('Profile details saved successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('ld_user_name');
    localStorage.removeItem('ld_user_phone');
    localStorage.removeItem('ld_user_email');
    localStorage.removeItem('ld_user_address');
    localStorage.removeItem('ld_user_registered');
    localStorage.removeItem('ld_user_token');
    
    setPhone('');
    setOrders([]);
    setSearchRun(false);
    setProfileName('');
    setProfilePhone('');
    setProfileEmail('');
    setProfileAddress('');
    setIsEditingProfile(false);
    setIsOtpSent(false);
    setOtp('');
    setSimulatedOtp('');
    
    window.dispatchEvent(new Event('storage'));
  };

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

  // Calculate dynamic payment amount based on option
  const getPayableAmount = () => {
    if (!activePayOrder) return 0;
    const balance = activePayOrder.remainingBalance || activePayOrder.totalPrice || 0;
    if (selectedOption === '50') {
      return Math.round(balance / 2);
    } else {
      return balance;
    }
  };

  // Generate official UPI deep link
  const getUpiUrl = () => {
    if (!activePayOrder) return '';
    const upi = UPI_IDS[selectedUpiKey];
    const amount = getPayableAmount();
    const orderShortId = activePayOrder._id.substring(18).toUpperCase();
    return `upi://pay?pa=${upi.id}&pn=${encodeURIComponent(upi.name)}&am=${amount}&tn=Order%20LD-${orderShortId}&cu=INR`;
  };

  const handleCopyUpiId = () => {
    const upiId = UPI_IDS[selectedUpiKey].id;
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handlePaymentConfirm = async (e) => {
    if (e) e.preventDefault();
    if (!activePayOrder) return;
    
    const amount = getPayableAmount();
    if (amount <= 0) {
      setPaymentError('Please select a valid payment amount.');
      return;
    }

    setSubmittingPayment(true);
    setPaymentError('');

    try {
      if (paymentMethod === 'gateway') {
        const convenienceFee = Math.round(amount * 0.0236);
        // 1. Create order on backend
        const orderRes = await api.post(`/orders/${activePayOrder._id}/razorpay-order`, {
          amount,
          fee: convenienceFee
        });

        // 2. Launch Razorpay Checkout widget
        if (typeof window !== 'undefined' && window.Razorpay) {
          const options = {
            key: orderRes.data.keyId,
            amount: Math.round(orderRes.data.amount * 100), // paise
            currency: orderRes.data.currency,
            name: "LD Interiors & Furnitures",
            description: `Payment installment for ${activePayOrder.product}`,
            order_id: orderRes.data.orderId,
            handler: async function (response) {
              setSubmittingPayment(true);
              try {
                const verifyRes = await api.post(`/orders/${activePayOrder._id}/razorpay-verify`, {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature || 'mock_signature',
                  actualAmountPaid: amount
                });
                alert('🎉 Payment verified and processed instantly! Your balance ledger has been updated.');
                setActivePayOrder(null);
                handleSearch(null, phone);
              } catch (err) {
                console.error('Razorpay verification failed:', err);
                alert(err.response?.data?.message || 'Payment verification failed. Please contact Nagaraju / Pavansai.');
              } finally {
                setSubmittingPayment(false);
              }
            },
            prefill: {
              name: profileName || activePayOrder.name,
              email: profileEmail || activePayOrder.email || 'customer@example.com',
              contact: profilePhone || activePayOrder.phone
            },
            notes: {
              order_id: activePayOrder._id
            },
            theme: {
              color: "#8B5A2B" // Teak wood brand color
            }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          alert("Payment gateway script failed to load. Please refresh and check your internet connection.");
        }
      } else {
        // Direct UPI transfer flow
        await api.post(`/orders/${activePayOrder._id}/confirm-payment`, {
          amount,
          upiIdUsed: UPI_IDS[selectedUpiKey].id
        });

        // 2. Open WhatsApp Chat prefilled to Admin Pavansai (9346325291)
        const orderShortId = activePayOrder._id.substring(18).toUpperCase();
        const waMsg = `🔔 Payment Notification / పేమెంట్ సమాచారం

Hello Pavansai/Nagaraju,

I have completed the UPI payment of ₹${amount.toLocaleString('en-IN')} for my order of "${activePayOrder.product}" (Order ID: LD-${orderShortId}).

Please check your bank account and approve my order.

Thank you,
${profileName || activePayOrder.name}`;

        const waUrl = `https://wa.me/919346325291?text=${encodeURIComponent(waMsg)}`;
        window.open(waUrl, '_blank');

        alert('Payment confirmation registered! We opened WhatsApp to notify Pavansai. Nagaraju will check the account and verify the transaction in the dashboard.');
        
        // Close modal and refresh order logs
        setActivePayOrder(null);
        await handleSearch(null, phone);
      }
    } catch (err) {
      console.error('Payment confirmation failed:', err);
      setPaymentError(err.response?.data?.message || 'Failed to register payment confirmation. Please try again.');
    } finally {
      setSubmittingPayment(false);
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
        <div className="bg-white/80 backdrop-blur-md border border-wood-border/40 rounded-3xl p-8 shadow-xl text-center glow-on-hover">
          <span className="inline-flex items-center gap-1 bg-wood-accent/20 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest text-wood-accent uppercase mb-4">
            Customer Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-wood-dark">
            Access My Account
          </h1>
          <p className="mt-2 text-xs text-wood-light font-light leading-relaxed mb-6">
            Enter your mobile number to securely receive an OTP code and log in to your account.
          </p>

          {loginError && (
            <div className="rounded-xl bg-red-50 border border-red-150 p-3.5 text-xs text-red-800 flex items-start gap-2.5 text-left mb-5">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-150 p-3.5 text-xs text-red-800 flex items-start gap-2.5 text-left mb-5">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 9346325291"
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-3 text-xs text-wood-dark focus:border-wood-accent focus:ring-2 focus:ring-wood-accent/15 focus:outline-none transition-all"
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
                    <Smartphone className="h-4 w-4" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-wood-light">OTP Sent to {phone}</span>
                <button
                  type="button"
                  onClick={() => { setIsOtpSent(false); setOtp(''); setSimulatedOtp(''); }}
                  className="text-[9px] text-wood-accent font-bold uppercase tracking-wider hover:text-amber-500 cursor-pointer"
                >
                  Change
                </button>
              </div>
              
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-wood-accent mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-3 text-xs text-center font-bold tracking-widest text-wood-dark focus:border-wood-accent focus:ring-2 focus:ring-wood-accent/15 focus:outline-none transition-all"
                />
              </div>

              {simulatedOtp && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-250 p-3.5 text-[11px] text-emerald-800 text-left animate-fadeIn">
                  <p className="font-bold">🔑 Simulated SMS OTP Code:</p>
                  <p className="text-sm font-mono font-extrabold tracking-widest mt-1 text-emerald-950">{simulatedOtp}</p>
                  <p className="text-[9px] text-emerald-700/80 mt-1 font-light">Copy and paste this code above to access your order logs.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:bg-neutral-500 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify & Log In</span>
                  </>
                )}
              </button>
              
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-[9px] text-wood-light hover:text-wood-dark uppercase font-bold tracking-widest cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
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
          className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-red-250 hover:bg-red-50 text-red-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/80 backdrop-blur-md border border-wood-border/40 rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-wood-beige/20 -z-10"></div>
            
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
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-accent"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-accent"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Gmail / Email</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-accent"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1">Delivery Address</label>
                  <textarea
                    required
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    rows="2.5"
                    className="w-full rounded-xl border border-wood-border bg-white px-3 py-2 text-xs text-wood-dark focus:outline-none focus:border-wood-accent"
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
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-wood-accent hover:bg-wood-beige hover:text-wood-dark py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer mt-3"
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
            <div className="rounded-3xl border border-dashed border-wood-border/60 p-12 text-center bg-wood-cream/50 animate-fadeIn">
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
                const orderShortId = order._id.substring(18).toUpperCase();
                
                const hasPendingVerifications = order.payments?.some(p => p.status === 'Pending');
                
                return (
                  <div key={order._id} className="bg-white/80 backdrop-blur-md border border-wood-border/40 rounded-3xl p-5 sm:p-7 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg glow-on-hover animate-fadeIn">
                    {/* Product and Meta Row */}
                    <div className="flex flex-col md:flex-row gap-5 items-start pb-5 border-b border-wood-border/30">
                      {order.imageUrl ? (
                        <img
                          src={order.imageUrl}
                          alt={order.product}
                          className="w-20 h-20 rounded-2xl object-cover border border-wood-border/20 shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-wood-beige/20 border border-wood-border/20 shadow-sm flex items-center justify-center text-wood-accent font-serif font-extrabold text-lg shrink-0">
                          LD
                        </div>
                      )}
                      <div className="flex-grow space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 bg-wood-beige/60 border border-wood-border/40 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-wood-accent">
                            <Tag className="h-3 w-3" />
                            ID: LD-{orderShortId}
                          </span>
                          
                          {/* Financial Badge Indicator */}
                          {order.totalPrice > 0 && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              order.paymentStatus === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-250'
                                : order.paymentStatus === 'Partially Paid'
                                ? 'bg-teal-50 border border-teal-200 text-teal-800'
                                : order.paymentStatus === 'Pending Verification'
                                ? 'bg-amber-100 text-amber-800 border border-amber-250 animate-pulse'
                                : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                            }`}>
                              Payment: {order.paymentStatus}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 text-wood-light font-light text-[10px]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-wood-accent" />
                            Ordered: {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-wood-dark leading-tight mt-1">{order.product}</h3>
                        
                        {/* Custom fields rendered if available */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-wood-beige/10 border border-wood-border/20 rounded-xl p-3 text-[10px] text-wood-medium mt-2 font-light">
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

                    {/* PAYMENT & INVOICE CENTER */}
                    {order.totalPrice > 0 && (
                      <div className="py-5 border-b border-wood-border/30 bg-wood-beige/10 -mx-5 sm:-mx-7 px-5 sm:px-7 my-2 text-left">
                        <p className="text-[9px] font-extrabold tracking-widest text-wood-accent uppercase mb-3 flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-wood-accent" />
                          Payment & Account Ledger
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 text-center mb-4">
                          <div className="bg-white border border-wood-border/30 rounded-xl p-2.5">
                            <span className="text-[8px] uppercase tracking-wider text-wood-light block">Contract Cost</span>
                            <span className="font-serif text-xs font-bold text-wood-dark">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-white border border-wood-border/30 rounded-xl p-2.5">
                            <span className="text-[8px] uppercase tracking-wider text-wood-light block">Paid Amount</span>
                            <span className="font-serif text-xs font-bold text-emerald-700">₹{order.paidAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-white border border-wood-border/30 rounded-xl p-2.5">
                            <span className="text-[8px] uppercase tracking-wider text-wood-light block">Due Balance</span>
                            <span className="font-serif text-xs font-bold text-red-650">₹{order.remainingBalance.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Payment Verification Alerts */}
                        {hasPendingVerifications && (
                          <div className="rounded-xl bg-amber-50 border border-amber-150 p-3.5 text-xs text-amber-800 flex flex-col gap-2.5 mb-3 text-left">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                              <div className="text-[10px] text-amber-850">
                                <strong>Payment Awaiting Approval:</strong> You sent a payment confirmation. Nagaraju is verifying it with their GPay/PhonePe account statement.
                              </div>
                            </div>
                            <div className="border-t border-wood-border/20 pt-2 flex items-center justify-between gap-2">
                              <span className="text-[8.5px] text-wood-light italic font-light">Payment failed or cancelled halfway?</span>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (window.confirm("Did your payment fail/cancel? Click OK to reset the payment button and try again.")) {
                                    try {
                                      await api.post(`/orders/${order._id}/cancel-pending-verification`);
                                      alert("Payment reset successfully. You can now try paying again!");
                                      handleSearch(null, phone);
                                    } catch (err) {
                                      console.error("Failed to reset verification:", err);
                                      alert("Could not reset payment status. Please try again.");
                                    }
                                  }
                                }}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                              >
                                🔄 Reset & Retry Payment
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Rejected Payment Warning */}
                        {!hasPendingVerifications && order.payments && order.payments.some(p => p.status === 'Rejected') && (
                          <div className="rounded-xl bg-red-50 border border-red-150 p-3.5 text-xs text-red-800 flex items-start gap-2.5 mb-3 text-left animate-fadeIn">
                            <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-red-700 font-bold uppercase tracking-wider text-[9px] mb-0.5">⚠️ Payment Verification Rejected</strong>
                              <p className="text-[10px] text-red-800 leading-relaxed font-light">
                                Your last payment confirmation of <span className="font-bold">₹{order.payments.filter(p => p.status === 'Rejected').pop().amount.toLocaleString('en-IN')}</span> was rejected by Nagaraju. Reason: Funds not received in our bank statement. Please verify your transaction and make a fresh payment.
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-3">
                          {order.remainingBalance > 0 ? (
                            <>
                              <p className="text-[10px] text-wood-light font-light max-w-sm italic">
                                *Pay 50% Advance to start work. Remaining balance can be paid online before delivery, or cash on delivery.
                              </p>
                              <button
                                disabled={hasPendingVerifications}
                                onClick={() => {
                                  setActivePayOrder(order);
                                  setSelectedOption('50');
                                  setPaymentError('');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase transition-colors shadow-sm disabled:bg-neutral-400 cursor-pointer"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>Pay Installment / Advance</span>
                              </button>
                            </>
                          ) : (
                            <div className="w-full flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-bold">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                              <span>Order Fully Paid! Balance Due: ₹0</span>
                            </div>
                          )}
                        </div>

                        {/* Approved Payments History */}
                        {order.payments && order.payments.filter(p => p.status === 'Approved').length > 0 && (
                          <div className="mt-4 pt-3 border-t border-wood-border/25">
                            <span className="text-[8px] font-bold uppercase tracking-wider text-wood-light block mb-2">Payment Transaction History</span>
                            <div className="space-y-1.5">
                              {order.payments.filter(p => p.status === 'Approved').map((pay) => (
                                <div key={pay._id} className="flex justify-between items-center bg-white/70 border border-wood-border/20 rounded-lg px-3 py-1.5 text-[9.5px]">
                                  <span className="text-wood-medium font-light">
                                    Verified Installment on {new Date(pay.createdAt).toLocaleDateString('en-IN')}
                                  </span>
                                  <span className="font-bold text-emerald-700">+₹{pay.amount.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CARRIER TRACKING PANEL */}
                    {order.trackingNumber && (
                      <div className="mt-4 p-4 bg-emerald-50/40 border border-emerald-250/30 rounded-2xl animate-fadeIn text-left">
                        <p className="text-[10px] font-extrabold tracking-widest text-emerald-850 uppercase mb-2.5 flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-emerald-600" />
                          <span>Delivery Shipment Tracker</span>
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="text-wood-dark font-semibold text-[13px]">
                              Carrier: <span className="text-emerald-700 font-extrabold">{order.carrier || 'Xpressbees'}</span>
                            </p>
                            <p className="text-[10px] text-wood-light font-mono mt-0.5">
                              Waybill / Consignment Tracking ID: <span className="font-bold select-all">{order.trackingNumber}</span>
                            </p>
                            {order.deliveryDate && (
                              <p className="text-[10px] text-emerald-850 font-bold mt-1 animate-pulse">
                                📅 Expected Arrival: {new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveTrackingOrder(order)}
                            className="self-start sm:self-center inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer select-none border border-emerald-500/20 active:scale-95"
                          >
                            <span>Track Package</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Live Tracking Timeline */}
                    <div className="py-6 text-left">
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
                                Cancelled: {new Date(order.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
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

      {/* DYNAMIC UPI QR PAYMENT MODAL */}
      {activePayOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto" onClick={() => setActivePayOrder(null)}>
          <div className="w-full max-w-md bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <QrCode className="h-4.5 w-4.5 text-wood-accent animate-pulse" />
                <span>UPI Payment Gateway</span>
              </h3>
              <button 
                onClick={() => setActivePayOrder(null)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error Message */}
            {paymentError && (
              <div className="rounded-xl bg-red-50 border border-red-150 p-3 text-[10.5px] text-red-800 flex items-start gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{paymentError}</span>
              </div>
            )}

            <form onSubmit={handlePaymentConfirm} className="space-y-4">
              {/* Payment Option Selector */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-wood-accent block mb-2">Select Amount Option</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOption('50')}
                    className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all ${
                      selectedOption === '50'
                        ? 'bg-wood-dark text-white border-wood-dark'
                        : 'bg-white text-wood-light border-wood-border/50 hover:bg-wood-beige'
                    }`}
                  >
                    50% Advance (₹{Math.round((activePayOrder.remainingBalance || activePayOrder.totalPrice) / 2).toLocaleString('en-IN')})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOption('100')}
                    className={`py-2 px-1 text-[10px] font-bold rounded-xl border text-center transition-all ${
                      selectedOption === '100'
                        ? 'bg-wood-dark text-white border-wood-dark'
                        : 'bg-white text-wood-light border-wood-border/50 hover:bg-wood-beige'
                    }`}
                  >
                    100% Full (₹{(activePayOrder.remainingBalance || activePayOrder.totalPrice).toLocaleString('en-IN')})
                  </button>
                </div>
              </div>

              {/* Payment Method Selector Tab */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-wood-accent block mb-2">Choose Payment Method</span>
                <div className="grid grid-cols-2 gap-2 bg-white border border-wood-border/40 rounded-xl p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-2 text-[10.5px] font-bold rounded-lg text-center transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-wood-dark text-white shadow-xs'
                        : 'text-wood-light hover:text-wood-dark hover:bg-wood-beige/25'
                    }`}
                  >
                    📱 Direct UPI (0% Fee)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gateway')}
                    className={`py-2 px-2 text-[10.5px] font-bold rounded-lg text-center transition-all cursor-pointer ${
                      paymentMethod === 'gateway'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-wood-light hover:text-wood-dark hover:bg-wood-beige/25'
                    }`}
                  >
                    💳 Cards / EMI (2.36% Fee)
                  </button>
                </div>
              </div>

              {/* Direct P2P UPI Payment Subform */}
              {paymentMethod === 'upi' && getPayableAmount() > 0 && (
                <div className="space-y-4">
                  {/* UPI Key Selector */}
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-wood-accent block mb-2">Select Pay App / Bank UPI</span>
                    <div className="flex gap-2">
                      {Object.entries(UPI_IDS).map(([key, value]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedUpiKey(key)}
                          className={`flex-1 py-2 text-center text-xs font-bold rounded-xl border transition-all ${
                            selectedUpiKey === key
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-wood-light border-wood-border/50 hover:bg-wood-beige'
                          }`}
                        >
                          {value.label} ({value.name})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {/* Option 1: Mobile App launcher */}
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3.5 animate-fadeIn">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-800 block mb-1">Option 1: Mobile App Shortcut (Tap to Pay)</span>
                      <a
                        href={getUpiUrl()}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm text-center cursor-pointer mb-2"
                      >
                        <Smartphone className="h-4 w-4" />
                        <span>Open UPI App & Pay ₹{getPayableAmount().toLocaleString('en-IN')}</span>
                      </a>
                      <p className="text-[8px] text-red-650 font-semibold leading-relaxed">
                        ⚠️ NOTE: Some apps (like PhonePe/GPay) decline browser web links for security reasons. If PhonePe/GPay shows a security error, please use <strong>Option 3 (Copy UPI ID)</strong> below!
                      </p>
                    </div>

                    {/* Option 2: Copy UPI ID & Pay Manually */}
                    <div className="bg-white border border-wood-border/40 rounded-2xl p-4 text-center animate-fadeIn shadow-inner flex flex-col items-center justify-center">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-wood-accent block mb-2.5">Option 2: Copy UPI ID & Pay Manually (Best for Mobile)</span>
                      <div className="w-full flex items-center justify-between bg-wood-cream border border-wood-border/30 rounded-xl px-3.5 py-2.5 font-mono text-[11px] font-bold text-wood-dark mb-2 shadow-xs">
                        <span className="select-all truncate mr-1.5">{UPI_IDS[selectedUpiKey].id}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold uppercase rounded-lg transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          {copiedUpi ? '✓ Copied' : '📋 Copy'}
                        </button>
                      </div>
                      <p className="text-[8px] text-wood-light leading-relaxed">
                        *Copy the UPI ID, open GPay / PhonePe / Paytm manually, paste the ID, and complete payment. It never fails!
                      </p>
                    </div>

                    {/* Option 3: Scan QR code */}
                    <div className="bg-white border border-wood-border/40 rounded-2xl p-4 text-center animate-fadeIn shadow-inner flex flex-col items-center justify-center">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-wood-accent block mb-2.5">Option 3: Scan QR Code (Laptops/Computers)</span>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getUpiUrl())}`}
                        alt="Scan UPI QR Code"
                        className="w-36 h-36 object-contain border border-neutral-100 rounded-lg p-1 bg-white"
                      />
                      <div className="mt-2.5">
                        <p className="text-[10px] text-wood-medium font-bold uppercase tracking-wider">Payable Amount: <span className="text-emerald-700 font-extrabold text-xs">₹{getPayableAmount().toLocaleString('en-IN')}</span></p>
                        <p className="text-[9px] text-wood-light font-mono mt-0.5 select-all">UPI ID: {UPI_IDS[selectedUpiKey].id}</p>
                        <p className="text-[8.5px] text-red-650 font-bold tracking-wide mt-1">
                          ⚠️ MUST ADD NOTE: <span className="bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-mono select-all">LD-Order-LD-${activePayOrder._id.substring(18).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Gateway Surcharge Subform */}
              {paymentMethod === 'gateway' && getPayableAmount() > 0 && (
                <div className="bg-white border border-wood-border/40 rounded-2xl p-4 shadow-inner text-xs text-wood-dark space-y-2.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] text-wood-light uppercase font-bold tracking-wider">
                    <span>Base Payment Amount</span>
                    <span className="font-mono text-xs font-semibold">₹{getPayableAmount().toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-wood-light uppercase font-bold tracking-wider pb-2 border-b border-neutral-100">
                    <span>Gateway Processing Charge (2.36%)</span>
                    <span className="font-mono text-xs text-red-650 font-semibold">+₹{Math.round(getPayableAmount() * 0.0236).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-emerald-850 text-[13px] pt-1">
                    <span>Total Amount Payable</span>
                    <span className="font-mono text-sm bg-emerald-50 border border-emerald-250 px-2 py-0.5 rounded-lg">
                      ₹{(getPayableAmount() + Math.round(getPayableAmount() * 0.0236)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="border-t border-wood-border/30 pt-4 mt-2">
                {paymentMethod === 'gateway' ? (
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md disabled:bg-neutral-500 animate-fadeIn"
                  >
                    {submittingPayment ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                    ) : (
                      <>
                        <CreditCard className="h-4.5 w-4.5" />
                        <span>Pay via Gateway (₹{(getPayableAmount() + Math.round(getPayableAmount() * 0.0236)).toLocaleString('en-IN')})</span>
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <p className="text-[9.5px] text-wood-light mb-3 leading-relaxed italic">
                      *Once you complete the payment inside GPay/PhonePe, tap the green button below. This logs the payment in our dashboard and automatically notifies Pavansai on WhatsApp.
                    </p>
                    <button
                      type="submit"
                      disabled={submittingPayment}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md disabled:bg-neutral-500 animate-fadeIn"
                    >
                      {submittingPayment ? (
                        <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                      ) : (
                        <>
                          <CheckCircle className="h-4.5 w-4.5" />
                          <span>✅ I Have Completed Payment</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE CONSIGNMENT TRACKING MODAL */}
      {activeTrackingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto" onClick={() => setActiveTrackingOrder(null)}>
          <div className="w-full max-w-md bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-5 sm:p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-wood-accent animate-pulse" />
                <span>Live Consignment Tracking</span>
              </h3>
              <button 
                onClick={() => setActiveTrackingOrder(null)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Carrier Summary Card */}
            <div className="bg-white border border-wood-border/30 rounded-2xl p-4 shadow-sm mb-5 text-xs text-wood-dark space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                <span className="text-[10px] uppercase font-bold text-wood-light tracking-wider">Logistics Partner</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  📦 {activeTrackingOrder.carrier || 'Xpressbees'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-wood-light tracking-wider">Consignment ID</span>
                <span className="font-mono font-bold select-all">{activeTrackingOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-wood-light tracking-wider">Destination</span>
                <span className="font-semibold text-right max-w-[180px] truncate">{activeTrackingOrder.address || 'Alamuru Hub'}</span>
              </div>
              {activeTrackingOrder.deliveryDate && (
                <div className="flex justify-between items-center pt-1 text-[11px] font-bold text-emerald-850">
                  <span>Expected Arrival</span>
                  <span>📅 {new Date(activeTrackingOrder.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Live Steps Timeline */}
            <p className="text-[10px] uppercase font-extrabold tracking-widest text-wood-accent mb-4 pl-1">Consignment Milestones</p>
            
            <div className="relative pl-6 space-y-6 text-left">
              {/* Connector line */}
              <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-wood-border/30"></div>

              {/* Step 1: Quality Check & Packed */}
              <div className="relative flex gap-3.5 items-start">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-600 border-emerald-600 flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </span>
                <div>
                  <p className="text-[9px] text-wood-light font-mono">
                    {new Date(activeTrackingOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs font-bold text-wood-dark">Package Prepared & Quality Checked</p>
                  <p className="text-[10px] text-wood-light leading-relaxed mt-0.5">Teak carpentry checked by Nagaraju at Alamuru center. Protective foam padding applied for transit safety.</p>
                </div>
              </div>

              {/* Step 2: Handed over */}
              <div className="relative flex gap-3.5 items-start">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-600 border-emerald-600 flex items-center justify-center">
                  <Check className="h-2 w-2 text-white" />
                </span>
                <div>
                  <p className="text-[9px] text-wood-light font-mono">
                    {new Date(new Date(activeTrackingOrder.createdAt).getTime() + 24*60*60*1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs font-bold text-wood-dark">Handed Over to {activeTrackingOrder.carrier || 'Xpressbees'}</p>
                  <p className="text-[10px] text-wood-light leading-relaxed mt-0.5">Consignment accepted at local carrier booking branch. Waybill generated.</p>
                </div>
              </div>

              {/* Step 3: In Transit */}
              <div className="relative flex gap-3.5 items-start">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-emerald-600 border-emerald-650 flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
                </span>
                <div>
                  <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-wider animate-pulse">In Transit (Active)</p>
                  <p className="text-xs font-bold text-wood-dark">Dispatched & Sorting at Hub</p>
                  <p className="text-[10px] text-wood-light leading-relaxed mt-0.5">Package sorted at logistics transit station and loaded onto carrier delivery vehicle.</p>
                </div>
              </div>

              {/* Step 4: Installation */}
              <div className="relative flex gap-3.5 items-start">
                <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-white border-wood-border flex items-center justify-center"></span>
                <div>
                  <p className="text-[9px] text-wood-light font-mono">Pending</p>
                  <p className="text-xs font-bold text-wood-light/60">Delivered & Assembled</p>
                  <p className="text-[10px] text-wood-light leading-relaxed mt-0.5">Unpacking and premium carpentry layout installation at destination customer residence.</p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => setActiveTrackingOrder(null)}
              className="mt-6 w-full py-2.5 bg-wood-dark hover:bg-wood-medium text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
