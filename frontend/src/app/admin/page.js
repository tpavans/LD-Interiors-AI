"use client";
import { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { Loader2, Plus, Edit, Trash2, X, Upload, CheckCircle2, AlertTriangle, Eye, CreditCard, Check, ShieldCheck, DollarSign, Truck, Calendar, Play, Printer } from 'lucide-react';
import ShippingSlipModal from '@/components/ShippingSlipModal';
import Link from 'next/link';

const CATEGORIES = ["Living Room", "Kitchen", "Bedroom", "Kids Room", "Sofas", "Wooden Beds", "Dining Tables", "TV Units", "Uyyala Swings", "Wooden Windows", "Mesh Doors", "Polish Items", "Money Boxes", "Glass Windows", "Office", "Bathroom", "Puja Mandiralu", "Gummalu", "Dressing Tables"];

const getBilingualGreetingText = (o) => {
  const orderDate = o.createdAt 
    ? new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
      })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

  const orderTime = o.createdAt 
    ? new Date(o.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
      })
    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

  const resolvedImageUrl = o.imageUrl
    ? (o.imageUrl.startsWith('http') ? o.imageUrl : `https://ld-interiors-ai.vercel.app${o.imageUrl.startsWith('/') ? '' : '/'}${o.imageUrl}`)
    : 'https://ld-interiors-ai.vercel.app/products';

  return `🏠 Welcome to LD Interiors!

Hello Mr./Ms. ${o.name}, 👋

Thank you for choosing LD Interiors. We sincerely appreciate your trust in us.

🎉 Your order has been received successfully!

📦 Order Details
🪑 Name: ${o.product}
📂 Category: ${o.category || 'Furniture Design'}
💰 Price: ${o.price && o.price > 0 ? `₹${o.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
🖼️ Image URL: ${resolvedImageUrl}
📅 Order Date: ${orderDate}
⏰ Order Time: ${orderTime}

Our team is currently reviewing your order. One of our interior design experts will contact you within 24 hours to confirm your order, discuss your requirements, and guide you through the next steps.

🌐 Track your order anytime by visiting our website:
https://ld-interiors-ai.vercel.app/

If you have any questions or need assistance, feel free to contact us anytime.

Thank you for choosing LD Interiors. We look forward to transforming your dream space into reality. ❤️

Warm Regards,

🏠 LD Interiors Team
📞 +91 93463 25291

"Designing Beautiful Spaces, Creating Happy Homes." ✨

---------------------------------------------------------

🏠 LD Interiors కి స్వాగతం!

నమస్కారం ${o.name} గారికి, 🙏

LD Interiors ను ఎంపిక చేసుకున్నందుకు హృదయపూర్వక ధన్యవాదాలు.

🎉 మీ ఆర్డర్ విజయవంతంగా మాకు అందింది.

📦 మీ ఆర్డర్ వివరాలు
🪑 ఉత్పత్తి పేరు: ${o.product}
📂 విభాగం: ${o.category || 'Furniture Design'}
💰 ధర: ${o.price && o.price > 0 ? `₹${o.price.toLocaleString('en-IN')}` : 'Contact for pricing'}
🖼️ చిత్రం లింక్: ${resolvedImageUrl}
📅 తేదీ: ${orderDate}
⏰ సమయం: ${orderTime}

మీ ఆర్డర్ను మా నిపుణుల బృందం పరిశీలిస్తోంది.

📞 రాబోయే 24 గంటల్లోపు మా LD Interiors ప్రతినిధి మిమ్మల్ని సంప్రదించి, మీ ఆర్డర్ను నిర్ధారించి తదుపరి ప్రక్రియ గురించి పూర్తి వివరాలు తెలియజేస్తారు.

🌐 మీ ఆర్డర్ పురోగతిని ఎప్పుడైనా మా వెబ్సైట్లో ట్రాక్ చేయవచ్చు:
https://ld-interiors-ai.vercel.app/

🔍 'My Orders' విభాగంలోకి వెళ్లి మీ ఆర్డర్ స్థితిని సులభంగా తెలుసుకోవచ్చు.

✨ మీ కలల ఇంటిని అందంగా, ఆధునికంగా, మీ అభిరుచికి అనుగుణంగా తీర్చిదిద్దడం మా లక్ష్యం.

మాపై మీరు ఉంచిన నమ్మకానికి మరోసారి హృదయపూర్వక ధన్యవాదాలు. మీ ఇంటిని మరింత అందంగా తీర్చిదిద్దే ఈ ప్రయాణంలో మీతో కలిసి ఉండడం మా అదృష్టంగా భావిస్తున్నాము. ❤️

ధన్యవాదాలతో,

🏠 LD Interiors బృందం
📞 +91 93463 25291
🌐 https://ld-interiors-ai.vercel.app/

"మీ కలలకు అందమైన రూపం... మీ ఇంటికి అద్భుతమైన డిజైన్... అదే LD Interiors." ✨`;
};

const getStatusUpdateGreetingText = (o, status) => {
  const statusNotesEn = {
    'Pending': 'We have received your order request and are currently conducting initial custom requirement reviews.',
    'Processing': 'Final size and pricing check is in progress—coordinating raw materials & custom wood selections.',
    'In Progress': 'Modern carpentry wood carvings & framing has started at our workshop. Master craftsmen are building your custom designs.',
    'Completed': 'Order completed and delivered successfully. Direct home installation setup is finished.',
    'Cancelled': 'This order has been cancelled or modified. Please contact us for further details.'
  };

  const statusNotesTe = {
    'Pending': 'మీ ఆర్డర్ అభ్యర్థన విజయవంతంగా చేరింది. మేము ప్రస్తుతం ప్రాథమిక సమీక్ష జరుపుతున్నాము.',
    'Processing': 'మీ ఆర్డర్ ప్రాసెస్ చేయబడుతోంది. చివరి పరిమాణం, ధర మరియు కలప ఎంపికల సమన్వయం జరుగుతోంది.',
    'In Progress': 'మా వర్క్‌షాప్‌లో మీ ఆర్డర్ తయారీ ప్రక్రియ ప్రారంభమైంది. మా నిపుణులైన వడ్రంగులు మీ డిజైన్‌ను రూపొందిస్తున్నారు.',
    'Completed': 'మీ ఆర్డర్ విజయవంతంగా పూర్తయింది మరియు డెలివరీ చేయబడింది. గృహంలో ఇన్‌స్టాలేషన్ కూడా పూర్తయింది.',
    'Cancelled': 'ఈ ఆర్డర్ రద్దు చేయబడింది లేదా సవరించబడింది. దయచేసి వివరాల కోసం మమ్మల్ని సంప్రదించండి.'
  };

  const noteEn = statusNotesEn[status] || 'Your order status has been updated.';
  const noteTe = statusNotesTe[status] || 'మీ ఆర్డర్ స్థితి నవీకరించబడింది.';

  return `🔔 LD Interiors Order Update / ఆర్డర్ స్థితి అప్‌డేట్

Hello Mr./Ms. ${o.name}, 👋

We have updated the progress timeline for your order of "${o.product}":

🔨 Current Status: ${status}
📝 Status Note: ${noteEn}

🌐 Track your live progress anytime on our website:
https://ld-interiors-ai.vercel.app/orders

Thank you for choosing LD Interiors! ❤️

---------------------------------------------------------

నమస్కారం ${o.name} గారికి, 🙏

మీరు ఆర్డర్ చేసిన "${o.product}" యొక్క స్థితి అప్‌డేట్ చేయబడింది:

🔨 ప్రస్తుత స్థితి: ${status === 'Pending' ? 'Pending (పెండింగ్)' : 
                   status === 'Processing' ? 'Processing (ప్రాసెస్ అవుతోంది)' : 
                   status === 'In Progress' ? 'In Progress (తయారీలో ఉంది)' : 
                   status === 'Completed' ? 'Completed (పూర్తయింది)' : 'Cancelled (రద్దు చేయబడింది)'}
📝 వివరణ: ${noteTe}

🌐 మీ ఆర్డర్ ప్రగతిని ఎప్పుడైనా మా వెబ్సైట్‌లో ట్రాక్ చేయవచ్చు:
https://ld-interiors-ai.vercel.app/orders

LD Interiors ను ఎంపిక చేసుకున్నందుకు ధన్యవాదాలు! ❤️

🏠 LD Interiors Team
📞 +91 93463 25291`;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSecretPassed, setIsSecretPassed] = useState(false);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Form State (for both Upload and Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('5');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Status/Error States
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Admin Active Tab & Orders States
  const [adminTab, setAdminTab] = useState('showcase'); // 'showcase', 'orders', or 'payments'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pendingGreetingOrder, setPendingGreetingOrder] = useState(null);

  // Pricing Modal State
  const [activePricingOrder, setActivePricingOrder] = useState(null);
  const [totalPriceInput, setTotalPriceInput] = useState('');
  const [updateToAwaitingAdvance, setUpdateToAwaitingAdvance] = useState(true);
  const [pricingError, setPricingError] = useState('');
  const [pricingSuccess, setPricingSuccess] = useState('');
  const [pricingLoading, setPricingLoading] = useState(false);

  // Delivery Tracking & Shipping Slip Modal State
  const [activeDeliveryOrder, setActiveDeliveryOrder] = useState(null);
  const [activeShippingSlipOrder, setActiveShippingSlipOrder] = useState(null);
  const [deliveryDateInput, setDeliveryDateInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('Xpressbees');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [deliveryError, setDeliveryError] = useState('');
  const [deliverySuccess, setDeliverySuccess] = useState('');
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Payments verification action loading
  const [paymentActionLoading, setPaymentActionLoading] = useState({}); // paymentId -> boolean
  const [verifiedAmounts, setVerifiedAmounts] = useState({}); // paymentId -> number string

  // Category Management State
  const [categoriesList, setCategoriesList] = useState([]);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  const fileInputRef = useRef(null);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ld_token');
      const params = new URLSearchParams(window.location.search);
      const hasSecretParam = params.get('pass') === 'ld-pavan' || params.get('pavan') === 'true' || params.get('secret') === 'pavan';
      const hasStoredSecret = localStorage.getItem('ld_admin_secret_passed') === 'true';

      if (token) {
        try {
          await api.get('/auth/me');
          setIsAuthenticated(true);
          setIsSecretPassed(true);
          localStorage.setItem('ld_admin_secret_passed', 'true');
          fetchProducts();
          fetchOrders();
          fetchCategories();
        } catch (err) {
          console.error('Session verification error:', err);
          const isUnauthorized = err.response && (err.response.status === 401 || err.response.status === 403);
          if (isUnauthorized) {
            localStorage.removeItem('ld_token');
            localStorage.removeItem('ld_admin');
            window.dispatchEvent(new Event('admin-logout'));
            if (!hasSecretParam && !hasStoredSecret) {
              window.location.href = '/';
              return;
            }
          } else {
            // Server cold start or network error: assume valid to prevent kick-out
            setIsAuthenticated(true);
            setIsSecretPassed(true);
            localStorage.setItem('ld_admin_secret_passed', 'true');
            fetchProducts();
            fetchOrders();
            fetchCategories();
          }
        }
      } else if (!hasSecretParam && !hasStoredSecret) {
        window.location.href = '/';
        return;
      }

      if (hasSecretParam || hasStoredSecret) {
        setIsSecretPassed(true);
        if (hasSecretParam) {
          localStorage.setItem('ld_admin_secret_passed', 'true');
        }
        fetchCategories();
      }
      setAuthLoading(false);
    };
    checkAuth();
  }, []);

  // 1b. Check query params for mail-initiated actions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const orderId = urlParams.get('orderId');

    if (action === 'send-greeting' && orderId) {
      setPendingGreetingOrder(orderId);
      window.history.replaceState({}, document.title, window.location.pathname);
      setAdminTab('orders');
    }
  }, []);

  // 2. Fetch all products
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setProductsLoading(false);
    }
  };

  // 2b. Fetch all orders
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // 2c. Fetch Categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategoriesList(response.data);
      if (response.data.length > 0 && (!category || category === CATEGORIES[0])) {
        setCategory(response.data[0].name);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddCategory = async (e) => {
    if (e) e.preventDefault();
    if (!newCategoryInput.trim()) return;
    setFormError('');
    setFormSuccess('');
    setCategoryLoading(true);
    try {
      const res = await api.post('/categories', { name: newCategoryInput.trim() });
      setNewCategoryInput('');
      await fetchCategories();
      setCategory(res.data.name);
      setFormSuccess(`Category "${res.data.name}" added successfully!`);
    } catch (err) {
      console.error('Error adding category:', err);
      setFormError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    setFormError('');
    setFormSuccess('');
    try {
      await api.delete(`/categories/${catId}`);
      await fetchCategories();
      setFormSuccess(`Category "${catName}" removed successfully!`);
    } catch (err) {
      console.error('Error deleting category:', err);
      setFormError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // 2c. Update Order Status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}`, { status: newStatus });
      
      const order = orders.find(o => o._id === id);
      if (order) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        
        const cleanPhone = order.phone.replace(/\D/g, '');
        const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
        
        const statusUpdateMsg = getStatusUpdateGreetingText(order, newStatus);
        
        const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(statusUpdateMsg)}`;
        window.open(waUrl, '_blank');
        
        const subject = `🔨 Order Progress: ${order.product} is ${newStatus}`;
        const mailtoUrl = `mailto:${order.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(statusUpdateMsg)}`;
        window.open(mailtoUrl, '_blank');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  // 2d. Delete Order Record
  const handleDeleteOrder = async (id, customerName) => {
    if (!window.confirm(`Are you sure you want to delete the order from "${customerName}"?`)) {
      return;
    }
    try {
      await api.delete(`/orders/${id}`);
      setOrders(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order. Please try again.');
    }
  };

  // 3. Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...adminData } = response.data;

      localStorage.setItem('ld_token', token);
      localStorage.setItem('ld_admin', JSON.stringify(adminData));
      localStorage.setItem('ld_admin_secret_passed', 'true');
      setIsAuthenticated(true);
      setIsSecretPassed(true);

      window.dispatchEvent(new Event('admin-login'));

      fetchProducts();
      fetchOrders();
    } catch (err) {
      console.error('Login error:', err);
      setLoginError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    setSimulatedOtp('');
    
    try {
      const response = await api.post('/auth/send-otp', { phone, isAdmin: true });
      setIsOtpSent(true);
      setSimulatedOtp(response.data.otp);
    } catch (err) {
      console.error('OTP Send error:', err);
      setLoginError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    try {
      const response = await api.post('/auth/verify-otp', { phone, otp, isAdmin: true });
      const { token, ...adminData } = response.data;

      localStorage.setItem('ld_token', token);
      localStorage.setItem('ld_admin', JSON.stringify(adminData));
      localStorage.setItem('ld_admin_secret_passed', 'true');
      setIsAuthenticated(true);
      setIsSecretPassed(true);

      window.dispatchEvent(new Event('admin-login'));

      fetchProducts();
      fetchOrders();
    } catch (err) {
      console.error('OTP Verification error:', err);
      setLoginError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Handle File Selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      setFormError('Please select valid image files only.');
      return;
    }

    if (validFiles.length > 5) {
      setFormError('You can upload a maximum of 5 images per product.');
      return;
    }

    setImageFiles(validFiles);

    const previews = [];
    let loadedCount = 0;
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        loadedCount++;
        if (loadedCount === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    setFormError('');
  };

  // 5. Handle Form Submit (Upload / Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title.trim()) {
      setFormError('Please enter a title.');
      return;
    }

    if (!isEditing && imageFiles.length === 0) {
      setFormError('Please select at least one image file to upload.');
      return;
    }

    setFormLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('price', price ? Number(price) : 0);
      formData.append('description', description);
      formData.append('rating', Number(rating));
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append('images', file);
        });
      }
      if (videoFile) {
        formData.append('video', videoFile);
      } else {
        formData.append('video', youtubeUrl.trim());
      }

      if (isEditing) {
        await api.put(`/products/${editId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFormSuccess('Product updated successfully!');
        resetForm();
      } else {
        await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFormSuccess('Design product uploaded successfully!');
        resetForm();
      }
      fetchProducts();
    } catch (err) {
      console.error('Form submit error:', err);
      setFormError(err.response?.data?.message || 'Server error occurred during save.');
    } finally {
      setFormLoading(false);
    }
  };

  const startEditProduct = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setTitle(product.title);
    setCategory(product.category);
    setPrice(product.price ? product.price.toString() : '');
    setDescription(product.description || '');
    setRating(product.rating ? product.rating.toString() : '5');
    setImagePreviews(product.images && product.images.length > 0 ? product.images : [product.image]);
    setImageFiles([]);
    if (product.video && (product.video.includes('youtube.com') || product.video.includes('youtu.be'))) {
      setYoutubeUrl(product.video);
      setVideoPreview('');
    } else {
      setYoutubeUrl('');
      setVideoPreview(product.video || '');
    }
    setVideoFile(null);
    setFormError('');
    setFormSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      if (isEditing && editId === id) {
        resetForm();
      }
    } catch (err) {
      console.error('Deletion error:', err);
      alert('Failed to delete the design. Please try again.');
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId('');
    setTitle('');
    setCategory(CATEGORIES[0]);
    setPrice('');
    setDescription('');
    setRating('5');
    setImageFiles([]);
    setImagePreviews([]);
    setVideoFile(null);
    setVideoPreview('');
    setYoutubeUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 10. Update pricing handler & WhatsApp Payment message launch
  const handleSavePricing = async (e) => {
    e.preventDefault();
    if (!activePricingOrder) return;
    
    setPricingError('');
    setPricingSuccess('');
    setPricingLoading(true);

    try {
      const priceVal = Number(totalPriceInput);
      if (isNaN(priceVal) || priceVal < 0) {
        setPricingError('Please enter a valid contract price.');
        setPricingLoading(false);
        return;
      }

      await api.put(`/orders/${activePricingOrder._id}/pricing`, {
        totalPrice: priceVal,
        status: updateToAwaitingAdvance ? 'Processing' : undefined
      });

      setPricingSuccess('Order pricing updated successfully!');
      
      // Update locally
      setOrders(prev => prev.map(o => o._id === activePricingOrder._id 
        ? { 
            ...o, 
            totalPrice: priceVal, 
            remainingBalance: priceVal - o.paidAmount,
            status: updateToAwaitingAdvance ? 'Processing' : o.status
          } 
        : o
      ));

      // Trigger automatic WhatsApp price message window opening
      const cleanPhone = activePricingOrder.phone.replace(/\D/g, '');
      const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
      
      const advance = Math.round(priceVal / 2);
      const priceMsg = `🏠 LD Interiors: Sizing & Pricing Finalized! / ఆర్డర్ ధర ఖరారు చేయబడింది

Dear Mr./Ms. ${activePricingOrder.name} గారికి, 🙏

Nagaraju here. We have finalized the sizing and contract price for your custom design order of "${activePricingOrder.product}":

💵 Final Agreed Price: ₹${priceVal.toLocaleString('en-IN')}
💰 50% Booking Advance: ₹${advance.toLocaleString('en-IN')}

To begin crafting your custom design at our Alamuru workshop, please pay the 50% advance or full price:
👉 Pay here: https://ld-interiors-ai.vercel.app/orders

Warm regards,
Nagaraju (Owner)
LD Interiors & Furnitures
📞 +91 93463 25291`;

      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(priceMsg)}`;
      window.open(waUrl, '_blank');

      setTimeout(() => {
        setActivePricingOrder(null);
        setTotalPriceInput('');
      }, 1200);

    } catch (err) {
      console.error('Pricing save failed:', err);
      setPricingError(err.response?.data?.message || 'Failed to update order price. Please try again.');
    } finally {
      setPricingLoading(false);
    }
  };

  // 11. Save delivery tracking data
  const handleSaveDeliveryTracking = async (e) => {
    e.preventDefault();
    if (!activeDeliveryOrder) return;

    setDeliveryError('');
    setDeliverySuccess('');
    setDeliveryLoading(true);

    try {
      await api.put(`/orders/${activeDeliveryOrder._id}/delivery-tracking`, {
        deliveryDate: deliveryDateInput || null,
        carrier: carrierInput,
        trackingNumber: trackingNumberInput
      });

      setDeliverySuccess('Delivery & Tracking parameters saved successfully!');

      setOrders(prev => prev.map(o => o._id === activeDeliveryOrder._id
        ? {
            ...o,
            deliveryDate: deliveryDateInput ? new Date(deliveryDateInput) : null,
            carrier: carrierInput,
            trackingNumber: trackingNumberInput
          }
        : o
      ));

      setTimeout(() => {
        setActiveDeliveryOrder(null);
        setDeliveryDateInput('');
        setTrackingNumberInput('');
      }, 1200);

    } catch (err) {
      console.error('Delivery tracking save failed:', err);
      setDeliveryError(err.response?.data?.message || 'Failed to update delivery tracking details. Please try again.');
    } finally {
      setDeliveryLoading(false);
    }
  };

  // 12. Send WhatsApp Balance & Delivery Reminder
  const handleSendBalanceReminder = (o) => {
    const cleanPhone = o.phone.replace(/\D/g, '');
    const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
    
    const dateStr = o.deliveryDate 
      ? new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : 'tomorrow';
      
    const deliveryMsg = `🚚 LD Interiors: Delivery Schedule & Balance Statement / డెలివరీ సమాచారం

Dear Mr./Ms. ${o.name} గారికి, 🙏

Nagaraju here. Your custom furniture "${o.product}" is scheduled for delivery on ${dateStr}!

⚖️ Outstanding Balance: ₹${o.remainingBalance.toLocaleString('en-IN')}
📦 Carrier tracking ID (${o.carrier || 'Xpressbees'}): ${o.trackingNumber || 'Self-Transport'}

You can pay the remaining balance online before delivery, or pay cash/UPI directly during installation:
👉 Pay online: https://ld-interiors-ai.vercel.app/orders

We are excited to deliver your premium furniture! ❤️

LD Interiors & Furnitures
📞 +91 93463 25291`;

    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(deliveryMsg)}`, '_blank');
  };

  // 13. Verify payment installment
  const handleVerifyPayment = async (orderId, paymentId, action, finalAmt) => {
    const confirmation = window.confirm(`Are you sure you want to ${action} this payment installment?`);
    if (!confirmation) return;

    setPaymentActionLoading(prev => ({ ...prev, [paymentId]: true }));

    try {
      const res = await api.post(`/orders/${orderId}/payments/${paymentId}/verify`, { 
        action,
        verifiedAmount: finalAmt !== undefined ? Number(finalAmt) : undefined
      });
      
      // Update order state locally
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      
      alert(`Payment installment was successfully ${action}ed.`);
    } catch (err) {
      console.error('Payment verification failed:', err);
      alert(err.response?.data?.message || 'Failed to verify payment installment. Please try again.');
    } finally {
      setPaymentActionLoading(prev => ({ ...prev, [paymentId]: false }));
    }
  };

  if (authLoading || (!isAuthenticated && !isSecretPassed)) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12 bg-wood-cream/30">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-md border border-wood-border/60 rounded-3xl p-8 shadow-xl text-left glow-on-hover">
          <div className="text-center mb-6">
            <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase bg-wood-accent/20 px-3 py-1 rounded-full">
              Secure Auth
            </span>
            <h1 className="font-serif text-2xl font-bold text-wood-dark mt-4">
              Admin Login
            </h1>
            <p className="mt-2 text-xs text-wood-light font-light">
              Access the LD Interiors & Furnitures Dashboard
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                Email Address
              </label>
              <input
                type="password"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-wood-border/60 px-4 py-3 text-sm focus:border-wood-accent focus:ring-2 focus:ring-wood-accent/15 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-wood-border/60 px-4 py-3 text-sm focus:border-wood-accent focus:ring-2 focus:ring-wood-accent/15 focus:outline-none transition-all"
              />
            </div>

            {loginError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100 animate-fadeIn">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-dark px-6 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm hover:bg-wood-medium focus:outline-none disabled:bg-neutral-400 transition-all duration-300 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filter pending payments verification array
  const pendingPayments = orders.reduce((acc, order) => {
    if (order.payments && order.payments.length > 0) {
      order.payments.forEach(pay => {
        if (pay.status === 'Pending') {
          acc.push({ ...pay, orderId: order._id, customerName: order.name, productName: order.product, fullOrder: order });
        }
      });
    }
    return acc;
  }, []);

  // DASHBOARD RENDER
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Dashboard Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-wood-border/40 pb-6 gap-4">
        <div className="text-left">
          <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
            Admin Workspace
          </span>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight text-wood-dark mt-1">
            Office Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="flex items-center gap-1.5 rounded-full border border-wood-border px-4 py-2 text-xs font-semibold tracking-wide text-wood-light hover:text-wood-dark transition-all duration-300"
          >
            <Eye className="h-3.5 w-3.5" />
            View Live Site
          </Link>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap border-b border-wood-border/30 mb-8 gap-6 text-left select-none">
        <button
          onClick={() => setAdminTab('showcase')}
          className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
            adminTab === 'showcase'
              ? 'text-wood-accent border-b-2 border-wood-accent'
              : 'text-wood-light hover:text-wood-dark'
          }`}
        >
          Designs Showcase
        </button>
        <button
          onClick={() => { setAdminTab('orders'); fetchOrders(); }}
          className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer ${
            adminTab === 'orders'
              ? 'text-wood-accent border-b-2 border-wood-accent'
              : 'text-wood-light hover:text-wood-dark'
          }`}
        >
          Customer Orders
        </button>
        <button
          onClick={() => { setAdminTab('payments'); fetchOrders(); }}
          className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'payments'
              ? 'text-wood-accent border-b-2 border-wood-accent'
              : 'text-wood-light hover:text-wood-dark'
          }`}
        >
          <span>Verify Payments</span>
          {pendingPayments.length > 0 && (
            <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-[8.5px] font-bold animate-pulse">
              {pendingPayments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setAdminTab('categories'); fetchCategories(); }}
          className={`pb-3.5 text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer flex items-center gap-1.5 ${
            adminTab === 'categories'
              ? 'text-wood-accent border-b-2 border-wood-accent'
              : 'text-wood-light hover:text-wood-dark'
          }`}
        >
          <span>Manage Categories ({categoriesList.length})</span>
        </button>
      </div>

      {/* SHOWCASE PRODUCT TAB */}
      {adminTab === 'showcase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Upload / Edit form */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-md border border-wood-border/60 rounded-3xl p-6 shadow-md text-left glow-on-hover animate-fadeIn">
            <h2 className="font-serif text-lg font-bold text-wood-dark mb-6 flex items-center gap-2">
              {isEditing ? (
                <>
                  <Edit className="h-5 w-5 text-wood-accent" />
                  Edit Layout Details
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-wood-accent" />
                  Upload New Design
                </>
              )}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Design Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Minimalist Nordic Kitchen"
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light">
                    Space Category
                  </label>
                  <button
                    type="button"
                    onClick={() => { setAdminTab('categories'); fetchCategories(); }}
                    className="text-[10px] font-bold text-wood-accent hover:underline cursor-pointer"
                  >
                    + Manage Categories
                  </button>
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark cursor-pointer"
                >
                  {(categoriesList.length > 0 ? categoriesList.map(c => c.name) : CATEGORIES).map((cat) => (
                    <option key={cat} value={cat} className="bg-white text-wood-dark">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Price (₹ INR) - Optional
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 25000 (leave blank or 0 for 'Contact for price')"
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Rating / Feedback Stars
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark cursor-pointer"
                >
                  <option value="5">★★★★★ 5 Stars (Excellent)</option>
                  <option value="4">★★★★☆ 4 Stars (Very Good)</option>
                  <option value="3">★★★☆☆ 3 Stars (Good)</option>
                  <option value="2">★★☆☆☆ 2 Stars (Average)</option>
                  <option value="1">★☆☆☆☆ 1 Star (Poor)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Product Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide details about materials (e.g. Teak wood, rosewood), sizing, custom options..."
                  rows="3"
                  className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark resize-none font-light"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Showcase Images (Select 3-4 images)
                </label>
                <div className="mt-1 flex justify-center rounded-xl border border-dashed border-wood-border px-6 py-6 bg-wood-beige/10 hover:bg-wood-beige/20 transition-colors">
                  <div className="space-y-2 text-center w-full">
                    {imagePreviews.length > 0 ? (
                      <div>
                        <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
                          {imagePreviews.map((preview, idx) => (
                            <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg border border-wood-border/50 shadow-sm bg-white">
                              <img
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setImageFiles([]);
                              setImagePreviews([]);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-[10px] text-red-650 hover:text-red-500 font-bold uppercase tracking-wider cursor-pointer bg-red-50 hover:bg-red-100/80 px-3 py-1 rounded-full border border-red-200 transition-colors"
                          >
                            Clear Images
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Upload className="mx-auto h-8 w-8 text-wood-accent stroke-1" />
                    )}

                    <div className="flex text-xs text-wood-light justify-center pt-1.5">
                      <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-wood-accent hover:text-amber-500 focus-within:outline-none">
                        <span>{imagePreviews.length > 0 ? 'Change files' : 'Select images'}</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          multiple
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-wood-light">PNG, JPG, WEBP up to 10MB (Max 5 images)</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Showcase Video (Optional)
                </label>
                <div className="mt-1 flex justify-center rounded-xl border border-dashed border-wood-border px-6 py-6 bg-wood-beige/10 hover:bg-wood-beige/20 transition-colors">
                  <div className="space-y-2 text-center w-full">
                    {videoPreview ? (
                      <div className="flex flex-col items-center">
                        <div className="relative w-full max-w-xs aspect-video max-h-40 rounded-xl overflow-hidden border border-wood-border bg-black flex items-center justify-center">
                          <video src={videoPreview} controls className="max-w-full max-h-full object-contain" />
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setVideoPreview('');
                              setYoutubeUrl('');
                            }}
                            className="text-[10px] text-red-650 hover:text-red-500 font-bold uppercase tracking-wider cursor-pointer bg-red-50 hover:bg-red-100/80 px-3 py-1 rounded-full border border-red-200 transition-colors"
                          >
                            Remove Video
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Play className="mx-auto h-8 w-8 text-wood-accent stroke-1" />
                        <div className="flex text-xs text-wood-light justify-center pt-1.5">
                          <label className="relative cursor-pointer rounded-md bg-transparent font-semibold text-wood-accent hover:text-amber-500 focus-within:outline-none">
                            <span>Select video file</span>
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setVideoFile(file);
                                  setVideoPreview(URL.createObjectURL(file));
                                  setYoutubeUrl('');
                                }
                              }}
                              accept="video/*"
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <p className="text-[10px] text-wood-light mt-1">MP4, WEBM up to 50MB (Ideal for short clips)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-wood-light mb-1.5">
                    OR Paste YouTube Video URL (Alternative to file upload)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/shorts/... or https://youtu.be/..."
                    value={youtubeUrl}
                    onChange={(e) => {
                      setYoutubeUrl(e.target.value);
                      if (e.target.value) {
                        setVideoFile(null);
                        setVideoPreview('');
                      }
                    }}
                    className="w-full rounded-xl border border-wood-border bg-white px-4 py-2.5 text-xs text-wood-dark focus:border-wood-accent focus:outline-none transition-colors"
                  />
                  <p className="text-[9px] text-wood-light/80 mt-1 italic">Note: Pave a YouTube Shorts or video link to use as the product's showcase reel.</p>
                </div>
              </div>

              {formError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3.5 text-xs text-red-800 border border-red-200 animate-fadeIn">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-650 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3.5 text-xs text-emerald-800 border border-emerald-200 animate-fadeIn">
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-xl border border-wood-border px-4 py-3 text-xs font-bold tracking-wider text-wood-light uppercase hover:bg-wood-beige/20 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark px-4 py-3 text-xs font-bold tracking-wider text-white uppercase hover:bg-wood-medium disabled:bg-neutral-600 transition-colors cursor-pointer shadow-md"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Upload Design'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Product listings */}
          <div className="lg:col-span-8 bg-white/80 backdrop-blur-md border border-wood-border rounded-3xl shadow-md overflow-hidden text-left glow-on-hover animate-fadeIn">
            <div className="px-6 py-5 border-b border-wood-border/40 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-wood-dark">
                Manage Designs
              </h3>
              <span className="inline-flex items-center rounded-full bg-wood-beige/25 border border-wood-border/40 px-2.5 py-0.5 text-xs font-semibold text-wood-accent uppercase tracking-wider">
                {products.length} {products.length === 1 ? 'Design' : 'Designs'} Total
              </span>
            </div>

            {productsLoading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-wood-accent" />
              </div>
            ) : products.length === 0 ? (
              <div className="px-6 py-20 text-center text-wood-light font-light">
                No products found. Use the upload panel to publish your first design!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-wood-border/40 bg-wood-beige/10 text-[10px] font-bold uppercase tracking-wider text-wood-accent">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Title</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Uploaded</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-border/30">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-wood-beige/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-wood-border/30 bg-wood-beige/10 relative">
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                            {p.video && (
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                <Play className="h-3.5 w-3.5 text-white fill-current" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-serif font-bold text-wood-dark max-w-[180px] truncate">
                          {p.title}
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex rounded-full bg-wood-beige/20 border border-wood-border/40 px-2.5 py-0.5 text-[10px] font-semibold text-wood-accent uppercase tracking-wider">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-wood-dark font-semibold text-xs">
                          {p.price && p.price > 0 ? `₹${p.price.toLocaleString('en-IN')}` : 'Contact for Price'}
                        </td>
                        <td className="py-4 px-6 text-wood-light font-light text-xs">
                          {new Date(p.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          }) }
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEditProduct(p)}
                              title="Edit Product"
                              className="p-2 rounded-lg text-wood-light hover:text-wood-dark hover:bg-wood-beige/20 transition-colors cursor-pointer"
                            >
                              <Edit className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p._id, p.title)}
                              title="Delete Product"
                              className="p-2 rounded-lg text-wood-light hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER ORDERS TAB */}
      {adminTab === 'orders' && (
        <div className="space-y-6">
          {pendingGreetingOrder && orders.find(o => o._id === pendingGreetingOrder) && (
            <div className="mb-6 p-6 bg-emerald-50 border border-emerald-250 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn border-dashed text-left">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
                <h3 className="font-serif text-lg font-bold text-emerald-950 mt-1">
                  Send welcome greeting to {orders.find(o => o._id === pendingGreetingOrder).name}?
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingGreetingOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const o = orders.find(ord => ord._id === pendingGreetingOrder);
                    const cleanPhone = o.phone.replace(/\D/g, '');
                    const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
                    const welcomeMsg = getBilingualGreetingText(o);
                    window.open(`https://wa.me/${targetPhone}?text=${encodeURIComponent(welcomeMsg)}`, '_blank');
                    window.open(`mailto:${o.email || ''}?subject=${encodeURIComponent('Order Confirmation')}&body=${encodeURIComponent(welcomeMsg)}`, '_blank');
                    api.post(`/orders/${o._id}/send-greeting`).catch(() => {});
                    setPendingGreetingOrder(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm rounded-xl"
                >
                  ⚡ Send WhatsApp & Email
                </button>
              </div>
            </div>
          )}

          <div className="bg-white/80 backdrop-blur-md border border-wood-border rounded-3xl shadow-lg overflow-hidden text-left animate-fadeIn glow-on-hover">
            <div className="px-6 py-5 border-b border-wood-border/40 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-wood-dark">
                Customer Orders Live Status
              </h3>
              <span className="inline-flex items-center rounded-full bg-wood-beige/25 border border-wood-border/40 px-2.5 py-0.5 text-xs font-semibold text-wood-accent uppercase tracking-wider">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
              </span>
            </div>

            {ordersLoading ? (
              <div className="flex h-72 items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-wood-accent" />
              </div>
            ) : orders.length === 0 ? (
              <div className="px-6 py-20 text-center text-wood-light font-light">
                No orders found in the database.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-wood-border/40 bg-wood-beige/10 text-[10px] font-bold uppercase tracking-wider text-wood-accent">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Phone</th>
                      <th className="py-4 px-6">Product Details</th>
                      <th className="py-4 px-6">Agreed Price</th>
                      <th className="py-4 px-6">Carrier / Tracking</th>
                      <th className="py-4 px-6">Timeline Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-border/30">
                    {orders.map((o) => (
                      <tr key={o._id} className="hover:bg-wood-beige/10 transition-colors">
                        <td className="py-4 px-6">
                          {o.imageUrl ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-wood-border/30 bg-wood-beige/10">
                              <img src={o.imageUrl} alt="" className="h-full w-full object-cover" />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-wood-beige/40 flex items-center justify-center text-wood-accent font-serif font-bold text-xs border border-wood-border/20 shadow-sm">
                              LD
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 font-bold text-wood-dark">
                          <div>
                            <p>{o.name}</p>
                            <p className="text-[9.5px] text-wood-light font-mono font-light mt-0.5 truncate max-w-[120px]">{o.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs">
                          <div className="flex flex-col gap-1">
                            <a href={`tel:+91${o.phone}`} className="text-wood-accent hover:underline flex items-center gap-1 font-semibold">
                              {o.phone}
                            </a>
                            <a href={`https://wa.me/91${o.phone}`} target="_blank" className="text-emerald-600 hover:underline text-[9px] font-bold uppercase tracking-wider">
                              Chat WhatsApp
                            </a>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-serif font-bold text-wood-dark">{o.product}</p>
                            <p className="text-[10px] text-wood-light mt-0.5 truncate max-w-[155px] font-light italic">Notes: {o.notes || 'None'}</p>
                          </div>
                        </td>
                        
                        {/* AGREED PRICE / LEDGER COLUMN */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs">
                            {o.totalPrice && o.totalPrice > 0 ? (
                              <div className="space-y-0.5 text-left font-semibold text-[11px]">
                                <p className="text-wood-dark">Cost: ₹{o.totalPrice.toLocaleString('en-IN')}</p>
                                <p className="text-emerald-700">Paid: ₹{o.paidAmount.toLocaleString('en-IN')}</p>
                                <p className="text-red-650">Bal: ₹{o.remainingBalance.toLocaleString('en-IN')}</p>
                              </div>
                            ) : (
                              <span className="text-[10px] text-wood-light italic font-light">Price not set</span>
                            )}
                            
                            <button
                              onClick={() => {
                                setActivePricingOrder(o);
                                setTotalPriceInput(o.totalPrice ? o.totalPrice.toString() : '');
                                setUpdateToAwaitingAdvance(o.status === 'Pending' || o.status === 'Processing');
                                setPricingError('');
                                setPricingSuccess('');
                              }}
                              className="inline-flex items-center justify-center gap-1 rounded bg-wood-beige hover:bg-wood-border/40 text-wood-accent text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer shadow-xs border border-wood-border/20 active:scale-95 w-full text-center"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>{o.totalPrice > 0 ? 'Edit Price' : 'Set Price'}</span>
                            </button>
                          </div>
                        </td>

                        {/* CARRIER / SHIPPING TRACKING COLUMN */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1 text-xs text-left max-w-[160px]">
                            {o.trackingNumber ? (
                              <div className="text-[10px] text-wood-medium leading-relaxed font-light">
                                <p><strong>Carrier:</strong> {o.carrier || 'Xpressbees'}</p>
                                <p className="truncate"><strong>Waybill:</strong> {o.trackingNumber}</p>
                                {o.deliveryDate && (
                                  <p className="font-bold text-emerald-800">📅 {new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-wood-light italic font-light">No shipment details</span>
                            )}

                            <button
                              onClick={() => {
                                setActiveDeliveryOrder(o);
                                setDeliveryDateInput(o.deliveryDate ? new Date(o.deliveryDate).toISOString().substring(0, 10) : '');
                                setCarrierInput(o.carrier || 'Xpressbees');
                                setTrackingNumberInput(o.trackingNumber || '');
                                setDeliveryError('');
                                setDeliverySuccess('');
                              }}
                              className="inline-flex items-center justify-center gap-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer shadow-xs border border-neutral-300 w-full text-center mt-1"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Update Carrier</span>
                            </button>

                            {o.remainingBalance > 0 && o.trackingNumber && (
                              <button
                                onClick={() => handleSendBalanceReminder(o)}
                                className="inline-flex items-center justify-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer shadow-xs border border-emerald-500/20 w-full text-center mt-1 active:scale-95"
                              >
                                🔔 Remind Balance
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateStatus(o._id, e.target.value)}
                            className={`rounded-lg border text-xs font-bold px-2 py-1.5 focus:outline-none cursor-pointer ${
                              o.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              o.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' :
                              o.status === 'In Progress' ? 'bg-amber-50 text-amber-850 border-amber-200' :
                              o.status === 'Processing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              'bg-wood-beige text-wood-dark border-wood-border'
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setActiveShippingSlipOrder(o)}
                              title="Print E-Commerce Package Billing Slip"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95 border border-amber-500/40"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Billing Slip</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(o._id, o.name)}
                              title="Delete Order Record"
                              className="p-2 rounded-lg text-wood-light hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENTS VERIFICATION QUEUE TAB */}
      {adminTab === 'payments' && (
        <div className="bg-white/80 backdrop-blur-md border border-wood-border rounded-3xl shadow-lg overflow-hidden text-left animate-fadeIn glow-on-hover">
          <div className="px-6 py-5 border-b border-wood-border/40 flex items-center justify-between bg-wood-beige/10">
            <h3 className="font-serif text-lg font-bold text-wood-dark flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-wood-accent animate-pulse" />
              <span>Payments Verification Queue</span>
            </h3>
            <span className="inline-flex items-center rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 text-xs font-semibold text-red-800 uppercase tracking-wider animate-pulse">
              {pendingPayments.length} Pending Verifications
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="px-6 py-20 text-center text-wood-light font-light">
              No pending payment verification requests in the queue. 
              <br />
              <span className="text-[10px] text-wood-light/75 italic mt-1 block">When clients confirm payment on the website, they will pop up here instantly!</span>
            </div>
          ) : (
            <>
              <div className="p-4 mx-6 my-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 animate-fadeIn">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ IMPORTANT VERIFICATION NOTICE FOR NAGARAJU / PAVANSAI:</strong> Please verify the transaction details inside your PhonePe / GPay app statement <strong>before</strong> clicking <strong>Approve</strong>. If the customer clicked "I Have Paid" but no funds landed in your bank, you must click <strong>Reject</strong>. The user's status will revert to Unpaid, their Pay button will be enabled again, and they will be prompted to submit proof again.
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-wood-border/40 bg-wood-beige/10 text-[10px] font-bold uppercase tracking-wider text-wood-accent">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-6">Log Type</th>
                    <th className="py-4 px-6">Claimed Amount</th>
                    <th className="py-4 px-6">Actual Recd (₹)</th>
                    <th className="py-4 px-6">UPI Gateway</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-border/30">
                  {pendingPayments.map((p) => {
                    const actionLoading = paymentActionLoading[p._id];
                    
                    const defaultPrefill = p.amount > 0 ? p.amount : p.fullOrder.remainingBalance;
                    const finalVerifiedAmt = verifiedAmounts[p._id] !== undefined ? verifiedAmounts[p._id] : defaultPrefill;
                    
                    return (
                      <tr key={p._id} className="hover:bg-wood-beige/10 transition-colors animate-fadeIn">
                        <td className="py-4 px-6 font-bold text-wood-dark">
                          <div>
                            <p>{p.customerName}</p>
                            <p className="text-[10px] text-wood-light font-light font-mono mt-0.5">{p.fullOrder.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-serif text-wood-light font-semibold">
                          {p.productName}
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-[9px] font-bold bg-amber-50 border border-amber-250 text-amber-700 px-2 py-1 rounded-lg">
                            {p.utrNumber}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold text-neutral-600 text-xs">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6">
                          <input
                            type="number"
                            required
                            min="1"
                            value={finalVerifiedAmt}
                            onChange={(e) => setVerifiedAmounts(prev => ({ ...prev, [p._id]: e.target.value }))}
                            placeholder="Amt recd"
                            className="w-24 rounded-xl border border-wood-border bg-white px-2.5 py-1.5 text-xs text-wood-dark font-bold text-center focus:outline-none focus:border-wood-accent"
                          />
                        </td>
                        <td className="py-4 px-6 text-wood-light text-xs font-mono select-all">
                          {p.upiIdUsed}
                        </td>
                        <td className="py-4 px-6 text-wood-light font-light text-[11px] whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerifyPayment(p.orderId, p._id, 'reject')}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer disabled:bg-neutral-300"
                            >
                              Reject
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleVerifyPayment(p.orderId, p._id, 'approve', finalVerifiedAmt)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-sm disabled:bg-neutral-300 flex items-center gap-1"
                            >
                              {actionLoading ? (
                                <Loader2 className="h-3 w-3 animate-spin text-white" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                              <span>Approve</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
          )}
        </div>
      )}

      {/* CATEGORIES MANAGEMENT TAB */}
      {adminTab === 'categories' && (
        <div className="space-y-8 animate-fadeIn text-left">
          {/* Add Category Form Card */}
          <div className="bg-white/80 backdrop-blur-md border border-wood-border/60 rounded-3xl p-6 sm:p-8 shadow-md glow-on-hover">
            <h2 className="font-serif text-xl font-bold text-wood-dark mb-2 flex items-center gap-2">
              <Plus className="h-5 w-5 text-wood-accent" />
              <span>Add New Space Category / కొత్త డిజైన్ విభాగం చేర్చండి</span>
            </h2>
            <p className="text-xs text-wood-medium mb-6 font-light leading-relaxed">
              Create custom space and furniture categories (e.g. Wall Panels, Almirahs, Gummalu, Temple Mandir). New categories will instantly appear in design upload forms and customer gallery filters.
            </p>

            {formError && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="e.g., Almirahs, WPC Wall Panels, Gummalu..."
                className="flex-1 rounded-xl border border-wood-border bg-white px-4 py-3 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark"
              />
              <button
                type="submit"
                disabled={categoryLoading || !newCategoryInput.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-wood-dark hover:bg-wood-medium text-white px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {categoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                <span>Add Category</span>
              </button>
            </form>
          </div>

          {/* Categories Grid Card */}
          <div className="bg-white/80 backdrop-blur-md border border-wood-border/60 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-wood-border/30">
              <div>
                <h3 className="font-serif text-lg font-bold text-wood-dark">
                  All Active Categories ({categoriesList.length})
                </h3>
                <p className="text-xs text-wood-medium font-light mt-0.5">
                  Click delete icon to remove custom categories. Default categories with active designs will remain protected.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchCategories}
                className="text-xs font-bold text-wood-accent hover:underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoriesList.map((cat) => {
                const productCount = products.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
                return (
                  <div
                    key={cat._id || cat.name}
                    className="flex items-center justify-between bg-wood-cream/40 border border-wood-border/40 hover:border-wood-accent/50 rounded-2xl p-4 transition-all"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-wood-dark">{cat.name}</h4>
                      <p className="text-[10px] text-wood-medium font-medium mt-0.5">
                        {productCount} {productCount === 1 ? 'Design' : 'Designs'}
                      </p>
                    </div>
                    {cat._id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title={`Delete ${cat.name} category`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRICE MODAL POPUP */}
      {activePricingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto" onClick={() => setActivePricingOrder(null)}>
          <div className="w-full max-w-sm bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-wood-accent" />
                <span>Configure Contract Price</span>
              </h3>
              <button 
                onClick={() => setActivePricingOrder(null)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {pricingError && (
              <div className="rounded-xl bg-red-50 border border-red-150 p-3 text-[10px] text-red-800 flex items-start gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{pricingError}</span>
              </div>
            )}

            {pricingSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[10px] text-emerald-800 flex items-start gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pricingSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePricing} className="space-y-4">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Customer</p>
                <p className="text-xs font-semibold text-wood-dark mt-0.5">{activePricingOrder.name}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Carpentry Product</p>
                <p className="text-xs font-semibold text-wood-dark mt-0.5">{activePricingOrder.product}</p>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1.5">
                  Final Agreed Deal Price (₹)
                </label>
                <input
                  type="number"
                  required
                  value={totalPriceInput}
                  onChange={(e) => setTotalPriceInput(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full rounded-xl border border-wood-border bg-white px-3.5 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-accent font-bold"
                />
              </div>

              <div className="flex items-start gap-2.5 py-1.5">
                <input
                  type="checkbox"
                  id="update-status"
                  checked={updateToAwaitingAdvance}
                  onChange={(e) => setUpdateToAwaitingAdvance(e.target.checked)}
                  className="rounded border-wood-border bg-white text-wood-accent focus:ring-wood-accent cursor-pointer mt-0.5"
                />
                <label htmlFor="update-status" className="text-[10px] text-wood-light leading-snug cursor-pointer select-none">
                  <strong>Update status to Processing:</strong> This alerts the customer that sizing/pricing is finalized so they can pay their advance.
                </label>
              </div>

              <button
                type="submit"
                disabled={pricingLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-md disabled:bg-neutral-500"
              >
                {pricingLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                ) : (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    <span>Save Price & Send WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DELIVERY TRACKING MODAL POPUP */}
      {activeDeliveryOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto" onClick={() => setActiveDeliveryOrder(null)}>
          <div className="w-full max-w-sm bg-wood-cream border-2 border-wood-accent/30 rounded-3xl p-5 sm:p-7 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto scrollbar-thin" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-wood-border/30">
              <h3 className="font-serif text-sm font-bold text-wood-dark flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-wood-accent animate-pulse" />
                <span>Configure Delivery Tracking</span>
              </h3>
              <button 
                onClick={() => setActiveDeliveryOrder(null)}
                className="p-1 rounded-lg hover:bg-wood-beige text-wood-light hover:text-wood-dark transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {deliveryError && (
              <div className="rounded-xl bg-red-50 border border-red-150 p-3 text-[10px] text-red-800 flex items-start gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>{deliveryError}</span>
              </div>
            )}

            {deliverySuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[10px] text-emerald-800 flex items-start gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{deliverySuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveDeliveryTracking} className="space-y-4">
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Customer</p>
                <p className="text-xs font-semibold text-wood-dark mt-0.5">{activeDeliveryOrder.name}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-wood-accent">Carpentry Product</p>
                <p className="text-xs font-semibold text-wood-dark mt-0.5">{activeDeliveryOrder.product}</p>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1.5">
                  Scheduled Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDateInput}
                  onChange={(e) => setDeliveryDateInput(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3.5 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-accent"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1.5">
                  Delivery Carrier
                </label>
                <select
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-white px-3.5 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-accent cursor-pointer"
                >
                  <option value="Xpressbees">Xpressbees (Low Cost Courier)</option>
                  <option value="India Post">India Post (Government Parcel)</option>
                  <option value="Self-Transport">Self-Transport / Workshop Handover</option>
                  <option value="Ekart Logistics">Ekart Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-wider text-wood-accent mb-1.5">
                  Consignment Waybill / Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  placeholder="e.g. Waybill ID 142839958"
                  className="w-full rounded-xl border border-wood-border bg-white px-3.5 py-2.5 text-xs text-wood-dark focus:outline-none focus:border-wood-accent font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={deliveryLoading}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-dark hover:bg-wood-medium text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors shadow-md disabled:bg-neutral-500"
              >
                {deliveryLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                ) : (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    <span>Save Delivery Tracking</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE SHIPPING & DISPATCH BILLING SLIP MODAL */}
      {activeShippingSlipOrder && (
        <ShippingSlipModal
          order={activeShippingSlipOrder}
          userProfile={{
            name: activeShippingSlipOrder.name,
            phone: activeShippingSlipOrder.phone,
            address: activeShippingSlipOrder.address
          }}
          onClose={() => setActiveShippingSlipOrder(null)}
        />
      )}
    </div>
  );
}
