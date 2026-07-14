"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('EN');

  useEffect(() => {
    const savedLang = localStorage.getItem('ld_lang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleLanguage = (lang) => {
    const newLang = lang || (language === 'EN' ? 'TE' : 'EN');
    setLanguage(newLang);
    localStorage.setItem('ld_lang', newLang);
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
