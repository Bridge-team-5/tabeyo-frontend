"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ShoppingCart, X, Plus, Minus, Trash2,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/constants/language";
import type { MenuItem, MenuResponse, RecommendItem } from "@/types/menu";

// ── 스켈레톤 ──────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
      <div className={`animate-pulse rounded-xl bg-black/[0.06] ${className ?? ""}`} />
  );
}

function MenuCardSkeleton() {
  return (
      <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
        <Skeleton className="h-[90px] w-[90px] shrink-0 !rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 !rounded-full" />
      </div>
  );
}

function MenuListSkeleton() {
  return (
      <div className="relative min-h-screen bg-background">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-5 py-4 backdrop-blur-sm border-b border-black/[0.06]">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-24 !rounded-full" />
        </div>
        {/* 카드 목록 */}
        <div className="flex flex-col gap-3 px-4 py-4 pb-28">
          {Array.from({ length: 5 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
          ))}
        </div>
      </div>
  );
}

// ── 고추 아이콘 ───────────────────────────────────────────────
function Spiciness({ level }: { level: number }) {
  if (!level) return null;
  return (
      <div className="flex gap-0.5">
        {Array.from({ length: level }).map((_, i) => (
            <span key={i} className="text-[13px]">🌶️</span>
        ))}
      </div>
  );
}

// ── 메뉴 카드 ─────────────────────────────────────────────────
function MenuCard({
                    item,
                    onAdd,
                    added,
                    recommendReason,
                    onClick,
                  }: {
  item: MenuItem;
  onAdd: () => void;
  added: boolean;
  recommendReason?: string;
  onClick: () => void;
}) {
  const { language } = useLanguage();
  const tx = languages[language];

  return (
      <div
          className="flex items-center gap-3 rounded-2xl bg-surface p-3 cursor-pointer active:opacity-80 transition-opacity"
          onClick={onClick}
      >
        {/* 사진 */}
        <div className="h-[90px] w-[90px] shrink-0 rounded-xl bg-background flex items-center justify-center overflow-hidden">
          {item.imageUrls?.[0] ? (
              <img
                  src={item.imageUrls[0]}
                  alt={item.translatedName || item.originalName}
                  className="h-full w-full object-cover"
              />
          ) : (
              <span className="text-caption text-muted">photo</span>
          )}
        </div>

        {/* 텍스트 */}
        <div className="flex-1 min-w-0">
          <p className="text-body font-bold text-primary leading-tight truncate">
            {item.translatedName || item.originalName}
          </p>
          {recommendReason ? (
              <p className="mt-1 text-caption text-muted line-clamp-2">{recommendReason}</p>
          ) : (
              <>
                <p className="mt-1 text-caption text-muted line-clamp-2">{item.shortDescription}</p>
                {item.potentialAllergens.length > 0 && (
                    <p className="mt-1 text-tiny text-muted/70">
                      {tx.allergyRisks}: {item.potentialAllergens.join(", ")}
                    </p>
                )}
                <div className="mt-1">
                  <Spiciness level={item.spicinessLevel} />
                </div>
              </>
          )}
        </div>

        {/* + 버튼 */}
        <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            className={`shrink-0 h-9 w-9 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
                added ? "bg-primary border-primary" : "bg-transparent border-muted/40"
            }`}
        >
          {added
              ? <span className="text-surface text-tiny font-bold">✓</span>
              : <Plus size={16} className="text-primary" strokeWidth={2} />
          }
        </button>
      </div>
  );
}

