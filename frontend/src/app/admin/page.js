"use client";
import { useEffect, useState, useRef } from 'react';
import api from '@/utils/api';
import { Loader2, Plus, Edit, Trash2, X, Upload, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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

  // Status/Error States
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Admin Active Tab & Orders States
  const [adminTab, setAdminTab] = useState('showcase'); // 'showcase' or 'orders'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [pendingGreetingOrder, setPendingGreetingOrder] = useState(null);

  const fileInputRef = useRef(null);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ld_token');
      if (token) {
        try {
          // Verify token validity
          await api.get('/auth/me');
          setIsAuthenticated(true);
          fetchProducts();
          fetchOrders();
        } catch (err) {
          console.error('Session verification failed:', err);
          // Clean invalid state
          localStorage.removeItem('ld_token');
          localStorage.removeItem('ld_admin');
          window.dispatchEvent(new Event('admin-logout'));
        }
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
      // Clean query params so it doesn't trigger on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      // Switch tab to orders automatically so they see the banner
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

  // 2c. Update Order Status & Send Automatic WhatsApp Notification
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/orders/${id}`, { status: newStatus });
      
      const order = orders.find(o => o._id === id);
      if (order) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
        
        // Format phone number to clean country code prefix
        const cleanPhone = order.phone.replace(/\D/g, '');
        const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
        
        // Format status description for simple message
        let statusText = `your order is ${newStatus.toLowerCase()}`;
        if (newStatus === 'Processing') statusText = 'your order is processing';
        if (newStatus === 'In Progress') statusText = 'your order is in progress';
        if (newStatus === 'Completed') statusText = 'your order is completed';
        if (newStatus === 'Cancelled') statusText = 'your order is cancelled';
        
        const messageText = `Namaste *${order.name}*Garu!

Mee order status: *${statusText}*.

Mee order status check cheyyali anukuntey track link check cheyyandi:
👉 https://ld-interiors-ai.vercel.app/orders

Dhanyavaadalu`;

        const encodedMsg = encodeURIComponent(messageText);
        const waUrl = `https://wa.me/${targetPhone}?text=${encodedMsg}`;
        
        // Open WhatsApp Web/App in a new window/tab to send the message
        window.open(waUrl, '_blank');
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
      setIsAuthenticated(true);

      // Dispatch event to sync navbar
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

      if (isEditing) {
        // Edit Mode
        await api.put(`/products/${editId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFormSuccess('Product updated successfully!');
        resetForm();
      } else {
        // Create Mode
        await api.post('/products', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setFormSuccess('Design product uploaded successfully!');
        resetForm();
      }
      // Refresh listings
      fetchProducts();
    } catch (err) {
      console.error('Form submit error:', err);
      setFormError(err.response?.data?.message || 'Server error occurred during save.');
    } finally {
      setFormLoading(false);
    }
  };

  // 6. Set up Edit Product
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
    setFormError('');
    setFormSuccess('');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 7. Delete Product
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

  // 8. Reset Form States
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render Loader during initial auth validation
  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  // 9. RENDER LOGIN FORM
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-12 bg-wood-cream/30">
        <div className="w-full max-w-md bg-wood-cream border border-wood-border/60 rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <span className="text-[10px] font-extrabold tracking-widest text-wood-accent uppercase">
              Secure Auth
            </span>
            <h1 className="font-serif text-2xl font-bold text-wood-dark mt-2">
              Admin Login
            </h1>
            <p className="mt-2 text-xs text-wood-light font-light">
              Enter credentials to access the LD Interiors & Furnitures Dashboard
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ldinteriors.com"
                className="w-full rounded-xl border border-wood-border/60 px-4 py-3 text-sm focus:border-wood-dark focus:outline-none transition-colors"
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
                className="w-full rounded-xl border border-wood-border/60 px-4 py-3 text-sm focus:border-wood-dark focus:outline-none transition-colors"
              />
            </div>

            {loginError && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-100">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-wood-dark px-6 py-3.5 text-xs font-bold tracking-widest text-white uppercase shadow-sm hover:bg-wood-medium focus:outline-none disabled:bg-neutral-400 transition-colors duration-300 cursor-pointer"
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

  // 10. RENDER DASHBOARD
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-8 sm:py-16">
      {/* Dashboard Header */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-wood-border/40 pb-6 gap-4">
        <div>
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
      <div className="flex border-b border-wood-border/30 mb-8 gap-6 text-left">
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
      </div>

      {adminTab === 'showcase' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Upload / Edit form */}
          <div className="lg:col-span-4 bg-wood-cream border border-wood-border rounded-2xl p-6 shadow-md text-left">
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
                  className="w-full rounded-xl border border-wood-border bg-wood-cream px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Space Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-wood-cream px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-wood-cream text-wood-dark">
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
                  className="w-full rounded-xl border border-wood-border bg-wood-cream px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-wood-light mb-2">
                  Rating / Feedback Stars
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full rounded-xl border border-wood-border bg-wood-cream px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark cursor-pointer"
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
                  className="w-full rounded-xl border border-wood-border bg-wood-cream px-4 py-2.5 text-sm focus:border-wood-accent focus:outline-none transition-colors text-wood-dark resize-none font-light"
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
                            <div key={idx} className="relative h-20 w-20 overflow-hidden rounded-lg border border-wood-border/50 shadow-sm bg-wood-cream">
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
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-wood-accent px-4 py-3 text-xs font-bold tracking-wider text-wood-dark uppercase hover:bg-amber-500 disabled:bg-neutral-600 transition-colors cursor-pointer btn-3d-accent"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-wood-dark" />
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
          <div className="lg:col-span-8 bg-wood-cream border border-wood-border rounded-2xl shadow-md overflow-hidden text-left">
            <div className="px-6 py-5 border-b border-wood-border/40 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-wood-dark">
                Manage Designs
              </h3>
              <span className="inline-flex items-center rounded-full bg-wood-beige/20 border border-wood-border/40 px-2.5 py-0.5 text-xs font-semibold text-wood-accent uppercase tracking-wider">
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
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-wood-border/30 bg-wood-beige/25">
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
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
      ) : (
        <div>
          {/* Orders list panel */}
          {(() => {
            const pendingOrderDetails = orders.find(o => o._id === pendingGreetingOrder);
            if (!pendingOrderDetails) return null;
            
            return (
              <div className="mb-6 p-6 bg-emerald-50 border border-emerald-250 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn border-dashed text-left">
                <div className="text-left">
                  <span className="text-[10px] font-extrabold tracking-widest text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                  <h3 className="font-serif text-lg font-bold text-emerald-950 mt-1">
                    Send welcome greeting to {pendingOrderDetails.name}?
                  </h3>
                  <p className="text-xs text-emerald-800 font-light mt-0.5 font-mono">
                    Product: {pendingOrderDetails.product} ({pendingOrderDetails.email})
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPendingGreetingOrder(null)}
                    className="px-4 py-2.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const cleanPhone = pendingOrderDetails.phone.replace(/\D/g, '');
                      const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
                      
                      const welcomeMsg = getBilingualGreetingText(pendingOrderDetails);

                      // 1. WhatsApp Welcome
                      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(welcomeMsg)}`;
                      window.open(waUrl, '_blank');

                      // 2. Direct Mail Client (Mailto) Compose
                      const subject = `🎉 Order Received successfully! - ${pendingOrderDetails.product} | ఆర్డర్ విజయవంతంగా అందింది!`;
                      const mailtoUrl = `mailto:${pendingOrderDetails.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(welcomeMsg)}`;
                      window.open(mailtoUrl, '_blank');

                      // 3. Fallback backend email dispatch
                      api.post(`/orders/${pendingOrderDetails._id}/send-greeting`).catch(() => {});

                      // Clear pending action
                      setPendingGreetingOrder(null);
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95 rounded-xl"
                  >
                    ⚡ Send WhatsApp & Email
                  </button>
                </div>
              </div>
            );
          })()}

          <div className="bg-wood-cream border border-wood-border rounded-2xl shadow-lg overflow-hidden text-left animate-fadeIn">
          <div className="px-6 py-5 border-b border-wood-border/40 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-wood-dark">
              Customer Orders Live Status
            </h3>
            <span className="inline-flex items-center rounded-full bg-wood-beige/20 border border-wood-border/40 px-2.5 py-0.5 text-xs font-semibold text-wood-accent uppercase tracking-wider">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </span>
          </div>

          {ordersLoading ? (
            <div className="flex h-72 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-wood-accent" />
            </div>
          ) : orders.length === 0 ? (
            <div className="px-6 py-20 text-center text-wood-light font-light">
              No orders found in the database. Customer orders will show up here live when placed!
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
                    <th className="py-4 px-6">Custom Notes</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Live Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-wood-border/30">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-wood-beige/10 transition-colors">
                      <td className="py-4 px-6">
                        {o.imageUrl ? (
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-wood-border/30 bg-wood-beige/20">
                            <img
                              src={o.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-wood-beige/40 flex items-center justify-center text-wood-accent font-serif font-bold text-xs border border-wood-border/20 shadow-sm">
                            LD
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 font-bold text-wood-dark max-w-[150px] truncate">
                        {o.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <a href={`tel:+91${o.phone}`} className="text-wood-accent hover:underline flex items-center gap-1 font-semibold">
                            {o.phone}
                          </a>
                          <a href={`https://wa.me/91${o.phone}`} target="_blank" className="text-emerald-600 hover:underline text-[10px] font-bold uppercase tracking-wider">
                            Message WhatsApp
                          </a>
                          <button
                            onClick={() => {
                              const cleanPhone = o.phone.replace(/\D/g, '');
                              const targetPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 ? cleanPhone : `91${cleanPhone.slice(-10)}`;
                              
                              const welcomeMsg = getBilingualGreetingText(o);
                              const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(welcomeMsg)}`;
                              window.open(waUrl, '_blank');
                            }}
                            className="mt-1 flex items-center justify-center gap-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer text-center w-full shadow-xs border border-emerald-500/20 active:scale-95"
                          >
                            💬 WhatsApp Greeting
                          </button>

                          <button
                            onClick={() => {
                              const welcomeMsg = getBilingualGreetingText(o);
                              const subject = `🎉 Order Received successfully! - ${o.product} | ఆర్డర్ విజయవంతంగా అందింది!`;
                              const mailtoUrl = `mailto:${o.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(welcomeMsg)}`;
                              window.open(mailtoUrl, '_blank');

                              // Dispatch to backend email service in background (fallback)
                              api.post(`/orders/${o._id}/send-greeting`).catch(() => {});
                            }}
                            className="mt-1 flex items-center justify-center gap-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer text-center w-full shadow-xs border border-blue-500/20 active:scale-95"
                          >
                            ✉️ Email Greeting
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-serif font-bold text-wood-light max-w-[150px] truncate">
                        {o.product}
                      </td>
                      <td className="py-4 px-6 text-wood-medium font-light text-xs max-w-[200px] whitespace-pre-line break-words">
                        {o.notes || 'No custom notes.'}
                      </td>
                      <td className="py-4 px-6 text-wood-light font-light text-xs whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                          <option value="Pending" className="text-wood-dark bg-white">Pending</option>
                          <option value="Processing" className="text-wood-dark bg-white">Processing</option>
                          <option value="In Progress" className="text-wood-dark bg-white">In Progress</option>
                          <option value="Completed" className="text-wood-dark bg-white">Completed</option>
                          <option value="Cancelled" className="text-wood-dark bg-white">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDeleteOrder(o._id, o.name)}
                          title="Delete Order Record"
                          className="p-2 rounded-lg text-wood-light hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
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
    </div>
  );
}
