"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { languages } from "@/constants/language";
import type { CartItem } from "@/context/cart-context";

export default function ResultPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const tx = languages[language];

  const [orderItems, setOrderItems] = useState<CartItem[]>([]);

  // 장바구니 데이터를 sessionStorage에서 불러옴
  // (cart-context가 메모리 상태이므로, order 시점에 저장 필요)
  useEffect(() => {
    const raw = sessionStorage.getItem("orderData");
    if (raw) {
      try {
        setOrderItems(JSON.parse(raw));
      } catch {
        console.error("Failed to parse orderData");
      }
    }
  }, []);

  return (
      <div className="relative min-h-screen bg-surface">

        {/* 헤더 */}
        <div className="flex items-center bg-surface px-5 py-4 border-b border-black/[0.06]">
          <button
              onClick={() => router.back()}
              className="active:opacity-60 transition-opacity"
          >
            <ArrowLeft size={22} className="text-primary" />
          </button>
        </div>

        <div className="px-6 py-8 flex flex-col gap-8">

          {/* Show this page to server */}
          <p className="text-center text-caption text-muted">
            {tx.showToServer}
          </p>

          {/* 주문 목록 */}
          <ul className="flex flex-col gap-4">
            {orderItems.map(({ item, quantity }) => (
                <li key={item.id} className="flex items-baseline gap-2">
                  {/* 불릿 */}
                  <span className="text-body text-primary shrink-0">•</span>
                  <span className="text-body font-bold text-primary">
                {item.originalName}
                    {quantity > 1 && (
                        <span className="ml-2 text-body font-bold text-primary">
                    × {quantity}
                  </span>
                    )}
              </span>
                </li>
            ))}
          </ul>
        </div>

        {/* 홈 FAB */}
        <button
            onClick={() => router.push("/")}
            className="fixed bottom-8 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg active:scale-90 transition-transform"
        >
          <Home size={22} className="text-surface" />
        </button>
      </div>
  );
}