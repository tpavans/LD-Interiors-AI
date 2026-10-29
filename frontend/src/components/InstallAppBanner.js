"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Download, X, Smartphone, Share, Share2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { trackEvent } from '@/utils/telemetry';

export default function InstallAppBanner() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // App Sharing Handler
  const handleShareApp = async () => {
    const shareTitle = isTelugu
      ? "LD Interiors & Furnitures మొబైల్ యాప్"
      : "LD Interiors & Furnitures Mobile App";
    const shareText = isTelugu
      ? "🏠 LD Interiors మొబైల్ యాప్‌ను ఇన్‌స్టాల్ చేసుకోండి!\nప్రీమియం బర్మా టేకు వుడ్ ఫర్నిచర్ డిజైన్లు & నేరుగా ఆర్డర్ చేసుకోండి:\n"
      : "🏠 Install the official LD Interiors App for handcrafted Burma Teak furniture designs & direct ordering:\n";
    const shareUrl = "https://www.ldinteriors.in";

    // Track analytics
    trackEvent('whatsapp_share');
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        method: 'app_share_button',
        content_type: 'app',
        item_id: 'ld_interiors_app'
      });
    }

    // 1. Native Android WebView bridge
    if (typeof window !== 'undefined' && window.AndroidShare && window.AndroidShare.shareApp) {
      window.AndroidShare.shareApp(shareText, shareUrl);
      return;
    }

    // 2. Web Share API (Chrome Mobile, Safari, etc.)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // 3. Fallback: Copy link & open WhatsApp
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText}${shareUrl}`).catch(() => {});
    }
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 4000);

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    // 1. Register PWA Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('LD Interiors PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running as installed standalone app
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        trackEvent('app_session');
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'app_session', {
            event_category: 'App',
            event_label: 'Installed App Opened'
          });
        }
      }
      return isStandaloneMode;
    };

    const isInstalled = checkStandalone();

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Check if banner was dismissed recently (within 5 days)
    const lastDismissed = localStorage.getItem('ld_pwa_dismissed');
    const isDismissedRecently =
      lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 5 * 24 * 60 * 60 * 1000;

    // 5. Listen for beforeinstallprompt event (Chromium, Android, Chrome, Edge)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isDismissedRecently && !isInstalled) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom open-install-app trigger from navbar / footer / drawer
    const handleCustomTrigger = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else if (isIosDevice) {
        setShowIOSModal(true);
      } else {
        setShowBanner(true);
      }
    };
    window.addEventListener('open-install-app', handleCustomTrigger);

    // Listen for custom open-share-app trigger from drawer
    const handleShareTrigger = () => {
      handleShareApp();
    };
    window.addEventListener('open-share-app', handleShareTrigger);

    // Listen for successful installation
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      trackEvent('app_installed');
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'app_installed', {
          event_category: 'App',
          event_label: 'PWA App Installed'
        });
      }
      setTimeout(() => setInstalledSuccess(false), 5000);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // If on iOS and not dismissed and not installed, show banner after 4s
    if (isIosDevice && !isDismissedRecently && !isInstalled) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-install-app', handleCustomTrigger);
      window.removeEventListener('open-share-app', handleShareTrigger);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      alert(
        isTelugu
          ? "మీ బ్రౌజర్ మెనూ (3 చుక్కలు) పై క్లిక్ చేసి 'Install app' లేదా 'Add to Home screen' ఎంచుకోండి."
          : "Please tap your browser menu (3 dots) and select 'Install app' or 'Add to Home screen'."
      );
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('ld_pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Share Copied Toast */}
      {copiedToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B192C] text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">
            {isTelugu
              ? "యాప్ లింక్ కాపీ అయ్యింది & WhatsApp ఓపెన్ అవుతోంది!"
              : "App Share link copied & opening WhatsApp!"}
          </span>
        </div>
      )}

      {/* Installed Success Toast */}
      {installedSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0B192C] text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-amber-400" />
          <span className="text-xs font-semibold">
            {isTelugu
              ? "LD Interiors యాప్ విజయవంతంగా ఇన్‌స్టాల్ అయ్యింది!"
              : "LD Interiors App installed successfully!"}
          </span>
        </div>
      )}

      {/* Floating Bottom App Install Banner */}
      {showBanner && !isStandalone && (
        <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-[#0B192C]/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.4)] border border-amber-500/30 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            {/* App Icon */}
            <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border border-amber-500/40 shadow-sm bg-black">
              <img
                src="/icons/icon-192x192.png"
                alt="LD Interiors App"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-wide truncate flex items-center gap-1.5">
                LD Interiors App
                <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  FREE
                </span>
              </h4>
              <p className="text-[10.5px] text-neutral-300 truncate mt-0.5">
                {isTelugu
                  ? "వేగవంతమైన అనుభవం & నేరుగా ఆర్డర్ చేయండి"
                  : "Install app for 2x faster shopping & orders"}
              </p>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2 mt-3 pt-2.5 border-t border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-neutral-950 font-bold text-xs py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{isTelugu ? "ఇన్‌స్టాల్ చేయండి" : "Install App"}</span>
              </button>

              <button
                onClick={handleShareApp}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                title={isTelugu ? "యాప్‌ను షేర్ చేయండి" : "Share App"}
              >
                <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>{isTelugu ? "షేర్" : "Share"}</span>
              </button>

              <button
                onClick={handleDismiss}
                className="text-[11px] text-neutral-400 hover:text-white px-2 py-2 transition-colors cursor-pointer"
              >
                {isTelugu ? "తర్వాత" : "Later"}
              </button>
            </div>

            {!isIOS && (
              <a
                href="/ld-interiors.apk"
                download="LD-Interiors.apk"
                onClick={() => {
                  trackEvent('apk_download');
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'apk_download', {
                      event_category: 'App',
                      event_label: 'Android APK Downloaded'
                    });
                  }
                }}
                className="text-[10px] text-amber-400/90 hover:text-amber-300 text-center flex items-center justify-center gap-1 hover:underline transition-colors py-0.5"
              >
                <Smartphone className="h-3 w-3 inline text-amber-400" />
                <span>{isTelugu ? "లేదా డైరెక్ట్ Android APK డౌన్‌లోడ్ చేయండి (.apk)" : "Or Download Android APK (.apk)"}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* iOS Safari Manual Install Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-[#0B192C] text-white max-w-sm w-full rounded-3xl p-6 border border-amber-500/40 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-md mb-3 bg-black">
                <img src="/icons/icon-192x192.png" alt="LD Interiors" className="h-full w-full object-cover" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                {isTelugu ? "LD Interiors ని హోమ్ స్క్రీన్‌కు చేర్చండి" : "Install LD Interiors on iPhone"}
              </h3>
              <p className="text-xs text-neutral-300 mt-1 mb-5">
                {isTelugu
                  ? "ఆపిల్ సఫారీ బ్రౌజర్‌లో కింద ఇచ్చిన 2 స్టెప్స్‌తో హోమ్ స్క్రీన్‌లో యాప్‌లా వాడుకోవచ్చు:"
                  : "Follow these 2 simple steps in Safari to add LD Interiors to your iPhone Home Screen:"}
              </p>

              <div className="w-full space-y-3 text-left bg-white/5 p-4 rounded-2xl border border-white/10 text-xs">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-500 text-neutral-950 font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {isTelugu ? "సఫారీ బటన్ పై క్లిక్ చేయండి" : "Tap the Share button"}
                    </span>
                    <p className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                      (Tap the <Share className="h-3.5 w-3.5 text-blue-400 inline" /> icon at bottom of Safari)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-500 text-neutral-950 font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {isTelugu ? "'Add to Home Screen' ఎంచుకోండి" : "Select 'Add to Home Screen'"}
                    </span>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Scroll down and tap <strong>Add to Home Screen (+)</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 w-full">
                <button
                  onClick={handleShareApp}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{isTelugu ? "యాప్‌ను షేర్ చేయండి" : "Share App"}</span>
                </button>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
                >
                  {isTelugu ? "అర్థమైంది" : "Got it!"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
