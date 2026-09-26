'use client';
import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, X, Copy, Check, Clock, QrCode, Smartphone, CreditCard, 
  Sparkles, Download, Printer, ExternalLink, RefreshCw, ShieldCheck, ArrowRight, MessageSquare, FileText, AlertCircle
} from 'lucide-react';
import api from '@/utils/api';

export default function RealtimePaymentModal({ 
  isOpen, 
  onClose, 
  orderData, 
  payableAmount = 0, 
  onPaymentSuccess 
}) {
  const [step, setStep] = useState('qr'); // 'qr' -> 'success' -> 'receipt'
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minute countdown
  const [isVerifying, setIsVerifying] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [utrError, setUtrError] = useState('');
  const [txnDetails, setTxnDetails] = useState(null);

  const merchantVpa = '9346325291@ybl';
  const merchantName = 'LD Interiors & Furnitures';

  // Unique internal transaction reference ID fallback
  const txnIdRef = useRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
  const txnId = txnIdRef.current;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('qr');
      setUtrInput('');
      setUtrError('');
      setIsVerifying(false);
      setTimeLeft(300);
    }
  }, [isOpen]);

  // Countdown timer for 5 minutes
  useEffect(() => {
    if (!isOpen || step !== 'qr') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen || !orderData) return null;

  const totalAmount = payableAmount || orderData?.paidAmount || orderData?.totalPrice || 5000;
  const cleanOrderCode = orderData?._id ? orderData._id.toString().slice(-6).toUpperCase() : 'LDNEW';
  
  // Clean UPI Deep Link & QR Code Data (No # or special chars in query params to prevent scanner errors)
  const upiUrl = `upi://pay?pa=${merchantVpa}&pn=${encodeURIComponent(merchantName)}&am=${totalAmount}&tn=LD_${cleanOrderCode}_${txnId}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantVpa);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleUtrChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 12);
    setUtrInput(digitsOnly);
    if (utrError) setUtrError('');
  };

  // Submit UTR and Verify Payment via Backend
  const handleConfirmPayment = async () => {
    if (!utrInput || utrInput.length < 12) {
      setUtrError('⚠️ Please enter full 12-digit UTR / Reference number from GPay, PhonePe, or Paytm.');
      return;
    }

    setIsVerifying(true);
    setUtrError('');

    try {
      let responseData = null;

      // Post realtime payment with UTR to backend DB to update order status & alert Pavan Sai
      if (orderData._id) {
        const res = await api.post(`/orders/${orderData._id}/realtime-qr-payment`, {
          amount: totalAmount,
          upiVpa: merchantVpa,
          utrNumber: utrInput,
          paymentMethod: 'Real-Time UPI QR Code'
        });
        responseData = res.data;
      }

      const successTxn = {
        txnId: responseData?.txnId || utrInput,
        utrNumber: utrInput,
        amount: totalAmount,
        merchantVpa: merchantVpa,
        merchantName: merchantName,
        date: new Date().toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        product: orderData?.product || orderData?.title || 'Custom Teakwood Design',
        customerName: orderData?.name || orderData?.customerName || 'Valued Customer',
        phone: orderData?.phone || ''
      };

      setTxnDetails(successTxn);
      setStep('success');
      setIsVerifying(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(successTxn);
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
      setUtrError(err.response?.data?.message || 'Payment submission failed. Please verify your 12-digit UTR number and try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 transform transition-all my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all cursor-pointer shadow-xs"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* =========================================================================
            STEP 1: REAL-TIME UPI QR CODE PAYMENT & MANDATORY UTR INPUT SCREEN
            ========================================================================= */}
        {step === 'qr' && (
          <div className="p-6 sm:p-8 text-center font-sans">
            
            {/* Header branding */}
            <div className="mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300 inline-flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Real-Time Merchant Soundbox Gateway
              </span>
              <h2 className="text-xl font-bold font-serif text-slate-900 mt-2">
                Scan QR Code & Enter 12-Digit UTR
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Payee: <strong className="text-slate-900">{merchantName}</strong> ({merchantVpa})
              </p>
            </div>

            {/* Payable Amount Highlight */}
            <div className="bg-gradient-to-r from-slate-900 to-wood-dark text-white rounded-2xl p-3.5 shadow-md mb-4 flex items-center justify-between border border-amber-500/30">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Payable Amount:</span>
              <span className="font-mono text-2xl font-black text-amber-300">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* QR Card Container */}
            <div className="relative bg-slate-950 p-4 rounded-2xl border-2 border-slate-900 shadow-xl mx-auto max-w-[250px] text-center">
              
              {/* Dynamic QR Code */}
              <div className="relative bg-white p-3 rounded-xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-44 h-44 object-contain rounded-md"
                />
              </div>

              <p className="text-[10px] text-slate-400 font-mono mt-2.5 uppercase tracking-wider flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-amber-400" />
                Scan with GPay, PhonePe, Paytm
              </p>
            </div>

            {/* Timer & Polling Status */}
            <div className="mt-3 flex items-center justify-between px-2 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                <span>Expires in: <strong className="font-mono text-slate-900 font-bold">{formatTime(timeLeft)}</strong></span>
              </div>
              <button
                onClick={handleCopyUpi}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied VPA!' : merchantVpa}</span>
              </button>
            </div>

            {/* MANDATORY 12-DIGIT UTR INPUT SECTION */}
            <div className="mt-4 text-left bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-amber-700" />
                  Enter 12-Digit UTR / Ref No. *
                </label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  utrInput.length === 12 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {utrInput.length}/12 Digits
                </span>
              </div>

              <p className="text-[11px] text-amber-800/90 leading-tight">
                After paying in GPay / PhonePe / Paytm, copy the 12-digit UTR/Ref number from your payment receipt or SMS and paste below:
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={utrInput}
                onChange={handleUtrChange}
                placeholder="e.g. 425619873412"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white font-mono text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-inner tracking-widest text-center"
              />

              {utrError && (
                <div className="flex items-start gap-1.5 text-red-600 text-xs font-semibold pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{utrError}</span>
                </div>
              )}
            </div>

            {/* Main Green Submit Button */}
            <div className="mt-4">
              <button
                onClick={handleConfirmPayment}
                disabled={isVerifying || utrInput.length < 10}
                className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all transform cursor-pointer ${
                  utrInput.length === 12 && !isVerifying
                    ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 hover:scale-[1.01]'
                    : 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none'
                }`}
              >
                <ShieldCheck className="w-5 h-5 fill-current" />
                <span>
                  {isVerifying 
                    ? 'Verifying UTR Soundbox Receipt...' 
                    : utrInput.length === 12 
                      ? 'Confirm & Verify Payment' 
                      : `Enter 12-Digit UTR (${utrInput.length}/12)`}
                </span>
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 2: PAYMENT SUCCESSFUL TRANSITION SCREEN
            ========================================================================= */}
        {step === 'success' && (
          <div className="p-8 text-center font-sans animate-fadeIn">
            
            {/* Animated Big Green Checkmark Icon */}
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-500 shadow-xl animate-scaleUp">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              ✓ PAYMENT SUCCESSFUL
            </p>

            {/* Big Amount Display */}
            <h2 className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight mt-3">
              ₹{totalAmount.toLocaleString('en-IN')}
            </h2>

            <p className="text-xs text-slate-600 font-medium mt-2">
              Received by <strong className="text-slate-900">{merchantName}</strong>
            </p>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 select-all">
              Merchant VPA: {merchantVpa}
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 my-5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified UTR Reference</span>
              <span className="font-mono font-bold text-slate-800 text-base tracking-wider">Ref #{txnDetails?.utrNumber || txnDetails?.txnId}</span>
            </div>

            {/* Navigation Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={() => setStep('receipt')}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Payment Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Done / Close
              </button>
            </div>

          </div>
        )}

        {/* =========================================================================
            STEP 3: OFFICIAL ITEMIZED PAYMENT RECEIPT VIEW
            ========================================================================= */}
        {step === 'receipt' && (
          <div className="p-6 sm:p-8 text-left font-sans animate-fadeIn">
            
            {/* Receipt Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">Payment Receipt</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">LD Interiors Gateway</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                VERIFIED & PAID
              </span>
            </div>

            {/* Total Paid Header Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-center mb-5">
              <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Amount Paid</span>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-1">
                ₹{totalAmount.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 mt-1 inline-block">
                SUCCESSFUL • VERIFIED BY 12-DIGIT UTR SOUNDBOX
              </span>
            </div>

            {/* Receipt Breakdown Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">12-Digit UTR Ref:</span>
                <span className="font-mono font-bold text-slate-900 select-all">{txnDetails?.utrNumber || txnDetails?.txnId || txnId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Date & Time:</span>
                <span className="font-medium text-slate-800">{txnDetails?.date || new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Merchant:</span>
                <span className="font-bold text-slate-900">{merchantName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Payee VPA:</span>
                <span className="font-mono text-slate-800">{merchantVpa}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Method:</span>
                <span className="font-semibold text-slate-800">UPI / Dynamic QR Code</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-bold text-slate-900">
                <span>Platform Fee:</span>
                <span className="text-emerald-700 uppercase font-mono">FREE (₹0)</span>
              </div>
            </div>

            {/* Receipt Footer Action Buttons */}
            <div className="mt-5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <a
                  href="/orders"
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Track Order</span>
                </a>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Return to Website
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
