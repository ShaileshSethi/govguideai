"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

type Translations = {
  [key: string]: string;
};

const translations: Record<Language, Translations> = {
  en: {
    "nav.home": "Home",
    "nav.profile": "Profile",
    "nav.settings": "Settings",
    "nav.signin": "Sign In",
    "nav.signout": "Sign out",
    "home.title": "GovGuide AI",
    "home.subtitle": "Describe your problem. We'll tell you exactly what to do.",
    "home.placeholder": "Specify your problem (e.g. I lost my Aadhaar card...)",
    "home.button": "Generate Action Plan",
    "home.suggestions": "Suggested Searches",
    "plan.summary": "Action Plan Summary",
    "plan.services": "Government Services Required",
    "plan.time": "Processing Time",
    "plan.fee": "Estimated Fees",
    "plan.docs": "Required Documents",
    "plan.steps": "Application Steps",
    "plan.visit": "Visit Official Website",
    "plan.more_info": "More Information",
    "plan.next": "Next Steps",
    "plan.tips": "Helpful Tips"
  },
  hi: {
    "nav.home": "होम",
    "nav.profile": "प्रोफ़ाइल",
    "nav.settings": "सेटिंग्स",
    "nav.signin": "साइन इन",
    "nav.signout": "साइन आउट",
    "home.title": "गवगाइड एआई",
    "home.subtitle": "अपनी समस्या बताएं। हम आपको बताएंगे कि क्या करना है।",
    "home.placeholder": "अपनी समस्या बताएं (जैसे: मेरा आधार कार्ड खो गया है...)",
    "home.button": "योजना बनाएं",
    "home.suggestions": "सुझाई गई खोजें",
    "plan.summary": "कार्य योजना सारांश",
    "plan.services": "आवश्यक सरकारी सेवाएं",
    "plan.time": "प्रसंस्करण का समय",
    "plan.fee": "अनुमानित शुल्क",
    "plan.docs": "आवश्यक दस्तावेज़",
    "plan.steps": "आवेदन के चरण",
    "plan.visit": "आधिकारिक वेबसाइट पर जाएं",
    "plan.more_info": "अधिक जानकारी",
    "plan.next": "अगले कदम",
    "plan.tips": "उपयोगी टिप्स"
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem('govguide_lang') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'hi')) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('govguide_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
