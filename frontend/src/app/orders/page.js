"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/api';
import { Loader2, Search, Calendar, Tag, MapPin, CheckCircle, AlertTriangle, Star, User, Mail, Compass, LogOut, Edit3, Check, CreditCard, QrCode, FileText, CheckCircle2, DollarSign, X, Smartphone, Truck, Printer, ChevronRight, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import ShippingSlipModal from '@/components/ShippingSlipModal';

const UPI_IDS = {
  phonepe: { id: "9346325291@ybl", name: "TEKI PAVAN SAI", label: "PhonePe" },
  gpay: { id: "9346325291@ybl", name: "TEKI PAVAN SAI", label: "Google Pay" },
  paytm: { id: "9346325291@paytm", name: "TEKI PAVAN SAI", label: "Paytm" }
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
  const [utrInput, setUtrInput] = useState('');

  // Live Consignment & Shipping Slip States
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [activeShippingSlipOrder, setActiveShippingSlipOrder] = useState(null);
  const [activeOrderDetail, setActiveOrderDetail] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderCategoryTab, setOrderCategoryTab] = useState('All');

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
        
        const token = localStorage.getItem('ld_user_token');
        let currentPhone = savedPhone;

        if (token) {
          try {
            const profileRes = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const userData = profileRes.data;
            if (userData) {
              localStorage.setItem('ld_user_name', userData.name || '');
              localStorage.setItem('ld_user_phone', userData.phone || '');
              localStorage.setItem('ld_user_email', userData.email || '');
              localStorage.setItem('ld_user_address', userData.address || '');

              setProfileName(userData.name || '');
              setProfilePhone(userData.phone || '');
              setProfileEmail(userData.email || '');
              setProfileAddress(userData.address || '');
              currentPhone = userData.phone || savedPhone;
            }
          } catch (profileErr) {
            console.error('Session verify failed:', profileErr);
            if (profileErr.response && profileErr.response.status === 401) {
              localStorage.removeItem('ld_user_token');
            }
          }
        }
        
        if (currentPhone) {
          setPhone(currentPhone);
          await handleSearch(null, currentPhone);
        }

        // Check if URL has payOrderId query param
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const payOrderId = urlParams.get('payOrderId');
          if (payOrderId) {
            try {
              const directOrderRes = await api.get(`/orders/public/${payOrderId}`);
              if (directOrderRes.data) {
                const targetOrd = directOrderRes.data;
                setOrders(prev => {
                  const exists = prev.some(o => o._id === targetOrd._id);
                  return exists ? prev : [targetOrd, ...prev];
                });
                setActivePayOrder(targetOrd);
              }
            } catch (pErr) {
              console.error('Failed to load direct payOrderId:', pErr);
            }
          }
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
      const response = await api.post('/auth/send-otp', { phone, isAdmin: false });
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
      const response = await api.post('/auth/verify-otp', { phone, otp, isAdmin: false });
      const { token, ...userData } = response.data;
      
      localStorage.setItem('ld_user_token', token);
      localStorage.setItem('ld_user_phone', phone);
      localStorage.setItem('ld_user_name', userData.name || '');
      localStorage.setItem('ld_user_email', userData.email || '');
      localStorage.setItem('ld_user_address', userData.address || '');
      localStorage.setItem('ld_user_registered', 'true');

      setProfileName(userData.name || '');
      setProfilePhone(phone);
      setProfileEmail(userData.email || '');
      setProfileAddress(userData.address || '');
      
      // Load orders timeline on verified login success
      await handleSearch(null, phone);
    } catch (err) {
      console.error('OTP Verification error:', err);
      setLoginError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Save to database if token is available
    const token = localStorage.getItem('ld_user_token');
    if (token) {
      try {
        await api.put('/auth/profile', {
          name: profileName.trim(),
          email: profileEmail.trim(),
          address: profileAddress.trim()
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to save profile to database:', err);
      }
    }

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

  // Generate official NPCI-compliant UPI deep link
  const getUpiUrl = () => {
    if (!activePayOrder) return '';
    const upi = UPI_IDS[selectedUpiKey] || UPI_IDS.phonepe;
    const amount = getPayableAmount();
    // Using clean NPCI format without tn= merchant note parameter that causes security decline on personal VPAs
    return `upi://pay?pa=${upi.id}&pn=${encodeURIComponent(upi.name)}&am=${amount}&cu=INR`;
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
        if (!utrInput || utrInput.trim().length < 6) {
          setPaymentError('Please enter your 12-digit UTR / Reference number from GPay / PhonePe / Paytm.');
          setSubmittingPayment(false);
          return;
        }

        await api.post(`/orders/${activePayOrder._id}/confirm-payment`, {
          amount,
          upiIdUsed: UPI_IDS[selectedUpiKey].id,
          utrNumber: utrInput.trim()
        });

        // 2. Open WhatsApp Chat prefilled to Admin Pavansai (9346325291)
        const orderShortId = activePayOrder._id.substring(18).toUpperCase();
        const waMsg = `🔔 Payment Verification Submitted / పేమెంట్ సమాచారం

Hello Pavansai/Nagaraju,

I have submitted a payment verification request of ₹${amount.toLocaleString('en-IN')} for my order "${activePayOrder.product}" (Order ID: LD-${orderShortId}).

📌 12-Digit UTR / Ref No: ${utrInput.trim()}

Please check your bank statement and verify my payment.

Thank you,
${profileName || activePayOrder.name}`;

        const waUrl = `https://wa.me/919346325291?text=${encodeURIComponent(waMsg)}`;
        window.open(waUrl, '_blank');

        alert('Payment verification submitted with UTR No! We opened WhatsApp to notify Pavansai. Nagaraju will check the account and verify the transaction in the dashboard.');
        
        // Clear inputs, close modal, and refresh order logs
        setUtrInput('');
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

  // If visitor is NOT logged in and has no orders or active payment order, render login prompt
  if (!phone && orders.length === 0 && !activePayOrder) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-24 text-left">
        <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-8 shadow-xl text-center">
          <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 px-3.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest text-[#008DDA] uppercase mb-4">
            Customer Account
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Access My Account
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-light leading-relaxed mb-6">
            Log in to view your orders timeline, check payment status, request custom configurations, and manage your delivery details.
          </p>
          <button
            onClick={() => {
              window.dispatchEvent(new Event('open-profile-drawer'));
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#008DDA] hover:bg-[#0077B6] text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-colors shadow-sm cursor-pointer"
          >
            <User className="h-4 w-4" />
            <span>Click to Log In</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 text-left select-none bg-[#FBF9F1] min-h-[85vh]">
      {/* Flipkart Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-1 text-slate-700 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-serif text-xl sm:text-2xl font-black text-slate-900">
            My Orders
          </h1>
        </div>
        <span className="text-xs font-bold text-[#008DDA] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {/* Flipkart Search & Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              placeholder="Search your order here"
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008DDA] shadow-xs"
            />
            {orderSearchQuery && (
              <button
                onClick={() => setOrderSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 text-xs"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span>Filters</span>
          </button>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {['All', 'In Progress', 'Completed', 'Processing'].map((tab) => (
            <button
              key={tab}
              onClick={() => setOrderCategoryTab(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                orderCategoryTab === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tab === 'All' ? 'All Orders' : tab}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full space-y-4">
        {loading ? (
          <div className="flex py-20 w-full items-center justify-center bg-white border border-slate-200 rounded-2xl">
            <Loader2 className="h-7 w-7 animate-spin text-[#008DDA]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-12 text-center bg-white shadow-xs animate-fadeIn">
            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4">
              No orders found under phone number <strong>{phone}</strong>. Let's create your first order!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-[#008DDA] hover:bg-[#0077B6] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
            >
              Explore Teak Designs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders
              .filter(o => {
                if (orderCategoryTab !== 'All' && o.status !== orderCategoryTab) return false;
                if (orderSearchQuery.trim() !== '') {
                  const q = orderSearchQuery.toLowerCase();
                  return o.product?.toLowerCase().includes(q) || o._id?.toLowerCase().includes(q);
                }
                return true;
              })
              .map((order) => {
                const isCancelled = order.status === 'Cancelled';
                const userSubmittedRating = ratedOrders[order._id];
                const orderShortId = order._id.substring(18).toUpperCase();
                const hasPendingVerifications = order.payments?.some(p => p.status === 'Pending');

                // Flipkart Style Delivery Status Text
                const displayStatusText = order.status === 'Completed'
                  ? `Delivered on ${new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}`
                  : order.status === 'In Progress'
                  ? `In Progress (Crafting) • ETA ${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'Soon'}`
                  : `Order ${order.status || 'Received'}`;

                // Image helper with fallback for Teakwood furniture
                const getDisplayImage = (imgUrl, productName) => {
                  if (imgUrl && typeof imgUrl === 'string' && imgUrl.trim().length > 5) {
                    return imgUrl.trim();
                  }
                  const pName = (productName || '').toLowerCase();
                  if (pName.includes('door') || pName.includes('దారబంధం')) {
                    return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80';
                  }
                  if (pName.includes('bed') || pName.includes('cot') || pName.includes('మంచం')) {
                    return 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&q=80';
                  }
                  if (pName.includes('mandir') || pName.includes('pooja') || pName.includes('పూజ')) {
                    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80';
                  }
                  if (pName.includes('dining') || pName.includes('table')) {
                    return 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=80';
                  }
                  if (pName.includes('sofa') || pName.includes('couch')) {
                    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80';
                  }
                  return 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80';
                };

                const cardImgSrc = getDisplayImage(order.imageUrl || order.designImage || order.referenceImage || order.image, order.product);

                return (
                  <div
                    key={order._id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 text-left animate-fadeIn group"
                  >
                    {/* Top Main Row (Clickable to open Order Details Modal) */}
                    <div 
                      onClick={() => setActiveOrderDetail(order)}
                      className="flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={cardImgSrc}
                          alt={order.product}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80';
                          }}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-100 bg-slate-50 shrink-0 group-hover:scale-105 transition-transform"
                        />

                        <div className="min-w-0">
                          {/* Flipkart Status Title Line */}
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${order.status === 'Completed' ? 'bg-emerald-500' : 'bg-[#008DDA] animate-pulse'}`}></span>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                              {displayStatusText}
                            </h4>
                          </div>

                          {/* Product Title */}
                          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5 font-medium">
                            {order.product}
                          </p>

                          {/* Meta ID & Price */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: LD-{orderShortId}
                            </span>
                            {order.totalPrice > 0 && (
                              <span className="text-xs font-black text-slate-900 font-mono">
                                ₹{order.totalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Flipkart Right Arrow Chevron */}
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>

                    {/* Live Order Status Visual Progress Tracker Bar */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-2">
                        <span className="flex items-center gap-1 uppercase tracking-wider text-[#008DDA]">
                          <MapPin className="h-3 w-3 animate-pulse" />
                          Live Status Track
                        </span>
                        <span className="text-slate-400 font-mono">
                          Updated: {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* 4-Step Progress Line Bar */}
                      <div className="relative flex items-center justify-between my-3 px-2">
                        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0"></div>
                        <div 
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 transition-all duration-500 -z-0"
                          style={{
                            width: order.status === 'Completed' ? '100%' : order.status === 'In Progress' ? '66%' : order.status === 'Processing' ? '33%' : '10%'
                          }}
                        ></div>

                        {/* Step 1: Order Received */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                            ✓
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 mt-1">Booked</span>
                        </div>

                        {/* Step 2: Processing */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${
                            ['Processing', 'In Progress', 'Completed'].includes(order.status)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {['Processing', 'In Progress', 'Completed'].includes(order.status) ? '✓' : '2'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 mt-1">Sizing</span>
                        </div>

                        {/* Step 3: In Progress (Crafting) */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${
                            ['In Progress', 'Completed'].includes(order.status)
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {['In Progress', 'Completed'].includes(order.status) ? '✓' : '3'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 mt-1">Crafting</span>
                        </div>

                        {/* Step 4: Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${
                            order.status === 'Completed'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {order.status === 'Completed' ? '✓' : '4'}
                          </div>
                          <span className="text-[9px] font-bold text-slate-700 mt-1">Delivered</span>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Payment Action Bar (When payment is pending / balance > 0) */}
                    {(order.remainingBalance > 0 || order.paymentStatus !== 'Paid') && order.totalPrice > 0 && (
                      <div className="mt-3 p-3.5 bg-sky-50/80 border border-sky-250 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left shadow-xs">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-[#008DDA]">
                            Payment Required ({order.paymentStatus || 'Unpaid'})
                          </p>
                          <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                            Balance Due: <span className="font-mono text-emerald-700 font-black">₹{(order.remainingBalance || order.totalPrice).toLocaleString('en-IN')}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePayOrder(order);
                          }}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#008DDA] to-[#0077B6] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                        >
                          <CreditCard className="h-4 w-4 shrink-0" />
                          <span>Pay Advance / Complete Payment</span>
                        </button>
                      </div>
                    )}

                    {/* Delivery Shipment Tracker Box (Only displayed when admin assigns tracking number / carrier) */}
                    {(order.trackingNumber || order.carrier) ? (
                      <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                            <Truck className="h-4 w-4 text-[#008DDA]" />
                            <span>Delivery Status: <strong className="text-emerald-600">{order.status === 'Completed' ? 'Delivered' : 'In Transit / Dispatched'}</strong></span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                            Carrier: <strong className="text-slate-800">{order.carrier || 'LD Workshop Courier'}</strong> • Waybill: <span className="font-mono text-slate-700">{order.trackingNumber}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setActiveTrackingOrder(order); }}
                          className="px-3.5 py-1.5 bg-[#008DDA] hover:bg-[#0077B6] text-white rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs self-start sm:self-center"
                        >
                          🚚 Track Delivery Status
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <Truck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Order Status: <strong className="text-slate-700">{order.status || 'Processing'}</strong> • Shipment tracking number will be assigned by admin upon workshop dispatch.</span>
                      </div>
                    )}

                    {/* User Payment Receipt & Paid Bill Section */}
                    {order.payments && order.payments.length > 0 && (
                      <div className="mt-3.5 p-3.5 bg-emerald-50/70 border border-emerald-250 rounded-2xl text-left shadow-xs">
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-emerald-200/60">
                          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                            <FileText className="h-4 w-4 text-emerald-700" />
                            <span>💳 Payment Receipt & Paid Bill Details</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                            Product ID: #{order._id.substring(18).toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] mb-2 font-semibold">
                          <div className="bg-white p-2 rounded-xl border border-emerald-100 text-center">
                            <span className="text-[9px] text-slate-500 uppercase font-bold block">Contract Cost</span>
                            <span className="font-mono text-slate-900 font-bold">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100 text-center">
                            <span className="text-[9px] text-emerald-700 uppercase font-bold block">Total Paid</span>
                            <span className="font-mono text-emerald-700 font-black">₹{(order.paidAmount || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-emerald-100 text-center">
                            <span className="text-[9px] text-red-600 uppercase font-bold block">Balance Due</span>
                            <span className="font-mono text-red-650 font-black">₹{(order.remainingBalance || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Payments Txn Log Table */}
                        <div className="mt-2 pt-2 border-t border-emerald-200/60">
                          <p className="text-[9.5px] font-black uppercase tracking-wider text-emerald-900 mb-1.5">Transaction Statement History:</p>
                          <div className="space-y-1 text-[10.5px] font-mono">
                            {order.payments.map((p, idx) => (
                              <div key={idx} className="flex flex-wrap items-center justify-between bg-white p-2 rounded-xl border border-emerald-150 shadow-2xs">
                                <div>
                                  <span className="font-extrabold text-slate-900">₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                                  <span className="text-slate-600 font-sans ml-1.5 text-[9.5px]">via {p.paymentMethod || 'UPI'}</span>
                                  {p.utr && <p className="text-emerald-800 text-[9px] font-bold mt-0.5">Ref / UTR: {p.utr}</p>}
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider ${
                                    p.status === 'Verified' || p.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    p.status === 'Rejected' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {p.status || 'Verified'}
                                  </span>
                                  <p className="text-[8.5px] text-slate-500 font-sans mt-0.5">
                                    {new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Flipkart Bottom Rate & Review Row */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Rate & Review</span>
                        {userSubmittedRating ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Rated {userSubmittedRating} ★
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-light">Earn ⭐ rating points</span>
                        )}
                      </div>

                      {/* 5 Flipkart Rating Stars */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRateProduct(order._id, order.product, star);
                            }}
                            className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                              userSubmittedRating && star <= userSubmittedRating
                                ? 'text-amber-400'
                                : 'text-slate-300 hover:text-amber-400'
                            }`}
                            title={`Rate ${star} Stars`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quick Action Buttons Bar */}
                    <div className="mt-3 flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-dashed border-slate-100">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveShippingSlipOrder(order); }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <Printer className="h-3 w-3 text-amber-700" />
                        <span>Package Billing Slip</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveOrderDetail(order); }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#008DDA] text-[10px] font-bold transition-all cursor-pointer"
                      >
                        <FileText className="h-3 w-3" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                    {/* Product Summary Box */}
                    <div className="p-3 bg-[#008DDA]/10 border border-[#008DDA]/30 rounded-2xl text-left">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#008DDA]">Product & Order Details</p>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">{activePayOrder.product}</p>
                      <p className="text-[10.5px] font-mono font-black text-slate-700 mt-0.5">
                        Product ID: #{activePayOrder._id.substring(18).toUpperCase()}
                      </p>
                    </div>

                    {/* Option 1: Mobile App launcher */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 animate-fadeIn text-left">
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-900 block mb-2">⚡ Direct 1-Click Pay in PhonePe / GPay / Paytm</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <a
                          href={`phonepe://pay?pa=9346325291@ybl&pn=TEKI%20PAVAN%20SAI&am=${getPayableAmount()}&cu=INR`}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm text-center cursor-pointer active:scale-95"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>🚀 Open PhonePe App (₹{getPayableAmount().toLocaleString('en-IN')})</span>
                        </a>

                        <a
                          href={`upi://pay?pa=9346325291@ybl&pn=TEKI%20PAVAN%20SAI&am=${getPayableAmount()}&cu=INR`}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold uppercase tracking-wider transition-all shadow-sm text-center cursor-pointer active:scale-95"
                        >
                          <Smartphone className="h-4 w-4" />
                          <span>🚀 Open GPay / Any UPI App</span>
                        </a>
                      </div>

                      <p className="text-[9px] text-emerald-800 font-medium">
                        * బటన్ నొక్కగానే డైరెక్ట్‌గా PhonePe / GPay యాప్ ఓపెన్ అయ్యి, exact amount pre-fill అవుతుంది.
                      </p>
                    </div>

                    {/* Option 2: Scan QR code */}
                    <div className="bg-white border border-wood-border/40 rounded-2xl p-4 text-center animate-fadeIn shadow-inner flex flex-col items-center justify-center">
                      <span className="text-[9.5px] uppercase font-bold tracking-wider text-wood-accent block mb-2.5">Option 2: Scan QR Code (Laptops/Computers)</span>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getUpiUrl())}`}
                        alt="Scan UPI QR Code"
                        className="w-36 h-36 object-contain border border-neutral-100 rounded-lg p-1 bg-white"
                      />
                      <div className="mt-2.5">
                        <p className="text-[10px] text-wood-medium font-bold uppercase tracking-wider">Payable Amount: <span className="text-emerald-700 font-extrabold text-xs">₹{getPayableAmount().toLocaleString('en-IN')}</span></p>
                        <p className="text-[9px] text-wood-light font-mono mt-0.5 select-all">UPI ID: 9346325291@ybl</p>
                        <p className="text-[8.5px] text-slate-700 font-bold tracking-wide mt-1">
                          Product ID: <span className="bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded font-mono font-bold select-all">#{activePayOrder._id.substring(18).toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Verification UTR Input */}
                    <div className="bg-amber-50/70 border-2 border-amber-300/80 rounded-2xl p-4 animate-fadeIn text-left space-y-2">
                      <label className="block text-[10px] uppercase font-extrabold tracking-wider text-amber-900">
                        Enter 12-Digit Transaction Ref / UTR No (తప్పనిసరి) *
                      </label>
                      <input
                        type="text"
                        required
                        value={utrInput}
                        onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
                        placeholder="e.g. 420198765432 (12-digit Ref No)"
                        className="w-full rounded-xl border border-amber-400 bg-white px-4 py-2.5 text-xs font-mono font-bold text-wood-dark focus:border-wood-accent focus:outline-none transition-colors shadow-xs"
                      />
                      <p className="text-[9px] text-amber-800 leading-relaxed font-medium">
                        ⚠️ GPay / PhonePe / Paytm లో అమౌంట్ ట్రాన్స్‌ఫర్ చేసిన తర్వాత కనిపించే <strong>12 అంకెల Ref / UTR Number</strong> ను ఇక్కడ టైప్ చేసి కన్ఫర్మ్ చేయండి.
                      </p>
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

      {/* PRINTABLE SHIPPING & DISPATCH BILLING SLIP MODAL */}
      {activeShippingSlipOrder && (
        <ShippingSlipModal
          order={activeShippingSlipOrder}
          userProfile={{
            name: profileName,
            phone: profilePhone,
            address: profileAddress
          }}
          onClose={() => setActiveShippingSlipOrder(null)}
        />
      )}

      {/* FULL CLICKABLE ORDER DETAILS MODAL */}
      {activeOrderDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn" onClick={() => setActiveOrderDetail(null)}>
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl text-left relative animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveOrderDetail(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-[#008DDA] font-bold text-xs uppercase tracking-widest mb-1">
              <FileText className="h-4 w-4" />
              <span>Full Order Specification</span>
            </div>
            
            <h3 className="font-serif text-xl font-black text-slate-900 leading-tight mb-4">
              {activeOrderDetail.product}
            </h3>

            {/* Product Image */}
            <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden mb-5 border border-slate-200 shadow-md bg-slate-950">
              <img
                src={activeOrderDetail.imageUrl || activeOrderDetail.designImage || activeOrderDetail.referenceImage || 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80'}
                alt={activeOrderDetail.product}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&q=80';
                }}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Details Grid */}
            <div className="space-y-3 divide-y divide-slate-100 text-xs text-slate-700">
              <div className="pt-2 flex justify-between">
                <span className="font-bold text-slate-500">Order ID:</span>
                <span className="font-mono font-extrabold text-[#008DDA]">LD-{activeOrderDetail._id?.substring(18).toUpperCase()}</span>
              </div>

              <div className="pt-2.5 flex justify-between">
                <span className="font-bold text-slate-500">Booking Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeOrderDetail.status || 'Received'}
                </span>
              </div>

              <div className="pt-2.5 flex justify-between">
                <span className="font-bold text-slate-500">Payment Status:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {activeOrderDetail.paymentStatus || 'Pending'}
                </span>
              </div>

              <div className="pt-2.5 flex justify-between">
                <span className="font-bold text-slate-500">Total Valuation:</span>
                <span className="font-extrabold text-slate-900 font-mono text-sm">
                  {activeOrderDetail.totalPrice > 0 ? `₹${activeOrderDetail.totalPrice.toLocaleString('en-IN')}` : 'Custom Estimate'}
                </span>
              </div>

              {activeOrderDetail.customSize && (
                <div className="pt-2.5 flex justify-between">
                  <span className="font-bold text-slate-500">Custom Dimensions:</span>
                  <span className="font-medium text-slate-900">{activeOrderDetail.customSize}</span>
                </div>
              )}

              {activeOrderDetail.address && (
                <div className="pt-2.5">
                  <span className="font-bold text-slate-500 block mb-1">Delivery Address:</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium">
                    {activeOrderDetail.address}
                  </p>
                </div>
              )}

              {activeOrderDetail.notes && (
                <div className="pt-2.5">
                  <span className="font-bold text-slate-500 block mb-1">Custom Notes:</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic">
                    {activeOrderDetail.notes}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveOrderDetail(null)}
              className="mt-6 w-full py-3 bg-[#008DDA] hover:bg-[#0077B6] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
            >
              Done / Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