// ── 장바구니 모달 ─────────────────────────────────────────────
function CartModal({ onClose }: { onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const { language } = useLanguage();
  const tx = languages[language];
  const router = useRouter();

  const total = cart.reduce((sum, c) => sum + c.item.price.amount * c.quantity, 0);
  const currency = cart[0]?.item.price.currency ?? "";

  return (
      <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
          onClick={onClose}
      >
        <div
            className="flex flex-col rounded-t-3xl bg-surface max-h-[80svh]"
            onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/[0.06]">
            <h2 className="text-title font-bold text-primary">{tx.cart}</h2>
            <button onClick={onClose}>
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* 아이템 목록 */}
          <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3">
            {cart.length === 0 ? (
                <p className="text-center text-muted py-10 text-caption">{tx.cartEmpty}</p>
            ) : (
                cart.map(({ item, quantity }) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="h-14 w-14 shrink-0 rounded-xl bg-background flex items-center justify-center overflow-hidden">
                        {item.imageUrls?.[0] ? (
                            <img
                                src={item.imageUrls[0]}
                                alt={item.translatedName || item.originalName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-tiny text-muted">photo</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-caption font-semibold text-primary truncate">
                          {item.translatedName || item.originalName}
                        </p>
                        <p className="text-tiny text-muted">
                          {item.price.currency} {item.price.amount.toLocaleString()}
                        </p>
                      </div>
                      {/* 수량 조절 */}
                      <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-7 w-7 rounded-full bg-background flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Minus size={12} className="text-primary" />
                        </button>
                        <span className="text-caption font-bold text-primary w-4 text-center">
                    {quantity}
                  </span>
                        <button
                            onClick={() => updateQuantity(item.id, +1)}
                            className="h-7 w-7 rounded-full bg-background flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Plus size={12} className="text-primary" />
                        </button>
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-1 h-7 w-7 rounded-full bg-background flex items-center justify-center active:scale-90 transition-transform"
                        >
                          <Trash2 size={12} className="text-muted" />
                        </button>
                      </div>
                    </div>
                ))
            )}
          </div>

          {/* 합계 + 주문 버튼 */}
          {cart.length > 0 && (
              <div className="px-5 pt-3 pb-8 border-t border-black/[0.06] flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-caption text-muted">{tx.total}</span>
                  <span className="text-body font-bold text-primary">
                {currency} {total.toLocaleString()}
              </span>
                </div>
                <button
                    onClick={() => {
                      sessionStorage.setItem("orderData", JSON.stringify(cart));
                      clearCart();
                      router.push("/result");
                    }}
                    className="w-full rounded-full bg-primary py-4 text-body font-bold text-surface active:scale-[0.98] transition-transform"
                >
                  {tx.order}
                </button>
              </div>
          )}
        </div>
      </div>
  );
}

// ── 추천 입력 모달 ────────────────────────────────────────────
function RecommendInputModal({
                               onClose,
                               onSubmit,
                             }: {
  onClose: () => void;
  onSubmit: (params: { allergy: string; budget: string; numPeople: string; etc: string }) => void;
}) {
  const { language } = useLanguage();
  const tx = languages[language];
  const [allergy, setAllergy] = useState("");
  const [budget, setBudget] = useState("");
  const [numPeople, setNumPeople] = useState("");
  const [etc, setEtc] = useState("");

  const inputClass =
      "flex-1 rounded-xl bg-background px-3 py-2.5 text-caption text-primary outline-none placeholder:text-muted/50";

  return (
      <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
          onClick={onClose}
      >
        <div
            className="flex flex-col gap-4 rounded-t-3xl bg-surface px-5 pt-5 pb-10"
            onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: tx.allergy, value: allergy, set: setAllergy },
            { label: tx.budget, value: budget, set: setBudget },
            { label: tx.numPeople, value: numPeople, set: setNumPeople },
            { label: tx.etc, value: etc, set: setEtc },
          ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-24 text-caption font-semibold text-primary shrink-0">{label}</span>
                <input
                    className={inputClass}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                />
              </div>
          ))}

          <button
              onClick={() => onSubmit({ allergy, budget, numPeople, etc })}
              className="mt-1 w-full rounded-full bg-primary py-3.5 text-body font-bold text-surface active:scale-[0.98] transition-transform"
          >
            {tx.done}
          </button>
        </div>
      </div>
  );
}

