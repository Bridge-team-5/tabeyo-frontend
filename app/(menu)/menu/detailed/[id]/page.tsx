"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import type { MenuItem, MenuResponse } from "@/types/menu";

const t = {
  en: {
    ingredients: "Likely Ingredients",
    allergens: "Potential Allergens",
    dietary: "Dietary",
    spiciness: "Spiciness",
    addToCart: "Add to cart",
    added: "Added!",
    notFound: "Menu item not found.",
    detailedIngredients: "Detailed ingredient info",
  },
  ko: {
    ingredients: "예상 재료",
    allergens: "알레르기 위험",
    dietary: "식이 정보",
    spiciness: "매운 정도",
    addToCart: "장바구니에 추가",
    added: "추가됨!",
    notFound: "메뉴를 찾을 수 없습니다.",
    detailedIngredients: "상세 성분 정보",
  },
  ja: {
    ingredients: "予想される食材",
    allergens: "アレルギー注意",
    dietary: "食事情報",
    spiciness: "辛さ",
    addToCart: "カートに追加",
    added: "追加済み！",
    notFound: "メニューが見つかりません。",
    detailedIngredients: "詳細な成分情報",
  },
};

function Spiciness({ level }: { level: number }) {
  if (!level) return null;
  return (
      <div className="flex gap-0.5">
        {Array.from({ length: level }).map((_, i) => (
            <span key={i} className="text-[16px]">🌶️</span>
        ))}
      </div>
  );
}

// 깜빡이는 스켈레톤 블록
function Skeleton({ className }: { className?: string }) {
  return (
      <div className={`animate-pulse rounded-xl bg-black/[0.06] ${className ?? ""}`} />
  );
}

function DetailSkeleton() {
  return (
      <div className="min-h-screen bg-surface pb-28">
        {/* 헤더 */}
        <div className="flex items-center bg-surface px-5 py-4 border-b border-black/[0.06]">
          <div className="h-6 w-6 rounded-lg bg-black/[0.06] animate-pulse" />
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">
          {/* 이름 + 가격 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/4 mt-1" />
          </div>

          {/* 사진 가로 스크롤 */}
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[120px] w-[120px] shrink-0 !rounded-2xl" />
            ))}
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* 재료 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          {/* 알레르기 태그 */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 !rounded-full" />
              <Skeleton className="h-6 w-16 !rounded-full" />
              <Skeleton className="h-6 w-12 !rounded-full" />
            </div>
          </div>

          {/* 성분 박스 */}
          <div className="rounded-2xl bg-background p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 px-5 py-4 backdrop-blur-sm border-t border-black/[0.06]">
          <Skeleton className="h-14 w-full !rounded-full" />
        </div>
      </div>
  );
}

export default function MenuDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const { addToCart, cart } = useCart();
  const { language } = useLanguage();
  const tx = t[language];

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const isInCart = cart.some((c) => c.item.id === id);

  useEffect(() => {
    const raw = sessionStorage.getItem("menuData");
    if (raw) {
      try {
        const data: MenuResponse = JSON.parse(raw);
        setItem(data.items.find((m) => m.id === id) ?? null);
      } catch {
        setItem(null);
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!item) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-caption text-muted">{tx.notFound}</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-surface pb-28">

        {/* 헤더 */}
        <div className="flex items-center bg-surface px-5 py-4 border-b border-black/[0.06]">
          <button onClick={() => router.back()} className="active:opacity-60 transition-opacity">
            <ArrowLeft size={22} className="text-primary" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-6">

          {/* 이름 + 가격 */}
          <div>
            <h1 className="text-title font-bold text-primary">
              {item.translatedName || item.originalName}
            </h1>
            {item.translatedName && item.originalName !== item.translatedName && (
                <p className="mt-1 text-caption text-muted">{item.originalName}</p>
            )}
            <p className="mt-2 text-body font-semibold text-primary">
              {item.price.currency} {item.price.amount.toLocaleString()}
            </p>
          </div>

          {/* 사진 가로 스크롤 */}
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className="h-[120px] w-[120px] shrink-0 rounded-2xl bg-background flex items-center justify-center"
                >
                  <span className="text-caption text-muted">photo</span>
                </div>
            ))}
          </div>

          {/* 상세 설명 */}
          <p className="text-body text-primary leading-relaxed">{item.fullExplanation}</p>

          {/* 매운 정도 */}
          {item.spicinessLevel > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.spiciness}</p>
                <Spiciness level={item.spicinessLevel} />
              </div>
          )}

          {/* 재료 */}
          {item.likelyIngredients.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.ingredients}</p>
                <p className="text-body text-primary">{item.likelyIngredients.join(", ")}</p>
              </div>
          )}

          {/* 알레르기 */}
          {item.potentialAllergens.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.allergens}</p>
                <div className="flex flex-wrap gap-2">
                  {item.potentialAllergens.map((a) => (
                      <span key={a} className="rounded-full bg-red-100 px-3 py-1 text-tiny font-semibold text-red-600">
                  {a}
                </span>
                  ))}
                </div>
              </div>
          )}

          {/* 식이 정보 */}
          {item.dietaryFlags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.dietary}</p>
                <div className="flex flex-wrap gap-2">
                  {item.dietaryFlags.map((f) => (
                      <span key={f} className="rounded-full bg-green-100 px-3 py-1 text-tiny font-semibold text-green-700">
                  {f}
                </span>
                  ))}
                </div>
              </div>
          )}

          {/* 상세 성분 박스 */}
          <div className="rounded-2xl bg-background p-4">
            <p className="text-tiny font-semibold text-muted uppercase tracking-wide mb-2">
              {tx.detailedIngredients}
            </p>
            <p className="text-caption text-muted">{item.fullExplanation}</p>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-surface/90 px-5 py-4 backdrop-blur-sm border-t border-black/[0.06]">
          <button
              onClick={() => { if (item && !isInCart) addToCart(item); }}
              className={`w-full rounded-full py-4 text-body font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isInCart ? "bg-muted/20 text-muted" : "bg-primary text-surface"
              }`}
          >
            {isInCart
                ? <><Check size={18} /> {tx.added}</>
                : <><Plus size={18} /> {tx.addToCart}</>
            }
          </button>
        </div>
      </div>
  );
}