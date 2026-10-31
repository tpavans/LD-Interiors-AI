"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const sanitizeLang = (val) => {
  if (typeof val === 'string') {
    const upper = val.toUpperCase().trim();
    if (upper === 'TE' || upper === 'EN') return upper;
  }
  return 'TE'; // Default to Telugu
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('TE');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('ld_lang');
      const valid = sanitizeLang(savedLang);
      setLanguage(valid);
      // Clean up corrupted storage like '[object Object]' immediately
      localStorage.setItem('ld_lang', valid);
    } catch (e) {
      setLanguage('TE');
    }
  }, []);

  const toggleLanguage = (lang) => {
    setLanguage((prev) => {
      const current = sanitizeLang(prev);
      let target;
      if (typeof lang === 'string') {
        const candidate = lang.toUpperCase().trim();
        target = (candidate === 'EN' || candidate === 'TE') ? candidate : (current === 'EN' ? 'TE' : 'EN');
      } else {
        // If triggered directly by an onClick event without a string parameter
        target = current === 'EN' ? 'TE' : 'EN';
      }
      try {
        localStorage.setItem('ld_lang', target);
      } catch (e) {}
      return target;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
