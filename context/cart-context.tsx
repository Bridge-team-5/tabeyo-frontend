"use client";

import { createContext, useContext, useState } from "react";
import type { MenuItem } from "@/types/menu";

export type CartItem = {
  item: MenuItem;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
        prev
        .map((c) =>
            c.item.id === id ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  const totalCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
      <CartContext.Provider
          value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalCount }}
      >
        {children}
      </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}