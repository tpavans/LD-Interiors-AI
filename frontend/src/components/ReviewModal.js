"use client";
import React, { useState, useEffect } from 'react';
import { 
  X, Star, Upload, Trash2, MapPin, CheckCircle2, 
  AlertCircle, Loader2, Sparkles, Image as ImageIcon, Video, ShieldCheck
} from 'lucide-react';
import api from '@/utils/api';

const PROJECT_CATEGORIES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Wall Designs',
  'Ceiling Designs',
  'Lighting',
  'Customized Furniture',
  'Wooden Products',
  'Other Interior Projects'
];

const RATING_LABELS = {
  5: 'Exceptional Teakwood Craftsmanship & Service (5/5)',
  4: 'Very Satisfied & Premium Quality (4/5)',
  3: 'Good Quality & Satisfactory (3/5)',
  2: 'Fair Experience (2/5)',
  1: 'Needs Improvement (1/5)',
};

export default function ReviewModal({ isOpen, onClose, order, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewType, setReviewType] = useState('product');
  const [projectCategory, setProjectCategory] = useState('Customized Furniture');
  const [reviewText, setReviewText] = useState('');
  
  // Images & Video
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  // Location
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Andhra Pradesh');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationConsent, setLocationConsent] = useState(true);
  const [publicConsent, setPublicConsent] = useState(true);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Initialize from order address if available
  useEffect(() => {
    if (order && order.address) {
      // Try extracting city from address
      const parts = order.address.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        setCity(parts[parts.length - 2] || 'Rajahmundry');
      } else {
        setCity('Rajahmundry');
      }
    } else {
      setCity('Rajahmundry');
    }

    if (order?.category) {
      const match = PROJECT_CATEGORIES.find(c => c.toLowerCase() === order.category.toLowerCase());
      if (match) setProjectCategory(match);
    }
  }, [order]);

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(p => URL.revokeObjectURL(p));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreviews, videoPreview]);

  if (!isOpen || !order) return null;

  // Handle Multi-image selection (max 6)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (selectedImages.length + files.length > 6) {
      setErrorMsg('You can upload up to 6 real project photographs.');
      return;
    }

    setErrorMsg('');
    const newFiles = [...selectedImages, ...files].slice(0, 6);
    setSelectedImages(newFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (indexToRemove) => {
    const updatedFiles = selectedImages.filter((_, idx) => idx !== indexToRemove);
    const updatedPreviews = imagePreviews.filter((_, idx) => idx !== indexToRemove);
    setSelectedImages(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  // Handle Video selection
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 40MB
    if (file.size > 40 * 1024 * 1024) {
      setErrorMsg('Video file size must be less than 40MB.');
      return;
    }

    setErrorMsg('');
    setSelectedVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleRemoveVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setSelectedVideo(null);
    setVideoPreview('');
  };

  // Detect GPS City
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocode via OpenStreetMap Nominatim
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.address) {
            const detectedCity = data.address.city || data.address.town || data.address.village || data.address.suburb || 'Rajahmundry';
            const detectedState = data.address.state || 'Andhra Pradesh';
            setCity(detectedCity);
            setStateName(detectedState);
          }
        } catch (err) {
          console.warn('Geolocation reverse geocoding failed:', err);
          setErrorMsg('Could not detect city automatically. Please enter your city manually.');
        } finally {
          setIsDetectingLocation(false);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        setErrorMsg('Location permission denied or unavailable. Please type your city manually.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Submit Review Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!rating) {
      setErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }
    if (!reviewText.trim() || reviewText.trim().length < 10) {
      setErrorMsg('Please write at least 10 characters describing your experience.');
      return;
    }
    if (!city.trim() || !stateName.trim()) {
      setErrorMsg('Please provide your city and state.');
      return;
    }
    if (!publicConsent) {
      setErrorMsg('Please agree to display your review publicly.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', order._id);
      formData.append('phone', order.phone || localStorage.getItem('ld_user_phone') || '');
      formData.append('rating', rating);
      formData.append('reviewText', reviewText.trim());
      formData.append('reviewType', reviewType);
      formData.append('projectCategory', projectCategory);
      formData.append('city', city.trim());
      formData.append('state', stateName.trim());
      formData.append('country', 'India');
      formData.append('locationConsent', locationConsent);
      formData.append('publicConsent', publicConsent);

      // Append images
      selectedImages.forEach((imgFile) => {
        formData.append('images', imgFile);
      });

      // Append video if selected
      if (selectedVideo) {
        formData.append('video', selectedVideo);
      }

      const res = await api.post('/reviews', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success) {
        setSuccessMsg(res.data.message || 'Thank you! Your verified review has been submitted.');
        if (onReviewSubmitted) {
          onReviewSubmitted(res.data.review);
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit review. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      const msg = err.response?.data?.message || err.message || 'An error occurred while submitting your review.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FBF9F1] dark:bg-[#071A33] border-2 border-[#D6A04B]/40 rounded-3xl shadow-2xl p-5 sm:p-7 text-left my-8 max-h-[92vh] overflow-y-auto scrollbar-thin"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between pb-4 border-b border-[#D6A04B]/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Customer Review</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F5E6C8]">
              Rate & Review Your Experience
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-light mt-0.5">
              Order: <span className="font-bold text-slate-900 dark:text-white">{order.product}</span> • Ref: <span className="font-mono font-bold text-[#D6A04B]">#{String(order._id).slice(-6).toUpperCase()}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-extrabold text-sm">{successMsg}</p>
              <p className="font-normal text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">Closing window...</p>
            </div>
          </div>
        )}

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-left">
          {/* Star Rating Section */}
          <div className="bg-white dark:bg-[#0B1E3B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center sm:text-left">
            <label className="block text-xs font-black uppercase tracking-wider text-[#A64B24] dark:text-[#D6A04B] mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isLit = (hoverRating || rating) >= starVal;
                return (
                  <button
                    key={starVal}
                    type="button"
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starVal)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                    title={`Rate ${starVal} Star`}
                  >
                    <Star
                      className={`h-7 w-7 sm:h-8 sm:w-8 transition-colors ${
                        isLit
                          ? 'fill-[#D6A04B] text-[#D6A04B]'
                          : 'fill-transparent text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Project Type & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Review Type
              </label>
              <select
                value={reviewType}
                onChange={(e) => setReviewType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1E3B] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D6A04B]"
              >
                <option value="product">Specific Teakwood Product</option>
                <option value="custom_project">Full Interior / Custom Project</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Project Category
              </label>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1E3B] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D6A04B]"
              >
                {PROJECT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Written Review */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Detailed Customer Feedback *
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {reviewText.length} characters
              </span>
            </div>
            <textarea
              rows="4"
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about the teakwood quality, wood grain, carving finish, installation experience, and durability..."
              className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0B1E3B] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#D6A04B] shadow-inner font-normal"
            ></textarea>
          </div>

          {/* Photo & Video Upload Section */}
          <div className="bg-white dark:bg-[#0B1E3B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-[#F5E6C8] flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-[#D6A04B]" />
                  Upload Finished Project Photographs ({selectedImages.length}/6)
                </span>
                <span className="text-[10px] text-slate-500">Max 6 images</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Upload clear photos of your installed teakwood furniture or completed home space.
              </p>

              {/* Previews Grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-3">
                  {imagePreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-900">
                      <img src={previewUrl} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedImages.length < 6 && (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#D6A04B] hover:border-[#D6A04B]/80 bg-amber-50/50 dark:bg-amber-950/20 text-[#A64B24] dark:text-[#D6A04B] text-xs font-bold transition-all cursor-pointer shadow-xs">
                  <Upload className="h-4 w-4" />
                  <span>Choose Photographs</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Optional Short Video Upload */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-[#F5E6C8] flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-[#D6A04B]" />
                  Optional Short Video (Max 40MB)
                </span>
                {selectedVideo && (
                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    className="text-red-500 hover:text-red-700 text-xs font-bold"
                  >
                    Remove Video
                  </button>
                )}
              </div>

              {videoPreview ? (
                <div className="mt-2 aspect-video max-w-xs rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                  <video src={videoPreview} controls className="w-full h-full object-cover" />
                </div>
              ) : (
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer hover:bg-slate-100 mt-1">
                  <Video className="h-3.5 w-3.5 text-slate-500" />
                  <span>Select Video File</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Location & Consent Section */}
          <div className="bg-white dark:bg-[#0B1E3B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-[#F5E6C8]">
                Your Location (City & State) *
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[#008DDA] text-[11px] font-bold cursor-pointer hover:bg-sky-100 disabled:opacity-50 self-start sm:self-auto"
              >
                {isDetectingLocation ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5" />
                )}
                <span>Detect My City (GPS)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Rajahmundry, Hyderabad, Vijayawada"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Andhra Pradesh, Telangana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#D6A04B]"
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              🔒 Privacy Guarantee: Your house address and GPS coordinates are never displayed. Only your city and state (e.g. &quot;Rajahmundry, Andhra Pradesh, India&quot;) are shown.
            </p>

            {/* Consent Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={locationConsent}
                  onChange={(e) => setLocationConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#D6A04B] focus:ring-[#D6A04B]"
                />
                <span>Display my city and state with my verified review badge</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  required
                  checked={publicConsent}
                  onChange={(e) => setPublicConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#D6A04B] focus:ring-[#D6A04B]"
                />
                <span>
                  I give consent for LD Interiors to publish my review, rating, and uploaded project photographs on the official website.
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#A64B24] to-[#7B3215] hover:brightness-110 text-white text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading &amp; Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#F5E6C8]" />
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
