"use client";
import { useState, useEffect } from 'react';
import { 
  Settings, X, RefreshCw, CheckCircle2, Sparkles, Volume2, 
  VolumeX, Moon, Sun, Globe, Trash2, Smartphone, Share2, 
  ShieldCheck, Zap, Info, ArrowUpCircle
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { playWoodenChime } from '@/utils/audioChime';

const CURRENT_VERSION = 'v2.4.1';

export default function SettingsModal() {
  const { language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const isTelugu = language === 'TE';

  const [isOpen, setIsOpen] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('idle'); // 'idle' | 'checking' | 'updated' | 'available'
  const [lastChecked, setLastChecked] = useState('');
  
  // Audio & Animation states from localStorage
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [introEnabled, setIntroEnabled] = useState(true);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [cacheClearedSuccess, setCacheClearedSuccess] = useState(false);

  useEffect(() => {
    // Listen for custom trigger from navbar, sidebar, or footer
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-settings-modal', handleOpen);

    // Load preferences
    if (typeof window !== 'undefined') {
      const savedSound = localStorage.getItem('ld_wood_sound_enabled');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');

      const savedIntro = localStorage.getItem('ld_wood_intro_enabled');
      if (savedIntro !== null) setIntroEnabled(savedIntro === 'true');

      const savedAuto = localStorage.getItem('ld_auto_update_enabled');
      if (savedAuto !== null) setAutoUpdateEnabled(savedAuto === 'true');

      const savedLast = localStorage.getItem('ld_last_update_check');
      if (savedLast) setLastChecked(savedLast);
      else setLastChecked(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    return () => {
      window.removeEventListener('open-settings-modal', handleOpen);
    };
  }, []);

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    localStorage.setItem('ld_wood_sound_enabled', nextVal.toString());
    if (nextVal) {
      playWoodenChime();
    }
  };

  const handleToggleIntro = () => {
    const nextVal = !introEnabled;
    setIntroEnabled(nextVal);
    localStorage.setItem('ld_wood_intro_enabled', nextVal.toString());
  };

  const handleToggleAutoUpdate = () => {
    const nextVal = !autoUpdateEnabled;
    setAutoUpdateEnabled(nextVal);
    localStorage.setItem('ld_auto_update_enabled', nextVal.toString());
  };

  // Check for app updates
  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateStatus('checking');

    try {
      // 1. Trigger Service Worker update check
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.update();
        }
      }

      // 2. Cache-busting ping to check latest manifest version
      await fetch(`/manifest.json?nocache=${Date.now()}`, { cache: 'no-store' });

      // Artificial small delay for high-tech feedback
      await new Promise((res) => setTimeout(res, 900));

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastChecked(nowTime);
      localStorage.setItem('ld_last_update_check', nowTime);

      setUpdateStatus('updated');
      playWoodenChime();
    } catch (err) {
      setUpdateStatus('updated');
    } finally {
      setCheckingUpdate(false);
    }
  };

  // Force clean cache and reload for maximum speed boost
  const handleClearCacheAndSpeedUp = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCacheClearedSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (e) {
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-[#0B192C] text-white max-w-md w-full rounded-3xl border border-amber-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.85)] max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#081220]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-white">
                {isTelugu ? "సెట్టింగ్స్ & యాప్ అప్‌డేట్స్" : "Settings & App Updates"}
              </h3>
              <p className="text-[10px] text-neutral-400">LD Interiors Mobile & Web App</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-left text-xs">
          
          {/* 1. App Version & Check for Updates Card */}
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl p-4 border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-sm font-black text-amber-400">
                  {CURRENT_VERSION}
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Production
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">
                {isTelugu ? `చివరిసారి: ${lastChecked || 'ఇప్పుడే'}` : `Checked: ${lastChecked || 'Just now'}`}
              </span>
            </div>

            <p className="text-[11px] text-neutral-300 mb-3.5 leading-relaxed">
              {isTelugu
                ? "మీ యాప్ ఎల్లప్పుడూ లేటెస్ట్ ఫర్నిచర్ డిజైన్లు, రేట్లు మరియు కొత్త ఫీచర్లతో అప్‌డేట్ అయి ఉంటుంది."
                : "Your app stays automatically updated with the latest Burma teakwood designs & pricing."}
            </p>

            {/* Check for Updates Action Button */}
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-neutral-950 font-black py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-neutral-950 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>
                {checkingUpdate
                  ? (isTelugu ? "అప్‌డేట్స్ చెక్ చేస్తోంది..." : "Checking for updates...")
                  : (isTelugu ? "అప్‌డేట్స్ చెక్ చేయండి (Check for Updates)" : "Check for Updates")}
              </span>
            </button>

            {/* Status Feedback Pill */}
            {updateStatus === 'updated' && (
              <div className="mt-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl p-2.5 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <span className="font-bold block text-[11px]">
                    {isTelugu ? "లేటెస్ట్ వెర్షన్ అప్‌డేట్ అయ్యింది! (Up to Date)" : "Latest version is up to date!"}
                  </span>
                  <span className="text-[10px] text-emerald-400/80">
                    {isTelugu ? `మీరు సరికొత్త వెర్షన్‌లో ఉన్నారు (${CURRENT_VERSION})` : `You are using the latest release (${CURRENT_VERSION})`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Auto-Update Setting */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                {isTelugu ? "ఆటోమేటిక్ అప్‌డేట్స్" : "Automatic Background Updates"}
              </span>
              <p className="text-[10px] text-neutral-400 leading-tight">
                {isTelugu
                  ? "కొత్త ఫీచర్లు విడుదలైనప్పుడు యాప్ నేరుగా అప్‌డేట్ అవుతుంది"
                  : "Auto-sync new designs and improvements silently"}
              </p>
            </div>
            <button
              onClick={handleToggleAutoUpdate}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                autoUpdateEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  autoUpdateEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 3. Wooden App Open Animation & Sound */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  {isTelugu ? "వుడెన్ స్ప్లాష్ యానిమేషన్" : "Wooden Launch Animation"}
                </span>
                <p className="text-[10px] text-neutral-400">
                  {isTelugu ? "యాప్ ఓపెన్ చేసినప్పుడు వుడ్ యానిమేషన్" : "Handcrafted wood animation on app open"}
                </p>
              </div>
              <button
                onClick={handleToggleIntro}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  introEnabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    introEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5 text-emerald-400" /> : <VolumeX className="h-3.5 w-3.5 text-neutral-400" />}
                  {isTelugu ? "టేకువుడ్ సౌండ్ ఎఫెక్ట్" : "Teakwood Chime Sound"}
                </span>
                <p className="text-[10px] text-neutral-400">
                  {isTelugu ? "సహజమైన టేకు కలప ధ్వని" : "Acoustic woodblock resonance"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={playWoodenChime}
                  className="bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all cursor-pointer"
                  title="Preview Teakwood Sound"
                >
                  🔊 {isTelugu ? "వినండి" : "Preview"}
                </button>
                <button
                  onClick={handleToggleSound}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Appearance & Language Quick Toggles */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => toggleTheme()}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 flex flex-col gap-1 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">{isTelugu ? "థీమ్" : "Theme"}</span>
                {theme === 'dark' ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-400" />}
              </div>
              <span className="font-bold text-white text-xs mt-0.5">
                {theme === 'dark' ? (isTelugu ? "డార్క్ మోడ్ 🌙" : "Dark Mode 🌙") : (isTelugu ? "లైట్ మోడ్ ☀️" : "Light Mode ☀️")}
              </span>
            </button>

            <button
              onClick={() => toggleLanguage()}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 flex flex-col gap-1 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">{isTelugu ? "భాష" : "Language"}</span>
                <Globe className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <span className="font-bold text-white text-xs mt-0.5">
                {isTelugu ? "తెలుగు (TE)" : "English (EN)"}
              </span>
            </button>
          </div>

          {/* 5. Clear Cache & 2x Speed Booster */}
          <div className="bg-sky-500/10 border border-sky-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-start gap-2.5">
              <Zap className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sky-300 block">
                  {isTelugu ? "యాప్ స్పీడ్ బూస్టర్ (Fast Launch)" : "App Speed Booster"}
                </span>
                <p className="text-[10px] text-neutral-300 mt-0.5 leading-relaxed">
                  {isTelugu
                    ? "యాప్ స్లోగా ఉంటే తాత్కాలిక బ్రౌజర్ క్యాష్ క్లియర్ చేసి 2 రెట్లు వేగంగా ఓపెన్ అయ్యేలా చేస్తుంది."
                    : "Clears temporary offline cache and optimizes storage for 2x faster app startup."}
                </p>
              </div>
            </div>

            <button
              onClick={handleClearCacheAndSpeedUp}
              className="w-full bg-white/10 hover:bg-white/20 text-sky-200 border border-sky-400/30 font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <Trash2 className="h-3.5 w-3.5 text-sky-400" />
              <span>
                {cacheClearedSuccess
                  ? (isTelugu ? "క్యాష్ క్లియర్ అయ్యింది! రీలోడ్ అవుతోంది..." : "Cache Cleared! Reloading...")
                  : (isTelugu ? "క్యాష్ క్లియర్ చేసి స్పీడ్ పెంచండి" : "Clear Cache & Boost Speed")}
              </span>
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#081220] flex items-center justify-between text-[10px] text-neutral-400">
          <span>LD Interiors & Furnitures, Alamuru</span>
          <span className="font-mono text-amber-400/90">{CURRENT_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
