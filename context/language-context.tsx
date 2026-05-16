"use client";

import { createContext, useContext, useState } from "react";

type Language = "en" | "ko" | "ja";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // 1. 초기값 설정: 브라우저 환경이라면 localStorage에서 불러오고, 없으면 기본값 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app_lang") as Language;
      if (saved === "en" || saved === "ko" || saved === "ja") {
        return saved;
      }
    }
    return "en";
  });

  // 2. 언어가 변경될 때마다 localStorage에 저장
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", lang);
    }
  };

  return (
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}