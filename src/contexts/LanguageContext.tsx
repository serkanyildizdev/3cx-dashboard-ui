'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

type Locale = 'de' | 'en' | 'tr';

type Messages = typeof de;

interface LanguageContextType {
  language: Locale;
  setLanguage: (lang: Locale) => void;
  t: Messages;
}

const messages: Record<Locale, Messages> = {
  de,
  en,
  tr,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Locale>('de');

  useEffect(() => {
    // Load language from localStorage on client
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Locale;
      if (saved && ['de', 'en', 'tr'].includes(saved)) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: messages[language],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
