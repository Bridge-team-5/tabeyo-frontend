"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/constants/language";
import type { MenuItem } from "@/types/menu";

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

function Skeleton({ className }: { className?: string }) {
  return (
      <div className={`animate-pulse rounded-xl bg-black/[0.06] ${className ?? ""}`} />
  );
}

function DetailSkeleton() {
  return (
      <div className="min-h-screen bg-surface pb-28">
        <div className="flex items-center bg-surface px-5 py-4 border-b border-black/[0.06]">
          <div className="h-6 w-6 rounded-lg bg-black/[0.06] animate-pulse" />
        </div>
        <div className="px-5 py-5 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-1/4 mt-1" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[120px] w-[120px] shrink-0 !rounded-2xl" />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
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
  const tx = languages[language];

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  const isInCart = cart.some((c) => String(c.item.id) == String(id));

  useEffect(() => {
    const raw = sessionStorage.getItem("menuData");
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      // sessionStorage에 저장된 구조:
      // - 카메라 페이지 저장: SessionResponse { id(uuid), status, targetLanguage, items: MenuItemDto[] }
      // - items 안의 각 MenuItemDto는 id가 number
      // parsed.items 로 접근하는 것이 항상 올바른 경로
      const items: any[] = Array.isArray(parsed.items) ? parsed.items : [];
      const rawItem = items.find((m: any) => String(m.id) == String(id));

      if (rawItem) {
        const normalized: MenuItem = {
          ...rawItem,
          id: String(rawItem.id),
          category: rawItem.category ?? "",
          price: rawItem.price ?? { amount: 0, currency: "" },
          shortDescription: rawItem.shortDescription ?? "",
          fullExplanation: rawItem.fullExplanation ?? "",
          spicinessLevel: rawItem.spicinessLevel ?? 0,
          likelyIngredients: rawItem.likelyIngredients ?? [],
          potentialAllergens: rawItem.potentialAllergens ?? [],
          dietaryFlags: rawItem.dietaryFlags ?? [],
          boundingBox: rawItem.boundingBox ?? [0, 0, 0, 0],
          // 백엔드가 단수형 "imageUrl"로 줄 수도 있으므로 배열로 통일
          imageUrls: rawItem.imageUrl
              ? [rawItem.imageUrl]
              : (rawItem.imageUrls ?? []),
          imageSearchQuery: rawItem.imageSearchQuery ?? "",
        };
        setItem(normalized);
      } else {
        console.warn(
            `[DetailPage] id="${id}" 를 가진 아이템을 찾지 못했습니다.`,
            "저장된 items:", items.map((m: any) => m.id)
        );
        setItem(null);
      }
    } catch (error) {
      console.error("상세 페이지 파싱 중 에러 발생:", error);
      setItem(null);
    }

    setLoading(false);
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (!item) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
          <p className="text-caption text-muted">{tx.notFound || "Menu item not found."}</p>
          <button
              onClick={() => router.back()}
              className="rounded-full bg-primary px-5 py-2 text-caption font-bold text-surface"
          >
            돌아가기
          </button>
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
            {item.price && item.price.amount > 0 && (
                <p className="mt-2 text-body font-semibold text-primary">
                  {item.price.currency} {item.price.amount.toLocaleString()}
                </p>
            )}
          </div>

          {/* 사진 가로 스크롤 */}
          {item.imageUrls && item.imageUrls.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {item.imageUrls.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={item.translatedName || item.originalName}
                        className="h-[120px] w-[120px] shrink-0 rounded-2xl object-cover"
                    />
                ))}
              </div>
          ) : (
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
          )}

          {/* 설명 */}
          <div className="flex flex-col gap-1.5">
            <p className="text-body text-primary leading-relaxed whitespace-pre-wrap">
              {item.fullExplanation || item.shortDescription || "No detailed explanation available."}
            </p>
          </div>

          {/* 매운 정도 */}
          {item.spicinessLevel > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.spiciness}</p>
                <Spiciness level={item.spicinessLevel} />
              </div>
          )}

          {/* 재료 */}
          {item.likelyIngredients && item.likelyIngredients.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-tiny font-semibold text-muted uppercase tracking-wide">{tx.ingredients}</p>
                <p className="text-body text-primary">{item.likelyIngredients.join(", ")}</p>
              </div>
          )}

          {/* 알레르기 */}
          {item.potentialAllergens && item.potentialAllergens.length > 0 && (
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
          {item.dietaryFlags && item.dietaryFlags.length > 0 && (
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

          {/* 상세 설명 박스 */}
          <div className="rounded-2xl bg-background p-4 border border-black/[0.02]">
            <p className="text-tiny font-semibold text-muted uppercase tracking-wide mb-2">
              {tx.detailedIngredients || "Detailed Info"}
            </p>
            <p className="text-caption text-muted leading-relaxed">
              {item.fullExplanation || "Detailed menu content analysis."}
            </p>
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