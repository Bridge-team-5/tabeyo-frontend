"use client";

import { createContext, useContext, useState } from "react";

type Language = "en" | "ko" | "ja";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({
                                   children,
                                   initialLang = "en",
                                 }: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  // SSR에서 layout이 cookie를 읽어 initialLang을 내려주므로
  // 서버/클라이언트 첫 렌더가 항상 동일 → hydration mismatch 없음
  const [language, setLanguageState] = useState<Language>(initialLang);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.cookie = `app_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
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