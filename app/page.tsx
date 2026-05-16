"use client";

import { Camera, ChevronDown, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/constants/language";

export default function HomePage() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  const languageOptions = [
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "ko", label: "한국어", flag: "🇰🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const currentLang = languageOptions.find((l) => l.code === language);

  const tx = languages[language] || languages.en;

  return (
      <main
          className="relative flex min-h-screen flex-col items-center justify-center bg-bg px-6 overflow-hidden">

        {/* 배경 장식 */}
        <div
            className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-black/[0.04]"/>
        <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-black/[0.04]"/>

        {/* 언어 드롭다운 */}
        <div className="fixed right-5 top-5 z-50">
          <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-2.5 text-caption font-semibold text-primary shadow-sm transition-shadow hover:shadow-md"
          >
            <span>{currentLang?.flag}</span>
            <span>{language.toUpperCase()}</span>
            <ChevronDown
                size={14}
                className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          {open && (
              <div
                  className="absolute right-0 top-12 min-w-[150px] overflow-hidden rounded-2xl bg-surface shadow-lg">
                {languageOptions.map((lang, i) => {
                  const isSelected = lang.code === language;
                  return (
                      <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code as "en" | "ko" | "ja");
                            setOpen(false);
                          }}
                          className={[
                            "flex w-full items-center justify-between gap-2.5 px-4 py-3 text-caption text-left transition-colors",
                            i !== 0 ? "border-t border-black/[0.06]" : "",
                            isSelected
                                ? "bg-black/[0.05] font-semibold text-primary"
                                : "font-normal text-muted hover:bg-black/[0.03]",
                          ].join(" ")}
                      >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                        {isSelected && <Check size={14} className="text-primary shrink-0"/>}
                      </button>
                  );
                })}
              </div>
          )}
        </div>

        {/* 중앙 콘텐츠 */}
        <div className="flex flex-col items-center gap-8 animate-fadein fill-mode-both">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <h1 className="text-[40px] font-extrabold tracking-tight text-primary leading-none">
              TABEYO
            </h1>
            <p className="text-caption text-muted tracking-wide">
              {tx.homeSubtitle}
            </p>
          </div>

          <Link
              href="/camera"
              className="flex items-center gap-2.5 rounded-full bg-primary px-9 py-[18px] text-title font-bold text-surface shadow-md transition-all active:scale-95 active:shadow-sm"
          >
            <span>{tx.homeScanBtn}</span>
            <Camera size={20} className="text-surface"/>
          </Link>
        </div>

        {/* 하단 힌트 */}
        <p className="absolute bottom-8 text-tiny text-muted/60 tracking-wide">
          {tx.homeHint}
        </p>
      </main>
  );
}