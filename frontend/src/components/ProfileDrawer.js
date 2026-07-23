"use client";
import { useEffect, useState, useRef } from 'react';
import { X, User, LogOut, Check, Edit3, Mail, MapPin, Smartphone, Loader2, AlertTriangle, Eye, ShoppingBag, ArrowRight, Lock, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import Link from 'next/link';

export default function ProfileDrawer({ isOpen, onClose }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const digitRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Logged-in profile details
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAddress, setProfileAddress] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  // Status check
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  const checkUserSession = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ld_user_token');
      const savedPhone = localStorage.getItem('ld_user_phone') || '';
      const savedName = localStorage.getItem('ld_user_name') || '';
      const savedEmail = localStorage.getItem('ld_user_email') || '';
      const savedAddress = localStorage.getItem('ld_user_address') || '';

      if (token && savedPhone) {
        setIsUserLoggedIn(true);
        setProfilePhone(savedPhone);
        setProfileName(savedName);
        setProfileEmail(savedEmail);
        setProfileAddress(savedAddress);
      } else {
        setIsUserLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    checkUserSession();
    window.addEventListener('storage', checkUserSession);
    return () => {
      window.removeEventListener('storage', checkUserSession);
    };
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (isOtpSent && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, resendTimer]);

  const handleDigitChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    const fullCode = newDigits.join('');
    setOtp(fullCode);

    if (char && index < 5) {
      digitRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(newDigits);
      setOtp(newDigits.join(''));
      const nextFocus = Math.min(pastedData.length, 5);
      digitRefs[nextFocus].current?.focus();
    }
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const cleaned = phone.replace(/\D/g, '').slice(-10);
      if (!cleaned || cleaned.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      await api.post('/auth/send-otp', { phone: cleaned, isAdmin: false });
      setIsOtpSent(true);
      setResendTimer(30);
      setOtpDigits(['', '', '', '', '', '']);
      setOtp('');
    } catch (err) {
      console.error('OTP send failed:', err);
      setLoginError(err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
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
      setIsUserLoggedIn(true);
      setIsOtpSent(false);
      setOtp('');
      setPhone('');

      window.dispatchEvent(new Event('storage'));
      alert('Logged in successfully!');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setLoginError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    
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
        console.error('Failed to sync profile updates to database:', err);
      }
    }

    localStorage.setItem('ld_user_name', profileName.trim());
    localStorage.setItem('ld_user_email', profileEmail.trim());
    localStorage.setItem('ld_user_address', profileAddress.trim());
    
    setIsEditingProfile(false);
    setLoading(false);
    window.dispatchEvent(new Event('storage'));
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('ld_user_name');
    localStorage.removeItem('ld_user_phone');
    localStorage.removeItem('ld_user_email');
    localStorage.removeItem('ld_user_address');
    localStorage.removeItem('ld_user_registered');
    localStorage.removeItem('ld_user_token');
    
    setIsUserLoggedIn(false);
    setProfileName('');
    setProfilePhone('');
    setProfileEmail('');
    setProfileAddress('');
    setIsEditingProfile(false);
    
    window.dispatchEvent(new Event('storage'));
    onClose();
    alert('Logged out successfully!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#1d0f07] border-l border-wood-accent/30 text-white p-6 sm:p-8 flex flex-col justify-between shadow-2xl h-full z-10 animate-slideLeft">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-wood-accent/20 pb-4 mb-6">
            <h3 className="font-serif text-lg font-bold tracking-wide text-wood-accent flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{isUserLoggedIn ? 'My Profile Account' : 'Customer Sign In'}</span>
            </h3>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-wood-cream/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto max-h-[75vh] pr-1 scrollbar-thin">
            {isUserLoggedIn ? (
              /* User logged-in workspace details */
              isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-wood-accent mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-wood-accent/30 bg-[#28170c] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-wood-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-wood-accent mb-1">Phone Number (Verified)</label>
                    <input
                      type="tel"
                      disabled
                      value={profilePhone}
                      className="w-full rounded-xl border border-wood-accent/10 bg-[#28170c]/50 px-4 py-2.5 text-xs text-white/50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-wood-accent mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full rounded-xl border border-wood-accent/30 bg-[#28170c] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-wood-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-wood-accent mb-1">Shipping & Delivery Address</label>
                    <textarea
                      required
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      rows="3"
                      className="w-full rounded-xl border border-wood-accent/30 bg-[#28170c] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-wood-accent"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-wood-accent text-[#1d0f07] hover:brightness-110 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:bg-neutral-600"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 rounded-xl border border-wood-accent/30 hover:bg-white/5 text-wood-cream py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5 text-left">
                  <div className="bg-[#28170c] border border-wood-accent/20 rounded-2xl p-4.5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-wood-accent/5 -mr-4 -mt-4" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-wood-accent mb-0.5">Welcome Back</p>
                    <h4 className="font-serif text-lg font-bold">{profileName || 'Valued Customer'}</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-4.5 w-4.5 text-wood-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-wood-cream/60">Phone</p>
                        <p className="text-sm font-semibold">{profilePhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Mail className="h-4.5 w-4.5 text-wood-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-wood-cream/60">Email</p>
                        <p className="text-sm font-semibold break-all">{profileEmail || 'Not specified'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-4.5 w-4.5 text-wood-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-wood-cream/60">Shipping Address</p>
                        <p className="text-xs text-wood-cream font-light leading-relaxed bg-[#28170c]/40 border border-wood-accent/10 rounded-xl p-3 mt-1 max-w-full">
                          {profileAddress || 'No address specified yet.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2.5">
                    <Link
                      href="/orders"
                      onClick={onClose}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-wood-accent text-[#1d0f07] hover:brightness-110 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>View My Orders Timeline</span>
                    </Link>

                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-wood-accent/40 bg-transparent hover:bg-white/5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4 text-wood-accent" />
                      <span>Edit Profile details</span>
                    </button>
                  </div>
                </div>
              )
            ) : (
              /* Amazon/Flipkart Style E-Commerce Login Panel */
              <div className="space-y-6">
                {loginError && (
                  <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-3.5 text-xs text-red-300 flex items-start gap-2.5 text-left animate-fadeIn">
                    <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {!isOtpSent ? (
                  /* Step 1: Mobile Phone Number Input (Amazon / Flipkart Style) */
                  <form onSubmit={handleSendOtp} className="space-y-5 text-left animate-fadeIn">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Smartphone className="h-4 w-4 text-wood-accent" />
                        <h4 className="font-serif text-base font-bold text-white">Login or Sign Up</h4>
                      </div>
                      <p className="text-[11px] text-wood-cream/70 font-light mb-4">
                        Enter your 10-digit mobile number to receive an instant verification SMS.
                      </p>

                      <label className="block text-[10px] font-bold uppercase tracking-widest text-wood-accent mb-2">
                        Mobile Number
                      </label>
                      <div className="flex items-center rounded-2xl border border-wood-accent/30 bg-[#28170c] overflow-hidden focus-within:border-wood-accent focus-within:ring-2 focus-within:ring-wood-accent/20 transition-all">
                        <div className="px-3.5 py-3 bg-[#1d0f07] border-r border-wood-accent/20 text-xs font-bold text-wood-cream flex items-center gap-1.5 shrink-0 select-none">
                          <span>🇮🇳 +91</span>
                        </div>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="e.g. 9346325291"
                          className="w-full bg-transparent px-4 py-3 text-sm font-semibold tracking-wider text-white focus:outline-none placeholder:text-neutral-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || phone.replace(/\D/g, '').length < 10}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-wood-accent text-[#1d0f07] hover:brightness-110 py-4 text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-98"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#1d0f07]" />
                      ) : (
                        <>
                          <span>CONTINUE</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="text-[9.5px] text-wood-cream/50 font-light text-center leading-relaxed pt-2">
                      By continuing, you agree to LD Interiors & Furnitures{' '}
                      <span className="text-wood-accent underline cursor-pointer">Terms of Use</span> &{' '}
                      <span className="text-wood-accent underline cursor-pointer">Privacy Policy</span>.
                    </p>
                  </form>
                ) : (
                  /* Step 2: 6-Digit Separate Square Input Boxes (Flipkart / Amazon Style) */
                  <form onSubmit={handleVerifyOtp} className="space-y-5 text-left animate-fadeIn">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
                          <Lock className="h-4 w-4 text-wood-accent" />
                          Verify with OTP
                        </h4>
                        <button
                          type="button"
                          onClick={() => { setIsOtpSent(false); setOtp(''); setOtpDigits(['','','','','','']); }}
                          className="text-[10px] text-wood-accent font-bold uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="h-3 w-3" />
                          Edit Number
                        </button>
                      </div>
                      <p className="text-[11px] text-wood-cream/70 font-light mb-5">
                        Sent via SMS to <span className="font-bold text-white font-mono">+91 {phone}</span>
                      </p>

                      <label className="block text-[10px] font-bold uppercase tracking-widest text-wood-accent mb-3 text-center">
                        Enter 6-Digit Security Code
                      </label>

                      {/* 6 Individual Square Digit Input Boxes */}
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-4" onPaste={handlePaste}>
                        {otpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={digitRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleDigitChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-10 h-12 sm:w-11 sm:h-13 rounded-xl border-2 border-wood-accent/30 bg-[#28170c] text-center text-lg font-bold font-mono text-white focus:border-wood-accent focus:bg-black/40 focus:ring-2 focus:ring-wood-accent/30 focus:outline-none transition-all shadow-inner"
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-wood-accent text-[#1d0f07] hover:brightness-110 py-4 text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-lg active:scale-98"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#1d0f07]" />
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          <span>VERIFY & LOG IN</span>
                        </>
                      )}
                    </button>

                    {/* Resend OTP Timer & Trigger */}
                    <div className="text-center pt-2">
                      {resendTimer > 0 ? (
                        <p className="text-[10px] text-wood-cream/60 font-mono">
                          Resend OTP via SMS in <span className="font-bold text-amber-300">00:{resendTimer < 10 ? `0${resendTimer}` : resendTimer}s</span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-[10.5px] font-bold text-wood-accent uppercase tracking-wider hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>RESEND OTP VIA SMS</span>
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {isUserLoggedIn && (
          <div className="border-t border-wood-accent/20 pt-4 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/30 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Log Out Account</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
