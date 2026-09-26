'use client';
import { useState } from 'react';
import Link from 'next/link';
import CustomBuildStudio from '@/components/CustomBuildStudio';
import CelebrationModal from '@/components/CelebrationModal';
import { CheckCircle2, ShieldCheck, Phone, Check, Sliders, ArrowLeft } from 'lucide-react';
import api from '@/utils/api';

export default function CustomizePage() {
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  
  // Custom order form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [furnitureType, setFurnitureType] = useState('Custom Teak Wood Cot / Bed');
  const [customSize, setCustomSize] = useState('');
  const [desiredPrice, setDesiredPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceImageFile, setReferenceImageFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!name.trim()) {
      setFormError('⚠️ Please enter your full name.');
      return;
    }
    if (cleanPhone.length < 10) {
      setFormError('⚠️ Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('⚠️ Please enter a valid Gmail / Email address.');
      return;
    }
    if (!address.trim()) {
      setFormError('⚠️ Please enter your full delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', cleanPhone);
      formData.append('email', email.trim());
      formData.append('address', address.trim());
      formData.append('product', furnitureType);
      if (customSize.trim()) formData.append('customSize', customSize.trim());
      if (desiredPrice.trim()) formData.append('desiredPrice', desiredPrice.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      if (referenceImageFile) {
        formData.append('referenceImage', referenceImageFile);
      }

      const res = await api.post('/orders', formData);
      const createdOrder = res.data || {};

      try {
        const uToken = createdOrder.token || createdOrder.userToken || ('USER_TOKEN_' + cleanPhone);
        localStorage.setItem('ld_user_token', uToken);
        localStorage.setItem('ld_token', uToken);
        localStorage.setItem('ld_user_registered', 'true');
        localStorage.setItem('ld_user_name', name.trim());
        localStorage.setItem('ld_user_phone', cleanPhone);
        localStorage.setItem('ld_user_email', email.trim());
        localStorage.setItem('ld_user_address', address.trim());
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('user-logged-in'));
      } catch (e) {}

      setCelebrationData({
        product: furnitureType,
        image: createdOrder.imageUrl || createdOrder.referenceImageUrl || '',
        _id: createdOrder._id || `LD-LOCAL-${Date.now()}`,
        phone: cleanPhone,
        email: email.trim()
      });

      setOrderSuccess(true);
      setSubmitting(false);
      setShowCelebrationModal(true);

      // Reset form fields
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCustomSize('');
      setDesiredPrice('');
      setNotes('');
      setReferenceImageFile(null);
    } catch (err) {
      console.error('Error placing custom order:', err);
      setFormError(err.response?.data?.message || 'Failed to submit order. Please check that you entered valid details.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Furniture Catalog</span>
            </Link>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
              Custom Furniture Order & Build Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              LD Interiors Workshop • Teakwood Customization & Live Cost Estimation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:+919346325291"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>Call Tech Admin Pavan Sai</span>
            </a>
          </div>
        </div>

        {/* Interactive Custom Build Studio Calculator */}
        <div className="bg-white rounded-3xl text-slate-900 shadow-2xl overflow-hidden border border-slate-200">
          <CustomBuildStudio />
        </div>

        {/* Standalone Custom Order Details Form */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800/80 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Direct Workshop Placement
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-white mt-2">
              Submit Custom Furniture Order Form
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter your specifications and delivery details below. Our master craftsmen will confirm pricing and start production.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-5 text-left">
            {/* MANDATORY VALID DETAILS NOTICE */}
            <div className="rounded-2xl bg-amber-950/70 border border-amber-500/40 p-4 text-xs text-amber-200 leading-relaxed font-semibold shadow-inner">
              ⚠️ <strong>MUST ENTER VALID DETAILS:</strong> దయచేసి మీ యొక్క నికరమైన పేరు, 10-అంకెల ఫోన్ నంబర్, ఈమెయిల్ మరియు ఆర్డర్ డెలివరీ అడ్రస్ తప్పనిసరిగా ఇవ్వగలరు. వర్క్‌షాప్‌లో మీ ఆర్డర్ ఖరారు చేయడానికి మా టీమ్ మిమ్మల్ని ఫోన్ ద్వారా సంప్రదిస్తారు.
            </div>

            {formError && (
              <div className="p-3 bg-red-950/80 border border-red-500/50 text-red-200 rounded-xl text-xs font-bold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Teki Pavan Sai"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  10-Digit Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 9346325291"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Gmail / Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Furniture Category / Model
                </label>
                <select
                  value={furnitureType}
                  onChange={(e) => setFurnitureType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Custom Teak Wood Cot / Bed">Custom Teak Wood Cot / Bed</option>
                  <option value="Custom Teak Hand-Carved Main Door & Gummam">Custom Teak Hand-Carved Main Door & Gummam</option>
                  <option value="Custom Royal Puja Mandiram (Temple)">Custom Royal Puja Mandiram (Temple)</option>
                  <option value="Custom Teak Dining Table Set">Custom Teak Dining Table Set</option>
                  <option value="Custom Cushion Sofa Set Sectional">Custom Cushion Sofa Set Sectional</option>
                  <option value="Custom Bedroom Wardrobe / Closet">Custom Bedroom Wardrobe / Closet</option>
                  <option value="Custom Teak Dressing Table with Mirror">Custom Teak Dressing Table with Mirror</option>
                  <option value="Custom Uyyala Swing Frame">Custom Uyyala Swing Frame</option>
                  <option value="Complete Room Furniture Contract">Complete Room Furniture Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Delivery Address *
              </label>
              <textarea
                required
                rows="2"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Street, City, Landmark, Pincode"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Custom Size / Dimensions (Optional)
                </label>
                <input
                  type="text"
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="e.g. 6x7 Feet Bed / 7x3.5 Feet Door"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Desired Budget (Optional)
                </label>
                <input
                  type="text"
                  value={desiredPrice}
                  onChange={(e) => setDesiredPrice(e.target.value)}
                  placeholder="e.g. ₹45,000"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Upload Custom Reference Design Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReferenceImageFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-amber-500 file:text-slate-900 hover:file:bg-amber-400 file:cursor-pointer cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Carving Details / Custom Notes (Optional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific Teak wood grade, polish preferences, brass fittings..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-medium text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              ></textarea>
            </div>

            {orderSuccess && (
              <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 rounded-2xl flex items-center gap-2 font-bold text-sm">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>Custom Order Submitted Successfully! Tracking ready.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || orderSuccess}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                submitting || orderSuccess
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? 'Submitting Order...' : 'Confirm & Submit Custom Order'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Victory Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebrationModal}
        onClose={() => setShowCelebrationModal(false)}
        orderData={celebrationData}
      />
    </div>
  );
}
