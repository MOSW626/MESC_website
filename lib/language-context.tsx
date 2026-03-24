"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, defaultLanguage, translations } from "./i18n";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: defaultLanguage,
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved && (saved === "ko" || saved === "en")) {
      setLangState(saved);
    }
  }, []);

  function setLang(newLang: Language) {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  }

  function t(key: string): string {
    const keys = key.split(".");
    let value: unknown = translations[lang];
    for (const k of keys) {
      if (value && typeof value === "object" && k in (value as object)) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // fallback to Korean
        let fallback: unknown = translations["ko"];
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in (fallback as object)) {
            fallback = (fallback as Record<string, unknown>)[fk];
          } else return key;
        }
        return typeof fallback === "string" ? fallback : key;
      }
    }
    return typeof value === "string" ? value : key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