// ── 추천 결과 모달 ────────────────────────────────────────────
function RecommendResultModal({
                                results,
                                menuItems,
                                onClose,
                              }: {
  results: RecommendItem[];
  menuItems: MenuItem[];
  onClose: () => void;
}) {
  const { addToCart, cart } = useCart();
  const router = useRouter();
  const isInCart = (id: string) => cart.some((c) => c.item.id === id);

  return (
      <div
          className="fixed inset-0 z-50 flex flex-col justify-start pt-20 bg-black/30"
          onClick={onClose}
      >
        <div
            className="mx-4 rounded-3xl bg-surface flex flex-col max-h-[70svh]"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end px-4 pt-4 pb-2">
            <button onClick={onClose}>
              <X size={18} className="text-muted" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-5 flex flex-col gap-3">
            {results.map(({ id, reason }) => {
              const item = menuItems.find((m) => m.id === id);
              if (!item) return null;
              return (
                  <MenuCard
                      key={id}
                      item={item}
                      recommendReason={reason}
                      onAdd={() => addToCart(item)}
                      added={isInCart(id)}
                      onClick={() => router.push(`/menu/detailed/${id}`)}
                  />
              );
            })}
          </div>
        </div>
      </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────
export default function MenuPage() {
  const router = useRouter();
  const { addToCart, cart, totalCount } = useCart();
  const { language } = useLanguage();
  const tx = languages[language];

  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showRecommendInput, setShowRecommendInput] = useState(false);
  const [recommendResults, setRecommendResults] = useState<RecommendItem[] | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);

  const isInCart = (id: string) => cart.some((c) => c.item.id === id);

  useEffect(() => {
    const raw = sessionStorage.getItem("menuData");
    if (raw) {
      try {
        setMenuData(JSON.parse(raw));
      } catch {
        console.error("Failed to parse menuData");
      }
    } else {
      // 개발용 더미 데이터
      setMenuData({
        detectedLanguage: "ja",
        items: Array.from({ length: 6 }, (_, i) => ({
          id: `${i}`,
          originalName: `メニュー ${i + 1}`,
          translatedName: `Menu Item ${i + 1}`,
          category: "Main",
          price: { amount: 1200 + i * 300, currency: "¥" },
          shortDescription: "Short explanation maximum 2 lines of this delicious dish.",
          fullExplanation: "This is a detailed explanation of the dish including cooking method and origin.",
          spicinessLevel: i % 4,
          likelyIngredients: ["rice", "soy sauce"],
          potentialAllergens: i % 2 === 0 ? ["gluten", "soy"] : [],
          dietaryFlags: [],
          hasImageInMenu: false,
          boundingBox: [0, 0, 0, 0],
          imageUrls: [],
          imageSearchQuery: `menu item ${i + 1}`,
        })),
      });
    }
    setLoading(false);
  }, []);

  if (loading) return <MenuListSkeleton />;

  const handleRecommend = async (params: {
    allergy: string; budget: string; numPeople: string; etc: string;
  }) => {
    setShowRecommendInput(false);
    setIsRecommending(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, menuItems: menuData?.items }),
      });
      const data: RecommendItem[] = await res.json();
      setRecommendResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecommending(false);
    }
  };

  return (
      <div className="relative min-h-screen bg-background">

        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-5 py-4 backdrop-blur-sm border-b border-black/[0.06]">
          <button onClick={() => router.back()} className="active:opacity-60 transition-opacity">
            <ArrowLeft size={22} className="text-primary" />
          </button>
          <button
              onClick={() => setShowRecommendInput(true)}
              disabled={isRecommending}
              className="rounded-full bg-primary px-5 py-2 text-caption font-bold text-surface active:scale-95 transition-transform disabled:opacity-50"
          >
            {isRecommending ? "..." : tx.recommend}
          </button>
        </div>

        {/* 메뉴 리스트 */}
        <div className="flex flex-col gap-3 px-4 py-4 pb-28">
          {menuData?.items.map((item) => (
              <MenuCard
                  key={item.id}
                  item={item}
                  onAdd={() => addToCart(item)}
                  added={isInCart(item.id)}
                  onClick={() => router.push(`/menu/detailed/${item.id}`)}
              />
          ))}
        </div>

        {/* 장바구니 FAB */}
        <button
            onClick={() => setShowCart(true)}
            className="fixed bottom-8 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-90 transition-transform"
        >
          <ShoppingCart size={22} className="text-surface" />
          {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
            {totalCount}
          </span>
          )}
        </button>

        {/* 모달 */}
        {showCart && <CartModal onClose={() => setShowCart(false)} />}
        {showRecommendInput && (
            <RecommendInputModal
                onClose={() => setShowRecommendInput(false)}
                onSubmit={handleRecommend}
            />
        )}
        {recommendResults && menuData && (
            <RecommendResultModal
                results={recommendResults}
                menuItems={menuData.items}
                onClose={() => setRecommendResults(null)}
            />
        )}
      </div>
  );
}